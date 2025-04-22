'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Plus, X, ArrowUp, ArrowDown, Youtube, Save } from 'lucide-react';
import { FileUploadModal } from './file-upload-modal';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface CarouselItem {
  id: string;
  url: string;
  index: number;
  type: 'image' | 'youtube';
  title?: string;
  thumbnail?: string;
}

interface CarouselSectionProps {
  courseId: string;
  initialItems?: CarouselItem[];
  onSave: (items: CarouselItem[]) => void;
}

export function CarouselSection({ courseId, initialItems = [], onSave }: CarouselSectionProps) {
  const [items, setItems] = useState<CarouselItem[]>(
    initialItems.sort((a, b) => (a.index || 0) - (b.index || 0))
  );
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'image' | 'youtube'>('image');
  const [newUrl, setNewUrl] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const imageUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: `carousel/${courseId}`,
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
  });

  const getYoutubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYoutubeVideoMetadata = async (videoId: string) => {
    try {
      // Using oEmbed API to get video metadata (no API key required)
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      return {
        title: data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return null;
    }
  };

  useEffect(() => {
    if (imageUpload.isSuccess && imageUpload.successes.length > 0) {
      const fileName = imageUpload.successes[0];
      console.log('File uploaded successfully:', fileName);
      
      // Construct the public URL
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/carousel/${courseId}/${fileName}`;
      console.log('Constructed public URL:', url);
      
      // Generate a new item
      const newItem = {
        id: crypto.randomUUID(),
        url: url,
        index: items.length,
        type: 'image' as const
      };
      console.log('Created new carousel item:', newItem);

      // Save to database
      const saveToDatabase = async () => {
        try {
          console.log('Saving to carousel database...');
          const supabase = createClient();
          const { data, error } = await supabase
            .from('carousel')
            .insert({
              id: newItem.id,
              url: newItem.url,
              index: newItem.index,
              course_id: courseId,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          console.log('Database response:', { data, error });

          if (error) {
            console.error('Error saving to carousel:', error);
            return;
          }

          // Update local state only after successful database save
          console.log('Updating UI state...');
          const updatedItems = [...items, newItem];
          setItems(updatedItems);
          onSave(updatedItems);
          console.log('UI state updated with new items:', updatedItems);

          // Clean up
          console.log('Cleaning up...');
          setIsUploadModalOpen(false);
          imageUpload.setFiles([]);
        } catch (error) {
          console.error('Error saving to database:', error);
        }
      };

      saveToDatabase();
    }
  }, [imageUpload.isSuccess, imageUpload.successes]);

  useEffect(() => {
    // Log any upload errors
    if (imageUpload.errors.length > 0) {
      console.error('Upload errors:', imageUpload.errors);
    }
  }, [imageUpload.errors]);

  const handleAddItem = (type: 'image' | 'youtube') => {
    setNewItemType(type);
    setNewUrl('');
    if (type === 'image') {
      // Reset upload state before opening modal
      imageUpload.setFiles([]);
      imageUpload.setErrors([]);
      setIsUploadModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSaveNewItem = async () => {
    if (!newUrl) return;

    const videoId = getYoutubeVideoId(newUrl);
    if (newItemType === 'youtube' && !videoId) {
      return; // Invalid YouTube URL
    }

    let metadata = null;
    if (newItemType === 'youtube' && videoId) {
      metadata = await getYoutubeVideoMetadata(videoId);
    }

    const newItem: CarouselItem = {
      id: crypto.randomUUID(),
      url: newUrl,
      index: items.length,
      type: newItemType,
      ...(metadata && {
        title: metadata.title,
        thumbnail: metadata.thumbnail
      })
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setHasUnsavedChanges(true);
    setIsModalOpen(false);
    setNewUrl('');

    // Save to database immediately for YouTube videos
    if (newItemType === 'youtube') {
      const supabase = createClient();
      await supabase
        .from('carousel')
        .insert({
          id: newItem.id,
          url: newItem.url,
          index: newItem.index,
          course_id: courseId,
          title: newItem.title,
          thumbnail: newItem.thumbnail
        });
      onSave(updatedItems);
      setHasUnsavedChanges(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    const updatedItems = items
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, index }));
    
    setItems(updatedItems);
    if (editingItem?.id === id) {
      setEditingItem(null);
    }

    // Remove from database immediately
    const supabase = createClient();
    await supabase
      .from('carousel')
      .delete()
      .eq('id', id);
    
    onSave(updatedItems);
  };

  const handleMoveItem = async (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (direction === 'up' && index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      const updatedItems = newItems.map((item, idx) => ({ ...item, index: idx }));
      setItems(updatedItems);
      setHasUnsavedChanges(true);
    } else if (direction === 'down' && index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      const updatedItems = newItems.map((item, idx) => ({ ...item, index: idx }));
      setItems(updatedItems);
      setHasUnsavedChanges(true);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<CarouselItem>) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    const supabase = createClient();
    
    // Update all items in the database
    await supabase
      .from('carousel')
      .delete()
      .eq('course_id', courseId);

    if (items.length > 0) {
      await supabase
        .from('carousel')
        .insert(
          items.map(item => ({
            id: item.id,
            url: item.url,
            index: item.index,
            course_id: courseId,
            title: item.title,
            thumbnail: item.thumbnail
          }))
        );
    }

    onSave(items);
    setHasUnsavedChanges(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Carousel Items</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => handleAddItem('image')}
          >
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => handleAddItem('youtube')}
          >
            <Youtube className="h-4 w-4" />
            Add YouTube
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id} className={`relative overflow-hidden ${editingItem?.id === item.id ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="flex items-center gap-4 p-4">
                {item.type === 'image' ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded">
                    <Image
                      src={item.url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded">
                      <Image
                        src={item.thumbnail || `https://img.youtube.com/vi/${getYoutubeVideoId(item.url)}/hqdefault.jpg`}
                        alt={item.title || `Video ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Youtube className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium">
                        {item.title || `Video ${index + 1}`}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {item.url}
                      </div>
                    </div>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveItem(item.id, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  )}
                  {index < items.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveItem(item.id, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4">
          <Button
            onClick={handleSaveChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add YouTube Video
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube URL</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter YouTube video URL"
              />
              {newUrl && getYoutubeVideoId(newUrl) && (
                <div className="aspect-video mt-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(newUrl)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNewItem}>
                Add Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          imageUpload.setFiles([]);
          imageUpload.setErrors([]);
        }}
        title="Upload Image"
        type="image"
        upload={imageUpload}
      />
    </Card>
  );
}
