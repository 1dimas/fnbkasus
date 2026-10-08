import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getLocalOrders, addLocalOrder } from '@/lib/orders-store';
import { OrderRecord } from '@/types';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_code,
          table_number,
          customer_name,
          order_type,
          general_notes,
          total_amount,
          status,
          created_at,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            price,
            subtotal,
            notes
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedOrders: OrderRecord[] = data.map((item) => ({
          id: item.id,
          orderCode: item.order_code,
          tableNumber: item.table_number,
          customerName: item.customer_name,
          orderType: item.order_type as 'dine-in' | 'takeaway',
          generalNotes: item.general_notes,
          totalAmount: item.total_amount,
          status: item.status,
          createdAt: item.created_at,
          items: (item.order_items || []).map((oi: any) => ({
            id: oi.id,
            productId: oi.product_id,
            productName: oi.product_name,
            quantity: oi.quantity,
            price: oi.price,
            subtotal: oi.subtotal,
            notes: oi.notes,
          })),
        }));

        return NextResponse.json({ success: true, source: 'supabase', orders: formattedOrders });
      }
    }
  } catch (err) {
    console.error('Error querying Supabase orders, falling back to local store:', err);
  }

  return NextResponse.json({
    success: true,
    source: 'local',
    orders: getLocalOrders(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber, customerName, orderType, generalNotes, items, totalAmount } = body;

    if (!tableNumber || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nomor meja dan item pesanan harus diisi.' },
        { status: 400 }
      );
    }

    const orderCode = `NB-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: OrderRecord = {
      id: Date.now(),
      orderCode,
      tableNumber,
      customerName: customerName || 'Tamu',
      orderType: orderType || 'dine-in',
      generalNotes: generalNotes || '',
      totalAmount: totalAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: items.map((i: any, idx: number) => ({
        id: idx + 1,
        productId: i.product?.id,
        productName: i.product?.name || i.productName,
        quantity: i.quantity,
        price: i.product?.price || i.price,
        subtotal: (i.product?.price || i.price) * i.quantity,
        notes: i.notes || '',
      })),
    };

    // Save to local memory store
    addLocalOrder(newOrder);

    // If Supabase is connected, insert to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_code: newOrder.orderCode,
            table_number: newOrder.tableNumber,
            customer_name: newOrder.customerName,
            order_type: newOrder.orderType,
            general_notes: newOrder.generalNotes,
            total_amount: newOrder.totalAmount,
            status: 'pending',
          })
          .select()
          .single();

        if (!orderErr && orderData) {
          const orderItemsData = newOrder.items.map((it) => ({
            order_id: orderData.id,
            product_id: it.productId,
            product_name: it.productName,
            quantity: it.quantity,
            price: it.price,
            subtotal: it.subtotal,
            notes: it.notes,
          }));

          await supabase.from('order_items').insert(orderItemsData);
        }
      } catch (sbErr) {
        console.error('Failed to insert order to Supabase:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dicatat.',
      order: newOrder,
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pesanan.' },
      { status: 500 }
    );
  }
}
