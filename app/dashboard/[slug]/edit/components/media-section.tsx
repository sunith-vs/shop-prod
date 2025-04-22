'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { FileUploadModal } from './file-upload-modal';
import { Edit, FileText } from 'lucide-react';

interface MediaSectionProps {
  courseId: string;
  initialData: {
    banner_url?: string;
    thumbnail?: string;
    brochure_url?: string;
  };
  onUpdate: (updates: Partial<{
    banner_url: string;
    thumbnail: string;
    brochure_url: string;
  }>) => void;
}

type UploadType = 'banner' | 'thumbnail' | 'brochure' | null;

export function MediaSection({ courseId, initialData, onUpdate }: MediaSectionProps) {
  const [bannerUrl, setBannerUrl] = useState(initialData.banner_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData.thumbnail || '');
  const [brochureUrl, setBrochureUrl] = useState(initialData.brochure_url || '');
  const [activeUpload, setActiveUpload] = useState<UploadType>(null);

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
      onUpdate({ banner_url: url });
      // Don't close modal immediately on success to show the preview
    }
  }, [bannerUpload.isSuccess, bannerUpload.successes]);

  useEffect(() => {
    if (thumbnailUpload.isSuccess && thumbnailUpload.successes.length > 0) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/thumbnail/${thumbnailUpload.successes[0]}`;
      setThumbnailUrl(url);
      onUpdate({ thumbnail: url });
      // Don't close modal immediately on success to show the preview
    }
  }, [thumbnailUpload.isSuccess, thumbnailUpload.successes]);

  useEffect(() => {
    if (brochureUpload.isSuccess && brochureUpload.successes.length > 0) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/brochure/${brochureUpload.successes[0]}`;
      setBrochureUrl(url);
      onUpdate({ brochure_url: url });
      // Don't close modal immediately on success to show the preview
    }
  }, [brochureUpload.isSuccess, brochureUpload.successes]);

  const handleCloseModal = () => {
    // Only close if there's no active upload
    if (
      (activeUpload === 'banner' && !bannerUpload.files.length) ||
      (activeUpload === 'thumbnail' && !thumbnailUpload.files.length) ||
      (activeUpload === 'brochure' && !brochureUpload.files.length)
    ) {
      setActiveUpload(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden group">
              {bannerUrl ? (
                <>
                  <Image
                    src={bannerUrl}
                    alt="Banner"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveUpload('banner')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Change Banner
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveUpload('banner')}
                  >
                    Upload Banner
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-48 h-48 bg-muted rounded-lg overflow-hidden group">
              {thumbnailUrl ? (
                <>
                  <Image
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveUpload('thumbnail')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveUpload('thumbnail')}
                  >
                    Upload Thumbnail
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Brochure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full p-6 bg-muted rounded-lg">
              {brochureUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Course Brochure</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveUpload('brochure')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveUpload('brochure')}
                  >
                    Upload Brochure
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <FileUploadModal
        isOpen={activeUpload === 'banner'}
        onClose={handleCloseModal}
        title="Upload Banner Image"
        type="image"
        upload={bannerUpload}
      />

      <FileUploadModal
        isOpen={activeUpload === 'thumbnail'}
        onClose={handleCloseModal}
        title="Upload Thumbnail Image"
        type="image"
        upload={thumbnailUpload}
      />

      <FileUploadModal
        isOpen={activeUpload === 'brochure'}
        onClose={handleCloseModal}
        title="Upload Course Brochure"
        type="pdf"
        upload={brochureUpload}
      />
    </>
  );
}
