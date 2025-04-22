'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createCourse(formData: FormData) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    redirect('/login');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const subHeading = formData.get('subHeading') as string;
  const bannerUrl = formData.get('bannerUrl') as string;
  const thumbnailUrl = formData.get('thumbnailUrl') as string;
  const brochureUrl = formData.get('brochureUrl') as string;
  const slug = formData.get('slug') as string;
  const highlights = formData.getAll('highlights[]').filter(Boolean) as string[];

  const { error } = await supabase
    .from('courses')
    .insert([
      {
        title,
        description,
        sub_heading: subHeading,
        banner_url: bannerUrl,
        thumbnail: thumbnailUrl,
        brochure_url: brochureUrl,
        slug,
        highlights,
      }
    ]);

  if (error) {
    console.error('Error creating course:', error);
    if (error.code === '23505') {
      throw new Error('A course with this slug already exists');
    }
    throw new Error('Failed to create course');
  }

  revalidatePath('/dashboard');
  redirect(`/dashboard/${slug}/edit`);
}
