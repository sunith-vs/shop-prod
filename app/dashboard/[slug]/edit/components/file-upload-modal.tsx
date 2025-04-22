'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dropzone, DropzoneEmptyState, DropzoneContent } from '@/components/dropzone';
import { UseSupabaseUploadReturn } from '@/hooks/use-supabase-upload';
import { Button } from "@/components/ui/button";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'image' | 'pdf';
  upload: UseSupabaseUploadReturn;
}

export function FileUploadModal({
  isOpen,
  onClose,
  title,
  type,
  upload
}: FileUploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Dropzone {...upload}>
            {upload.files.length === 0 ? (
              <DropzoneEmptyState className="h-32" />
            ) : (
              <DropzoneContent className="h-32" />
            )}
          </Dropzone>
          {upload.files.length > 0 && !upload.isSuccess && (
            <Button 
              type="button" 
              onClick={upload.onUpload} 
              disabled={upload.loading}
              className="w-full"
            >
              {upload.loading ? 'Uploading...' : 'Upload File'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
