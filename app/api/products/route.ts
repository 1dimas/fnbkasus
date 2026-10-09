import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  getLocalProducts,
  addLocalProduct,
  updateLocalProduct,
  deleteLocalProduct,
  toggleLocalProductAvailability,
} from '@/lib/products-store';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          is_available,
          category_id,
          image_url,
          categories (
            id,
            name
          )
        `)
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        // Map database naming (snake_case) to frontend (camelCase)
        const formattedProducts = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: item.is_available,
          categoryId: item.category_id,
          imageUrl: item.image_url,
          category: item.categories,
        }));
        return NextResponse.json({ success: true, source: 'supabase', products: formattedProducts });
      }
    }
  } catch (err) {
    console.error('Error fetching products from Supabase, using prototype fallback:', err);
  }

  // Fallback to local in-memory prototype store
  return NextResponse.json({
    success: true,
    source: 'local',
    products: getLocalProducts(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, imageUrl, isAvailable, customizationConfig } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Nama menu dan harga harus diisi.' },
        { status: 400 }
      );
    }

    // Save to local prototype store
    const newProduct = addLocalProduct({
      name,
      description,
      price: Number(price),
      categoryId: Number(categoryId) || 2,
      imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      customizationConfig,
    });

    // If Supabase is configured, also persist to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').insert({
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          category_id: newProduct.categoryId,
          image_url: newProduct.imageUrl,
          is_available: newProduct.isAvailable,
        });
      } catch (sbErr) {
        console.error('Failed to sync new product to Supabase:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil ditambahkan.',
      product: newProduct,
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan menu.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID menu harus disertakan.' },
        { status: 400 }
      );
    }

    let updatedProduct;
    if (action === 'toggle-availability') {
      updatedProduct = toggleLocalProductAvailability(Number(id));
    } else {
      updatedProduct = updateLocalProduct(Number(id), updates);
    }

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Menu tidak ditemukan.' },
        { status: 404 }
      );
    }

    // If Supabase is configured, also update in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .update({
            ...(updates.name && { name: updates.name }),
            ...(updates.price !== undefined && { price: updates.price }),
            ...(updates.description !== undefined && { description: updates.description }),
            ...(updates.categoryId !== undefined && { category_id: updates.categoryId }),
            ...(updates.imageUrl !== undefined && { image_url: updates.imageUrl }),
            is_available: updatedProduct.isAvailable,
          })
          .eq('id', id);
      } catch (sbErr) {
        console.error('Failed to update product in Supabase:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil diperbarui.',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui menu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: 'ID menu harus disertakan.' },
        { status: 400 }
      );
    }

    const id = Number(idParam);
    const deleted = deleteLocalProduct(id);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (sbErr) {
        console.error('Failed to delete product from Supabase:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: deleted ? 'Menu berhasil dihapus.' : 'Menu tidak ditemukan.',
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus menu.' },
      { status: 500 }
    );
  }
}
