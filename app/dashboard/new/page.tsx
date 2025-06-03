'use client';

import { createCourse } from './actions';
import { checkSlugExists } from './slug-actions';
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
import { useState, useEffect, useCallback } from 'react';
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
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  const [bannerDimensionError, setBannerDimensionError] = useState('');
  // Add state for image dimensions
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { toast } = useToast();

  // Global Image object for banner validation
  const img = new Image();

  const bannerUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: 'banner',
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    recommendedSize: "1728 x 220",
  });

  const thumbnailUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: 'thumbnail',
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    recommendedSize: "1920 x 1080",
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

  // Validate banner image dimensions
  useEffect(() => {
    if (bannerUpload.files.length > 0) {
      const file = bannerUpload.files[0];
      // Using the global img variable
      img.onload = () => {
        // Set the image dimensions when the image loads
        setImgWidth(img.width);
        setImgHeight(img.height);
        setImgLoaded(true);

        if (img.width !== 1728 || img.height !== 220) {
          setBannerDimensionError(`Image must be exactly 1728 x 220 pixels. Current size: ${img.width} x ${img.height}`);
        } else {
          setBannerDimensionError('');
        }
      };
      img.onerror = () => {
        setBannerDimensionError('Error loading image. Please try again.');
        setImgLoaded(false);
      };
      img.src = file.preview || '';
    } else {
      setBannerDimensionError('');
      setImgLoaded(false);
    }
  }, [bannerUpload.files]);

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
    const newSlug = generateSlug(newTitle);
    setSlug(newSlug);
    validateSlug(newSlug);
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

  // Debounced slug validation function
  const validateSlug = useCallback((value: string) => {
    // Clear previous error
    setSlugError('');

    // Don't validate empty slugs
    if (!value.trim()) return;

    // Check if slug format is valid
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      setSlugError('Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    // Set checking state and create a timeout
    setIsCheckingSlug(true);

    // Clear any existing timeout
    const timeoutId = setTimeout(async () => {
      try {
        // Check if slug exists in database
        const exists = await checkSlugExists(value);
        if (exists) {
          setSlugError('This slug is already taken');
        }
      } catch (error) {
        console.error('Error validating slug:', error);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500); // 500ms delay to avoid frequent requests

    // Clean up function to clear the timeout if component unmounts or slug changes again
    return () => clearTimeout(timeoutId);
  }, []);

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   // Check if slug exists before submitting
  //   if (slugError) {
  //     toast({
  //       title: "Validation Error",
  //       description: "Please fix the slug error before submitting",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Perform one final check to ensure slug doesn't exist
  //   setIsCheckingSlug(true);
  //   try {
  //     const exists = await checkSlugExists(slug);
  //     if (exists) {
  //       setSlugError('This slug is already taken');
  //       toast({
  //         title: "Validation Error",
  //         description: "This slug is already taken. Please choose a different one.",
  //         variant: "destructive",
  //       });
  //       setIsCheckingSlug(false);
  //       return;
  //     }

  //     setIsSubmitting(true);
  //     const formData = new FormData(event.currentTarget);
  //     await createCourse(formData);
  //     toast({
  //       title: "Success",
  //       description: "Course created successfully!",
  //       variant: "default",
  //     });
  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
  //     toast({
  //       title: "Error",
  //       description: errorMessage,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //     setIsCheckingSlug(false);
  //   }
  // };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log('submit', event, event.currentTarget);
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
              <div className="relative">
                <Input
                  id="slug"
                  name="slug"
                  placeholder="Enter URL slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    validateSlug(e.target.value);
                  }}
                  className={slugError ? "border-red-500" : ""}
                />
                {isCheckingSlug && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {slugError && <p className="text-sm text-red-500">{slugError}</p>}
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
              <div className="text-xs text-muted-foreground">Required size: 1728 x 220 pixels</div>
              <Dropzone {...bannerUpload}>
                {bannerUpload.files.length === 0 ? (
                  <DropzoneEmptyState className="h-32" />
                ) : (
                  <DropzoneContent className="h-32" maxWidth={1728} maxHeight={220} imageWidth={imgLoaded ? imgWidth : 0} imageHeight={imgLoaded ? imgHeight : 0} />
                )}
              </Dropzone>
              {/* {bannerDimensionError && (
                <div className="text-sm text-destructive mt-1">{bannerDimensionError}</div>
              )} */}
              <input type="hidden" name="bannerUrl" value={bannerUrl} />
              {/* {bannerUpload.files.length > 0 && !bannerUpload.isSuccess && !bannerDimensionError && (
                <Button
                  type="button"
                  onClick={() => bannerUpload.onUpload(bannerUpload.files)}
                  disabled={bannerUpload.loading || !!bannerDimensionError}
                >
                  {bannerUpload.loading ? 'Uploading...' : 'Upload Banner'}
                </Button>
              )} */}
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
              {/* {thumbnailUpload.files.length > 0 && !thumbnailUpload.isSuccess && (
                <Button type="button" onClick={thumbnailUpload.onUpload} disabled={thumbnailUpload.loading}>
                  {thumbnailUpload.loading ? 'Uploading...' : 'Upload Thumbnail'}
                </Button>
              )} */}
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
              {/* {brochureUpload.files.length > 0 && !brochureUpload.isSuccess && (
                <Button type="button" onClick={brochureUpload.onUpload} disabled={brochureUpload.loading}>
                  {brochureUpload.loading ? 'Uploading...' : 'Upload Brochure'}
                </Button>
              )} */}
            </div>

            <div className="space-y-4 mt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isCheckingSlug || !!slugError}
                className="w-full">
                {isSubmitting ? 'Creating Course...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
