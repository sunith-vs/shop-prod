'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import type { UseSupabaseUploadOptions } from '@/hooks/use-supabase-upload';

interface Icon {
  id: string;
  url: string;
  name: string;
}

interface IconSelectorProps {
  selectedIconId?: string;
  onSelect: (icon: Icon) => void;
}

export function IconSelector({ selectedIconId, onSelect }: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddIconOpen, setIsAddIconOpen] = useState(false);
  const [newIconName, setNewIconName] = useState('');
  const [addingIcon, setAddingIcon] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const supabase = createClient();

  const uploadOptions: UseSupabaseUploadOptions = {
    bucketName: 'courses',
    path: 'icons',
    maxFiles: 1,
    maxFileSize: 1024 * 1024, // 1MB
    allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg'],
    cacheControl: 3600,
    upsert: false
  };

  const uploadProps = useSupabaseUpload(uploadOptions);

  // Subscribe to successful uploads
  useEffect(() => {
    if (uploadProps.isSuccess && uploadProps.successes.length > 0) {
      const path = uploadProps.successes[0];
      const file = uploadProps.files[0];
      if (path && file) {
        setUploadedPath(path);
        setUploadedFileName(file.name);
        if (!newIconName) {
          setNewIconName(file.name.split('.')[0]);
        }
      }
    }
  }, [uploadProps.isSuccess, uploadProps.successes]);

  const getPublicUrl = (path: string) => {
    // If path already includes 'icons/', use it as is
    // Otherwise, prepend 'icons/' to ensure correct storage path
    const fullPath = path.startsWith('icons/') ? path : `icons/${path}`;
    const { data: { publicUrl } } = supabase.storage
      .from('courses')
      .getPublicUrl(fullPath);
    return publicUrl;
  };

  const handleSave = async () => {
    if (!uploadedPath || !uploadedFileName) {
      toast.error('Please upload an icon first');
      return;
    }

    setAddingIcon(true);
    try {
      const name = newIconName || uploadedFileName.split('.')[0];
      const publicUrl = getPublicUrl(uploadedPath);

      const { data, error } = await supabase
        .from('icons')
        .insert({
          url: publicUrl,
          name
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Icon added successfully');
      setIsAddIconOpen(false);
      setNewIconName('');
      setUploadedPath(null);
      setUploadedFileName(null);
      uploadProps.reset();
      fetchIcons();

      if (data) {
        onSelect(data);
      }
    } catch (error) {
      toast.error('Failed to add icon');
    } finally {
      setAddingIcon(false);
    }
  };

  const handleClose = () => {
    setIsAddIconOpen(false);
    setNewIconName('');
    setUploadedPath(null);
    setUploadedFileName(null);
    uploadProps.reset();
  };

  const fetchIcons = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('icons')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setIcons(data || []);
    } catch (error) {
      toast.error('Failed to load icons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIcons();
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsAddIconOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="h-[240px] flex justify-center items-center border rounded-md">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-[240px] overflow-y-auto rounded-md border">
            {icons.length === 0 ? (
              <div className="h-full flex flex-col gap-2 items-center justify-center text-muted-foreground">
                <p>No icons found</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddIconOpen(true)}
                >
                  Add Icons
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-2">
                {icons.map((icon) => (
                  <Button
                    key={icon.id}
                    variant={selectedIconId === icon.id ? 'default' : 'outline'}
                    className="h-50 aspect-square relative group"
                    onClick={() => onSelect(icon)}
                  >
                    <img src={icon.url} alt={icon.name} className="w-full h-full" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs text-center p-1">{icon.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={isAddIconOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Icon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Upload Icon</Label>
              <Dropzone {...uploadProps} className="mt-2">
                <DropzoneContent />
                <DropzoneEmptyState />
              </Dropzone>
            </div>
            <div>
              <Label>Icon Name (optional)</Label>
              <Input
                value={newIconName}
                onChange={(e) => setNewIconName(e.target.value)}
                placeholder="Enter icon name or leave empty to use file name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={addingIcon || !uploadedPath}
              >
                {addingIcon && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
