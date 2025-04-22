'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCourseHighlights(slug: string, highlights: string[]) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('courses')
      .update({
        highlights: highlights.filter(Boolean),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (error) throw error;

    revalidatePath(`/dashboard/${slug}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Error updating highlights:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update highlights'
    };
  }
}

export async function updateCourseDetails(slug: string, data: {
  title: string;
  description: string;
  sub_heading: string;
  banner_url: string;
  thumbnail: string;
  brochure_url: string;
  course_type: string;
  popular: boolean;
  newSlug?: string;
}) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('courses')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (error) throw error;

    // If slug was changed, revalidate both old and new paths
    if (data.newSlug && data.newSlug !== slug) {
      revalidatePath(`/dashboard/${slug}/edit`);
      revalidatePath(`/dashboard/${data.newSlug}/edit`);
      return { success: true, redirect: `/dashboard/${data.newSlug}/edit` };
    }

    revalidatePath(`/dashboard/${slug}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Error updating course:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update course'
    };
  }
}
