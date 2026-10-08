import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

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
    console.error('Error fetching products from Supabase, using mock fallback:', err);
  }

  // Fallback to initial mock data
  return NextResponse.json({
    success: true,
    source: 'local',
    products: INITIAL_PRODUCTS,
  });
}
