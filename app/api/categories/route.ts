import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_CATEGORIES } from '@/lib/mock-data';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'supabase',
          categories: [{ id: 0, name: 'Semua Menu' }, ...data],
        });
      }
    }
  } catch (err) {
    console.error('Error fetching categories from Supabase, using mock fallback:', err);
  }

  return NextResponse.json({
    success: true,
    source: 'local',
    categories: INITIAL_CATEGORIES,
  });
}
