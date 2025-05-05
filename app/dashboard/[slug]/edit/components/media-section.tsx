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
    tag_url?: string;
  };
  onUpdate: (updates: Partial<{
    banner_url: string;
    thumbnail: string;
    brochure_url: string;
    tag_url: string;
  }>) => void;
}

type UploadType = 'banner' | 'thumbnail' | 'brochure' | 'tag' |null;

export function MediaSection({ courseId, initialData, onUpdate }: MediaSectionProps) {
  const [bannerUrl, setBannerUrl] = useState(initialData.banner_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData.thumbnail || '');
  const [brochureUrl, setBrochureUrl] = useState(initialData.brochure_url || '');
    const [tagUrl, setTagUrl] = useState(initialData.tag_url || '');
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
  const tagUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: 'tag',
    allowedMimeTypes: ['image/*'],
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
        if (tagUpload.isSuccess && tagUpload.successes.length > 0) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/tag/${tagUpload.successes[0]}`;
        setTagUrl(url);
        onUpdate({ tag_url: url });
        // Don't close modal immediately on success to show the preview
        }
    }, [tagUpload.isSuccess, tagUpload.successes]);

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
    const upload = activeUpload === 'banner' ? bannerUpload 
      : activeUpload === 'thumbnail' ? thumbnailUpload 
      : activeUpload === 'brochure' ? brochureUpload
        : activeUpload === 'tag' ? tagUpload
      : null;
      
    if (upload && !upload.loading) {
      // upload.setFiles([]);

      setActiveUpload(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tag Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-48 bg-muted rounded-lg overflow-hidden">
              {tagUrl ? (
                <>
                  <div className="aspect-[135/40]">
                    <Image
                      src={tagUrl}
                      alt="Tag"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveUpload('tag')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                </>
              ) : (
                <div className="aspect-[135/40] flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveUpload('tag')}
                  >
                    Upload Tag
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/*<Card>*/}
        {/*  <CardHeader>*/}
        {/*    <CardTitle>Tag Image</CardTitle>*/}
        {/*  </CardHeader>*/}
        {/*  <CardContent>*/}
        {/*    /!*<div className="aspect-[374/232] flex items-center justify-center">*!/*/}
        {/*    /!*  <Button*!/*/}
        {/*    /!*    variant="secondary"*!/*/}
        {/*    /!*    onClick={() => setActiveUpload('tag')}*!/*/}
        {/*    /!*  >*!/*/}
        {/*    /!*    Upload Tag Image*!/*/}
        {/*    /!*  </Button>*!/*/}
        {/*    /!*</div>*!/*/}
        {/*    {tagUrl ? (*/}
        {/*        <>*/}
        {/*          <div className="aspect-[374/232]">*/}
        {/*            <Image*/}
        {/*              src={tagUrl}*/}
        {/*              alt="tag"*/}
        {/*              fill*/}
        {/*              sizes="(max-width: 120) 50vw, (max-width: 120px) 50vw, 33vw"*/}
        {/*              className="object-contain"*/}
        {/*            />*/}
        {/*          </div>*/}
        {/*          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">*/}
        {/*            <Button*/}
        {/*              variant="secondary"*/}
        {/*              size="sm"*/}
        {/*              onClick={() => setActiveUpload('tag')}*/}
        {/*            >*/}
        {/*              <Edit className="h-4 w-4 mr-2" />*/}
        {/*              Change*/}
        {/*            </Button>*/}
        {/*          </div>*/}
        {/*        </>*/}
        {/*      ) : (*/}
        {/*        <div className="aspect-[374/232] flex items-center justify-center">*/}
        {/*          <Button*/}
        {/*            variant="secondary"*/}
        {/*            onClick={() => setActiveUpload('tag')}*/}
        {/*          >*/}
        {/*            Upload Tag Image*/}
        {/*          </Button>*/}
        {/*        </div>*/}
        {/*      )}*/}
        {/*  </CardContent>*/}
        {/*</Card>*/}

        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full bg-muted rounded-lg overflow-hidden">
              {bannerUrl ? (
                <>
                  <div className="aspect-[1728/245]">
                    <Image
                      src={bannerUrl}
                      alt="Banner"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 hover:bg-black/20 flex items-center justify-center">
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
                <div className="aspect-[1728/245] flex items-center justify-center">
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
            <div className="relative w-48 bg-muted rounded-lg overflow-hidden">
              {thumbnailUrl ? (
                <>
                  <div className="aspect-[374/232]">
                    <Image
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
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
                <div className="aspect-[374/232] flex items-center justify-center">
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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {brochureUrl ? 'Course Brochure' : 'No brochure uploaded'}
                  </p>
                  {brochureUrl && (
                    <p className="text-sm text-muted-foreground truncate">
                      PDF Document
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveUpload('brochure')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {brochureUrl ? 'Change' : 'Upload'}
                </Button>
              </div>
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
        isOpen={activeUpload === 'tag'}
        onClose={handleCloseModal}
        title="Upload Tag Image"
        type="image"
        upload={tagUpload}
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
