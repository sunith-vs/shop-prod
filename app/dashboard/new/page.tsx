import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function createCourse(formData: FormData) {
  'use server'
  
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
  const status = formData.get('status') as string;
  const brochureUrl = formData.get('brochureUrl') as string;
  const tagUrl = formData.get('tagUrl') as string;
  
  // Create a URL-friendly slug from the title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { error } = await supabase
    .from('courses')
    .insert([
      {
        title,
        description,
        sub_heading: subHeading,
        banner_url: bannerUrl,
        thumbnail: thumbnailUrl,
        status,
        brochure_url: brochureUrl,
        tag_url: tagUrl,
        slug,
      }
    ]);

  if (error) {
    console.error('Error creating course:', error);
    throw new Error('Failed to create course');
  }

  revalidatePath('/admin/courses');
  redirect('/admin/courses');
}

export default async function NewCourse() {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourse} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subHeading" className="text-sm font-medium">
                Sub Heading
              </label>
              <Input
                id="subHeading"
                name="subHeading"
                placeholder="Enter course sub heading"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter course description"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bannerUrl" className="text-sm font-medium">
                Banner URL
              </label>
              <Input
                id="bannerUrl"
                name="bannerUrl"
                type="url"
                placeholder="Enter banner image URL"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="thumbnailUrl" className="text-sm font-medium">
                Thumbnail URL
              </label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="url"
                placeholder="Enter thumbnail image URL"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="brochureUrl" className="text-sm font-medium">
                Brochure URL
              </label>
              <Input
                id="brochureUrl"
                name="brochureUrl"
                type="url"
                placeholder="Enter brochure URL"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tagUrl" className="text-sm font-medium">
                Tag URL
              </label>
              <Input
                id="tagUrl"
                name="tagUrl"
                type="url"
                placeholder="Enter tag URL"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">
                Create Course
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
