import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { updateLocalOrderStatus } from '@/lib/orders-store';
import { OrderStatus } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    const body = await request.json();
    const { status } = body as { status: OrderStatus };

    if (!['pending', 'diproses', 'selesai', 'dibatalkan'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status pesanan tidak valid.' },
        { status: 400 }
      );
    }

    // Update in local store
    updateLocalOrderStatus(numericId, status);

    // Update in Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status })
          .eq('id', numericId);
      } catch (sbErr) {
        console.error('Failed to update order status in Supabase:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Status pesanan berhasil diperbarui.',
      status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pesanan.' },
      { status: 500 }
    );
  }
}
