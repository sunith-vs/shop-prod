'use client';

import { createCourse } from './actions';
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
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const dynamic = 'force-dynamic';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewCourse() {
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  const { toast } = useToast();

  const bannerUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: 'banner',
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
  });

  const thumbnailUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: 'thumbnail',
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
  });

  const brochureUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: 'brochure',
    allowedMimeTypes: ['application/pdf'],
    maxFiles: 1,
  });

  useEffect(() => {
    if (bannerUpload.isSuccess && bannerUpload.successes.length > 0) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/banner/${bannerUpload.successes[0]}`;
      setBannerUrl(url);
    }
  }, [bannerUpload.isSuccess, bannerUpload.successes]);

  useEffect(() => {
    if (thumbnailUpload.isSuccess && thumbnailUpload.successes.length > 0) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/thumbnail/${thumbnailUpload.successes[0]}`;
      setThumbnailUrl(url);
    }
  }, [thumbnailUpload.isSuccess, thumbnailUpload.successes]);

  useEffect(() => {
    if (brochureUpload.isSuccess && brochureUpload.successes.length > 0) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/brochure/${brochureUpload.successes[0]}`;
      setBrochureUrl(url);
    }
  }, [brochureUpload.isSuccess, brochureUpload.successes]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const addHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = highlights.filter((_, i) => i !== index);
    if (newHighlights.length === 0) {
      setHighlights(['']);
    } else {
      setHighlights(newHighlights);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData(event.currentTarget);
      await createCourse(formData);
      toast({
        title: "Success",
        description: "Course created successfully!",
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter course title"
                required
                value={title}
                onChange={handleTitleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="slug"
                name="slug"
                placeholder="Enter URL slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
              <label className="text-sm font-medium">
                Highlights
              </label>
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    name="highlights[]"
                    placeholder="Enter highlight"
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeHighlight(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addHighlight}
                className="w-full"
              >
                Add Highlight
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Banner Image</label>
              <Dropzone {...bannerUpload}>
                {bannerUpload.files.length === 0 ? (
                  <DropzoneEmptyState className="h-32" />
                ) : (
                  <DropzoneContent className="h-32" />
                )}
              </Dropzone>
              <input type="hidden" name="bannerUrl" value={bannerUrl} />
              {bannerUpload.files.length > 0 && !bannerUpload.isSuccess && (
                <Button type="button" onClick={bannerUpload.onUpload} disabled={bannerUpload.loading}>
                  {bannerUpload.loading ? 'Uploading...' : 'Upload Banner'}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail Image</label>
              <Dropzone {...thumbnailUpload}>
                {thumbnailUpload.files.length === 0 ? (
                  <DropzoneEmptyState className="h-32" />
                ) : (
                  <DropzoneContent className="h-32" />
                )}
              </Dropzone>
              <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
              {thumbnailUpload.files.length > 0 && !thumbnailUpload.isSuccess && (
                <Button type="button" onClick={thumbnailUpload.onUpload} disabled={thumbnailUpload.loading}>
                  {thumbnailUpload.loading ? 'Uploading...' : 'Upload Thumbnail'}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Brochure (PDF)</label>
              <Dropzone {...brochureUpload}>
                {brochureUpload.files.length === 0 ? (
                  <DropzoneEmptyState className="h-32" />
                ) : (
                  <DropzoneContent className="h-32" />
                )}
              </Dropzone>
              <input type="hidden" name="brochureUrl" value={brochureUrl} />
              {brochureUpload.files.length > 0 && !brochureUpload.isSuccess && (
                <Button type="button" onClick={brochureUpload.onUpload} disabled={brochureUpload.loading}>
                  {brochureUpload.loading ? 'Uploading...' : 'Upload Brochure'}
                </Button>
              )}
            </div>

            <div className="space-y-4 mt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating Course...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
