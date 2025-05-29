'use server';

import { createClient } from '@/lib/supabase/server';

export async function checkSlugExists(slug: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking slug:', error);
    throw new Error('Failed to check if slug exists');
  }
  
  return !!data;
}
