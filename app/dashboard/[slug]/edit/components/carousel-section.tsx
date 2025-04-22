'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseUpload, type UseSupabaseUploadReturn } from '@/hooks/use-supabase-upload'; // Import return type
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

  // Remove uploadKey state
  // const [uploadKey, setUploadKey] = useState(0);

  // Cast the hook result to include the reset function
  const imageUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: `carousel/${courseId}`,
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    // Remove key prop
    // key: uploadKey, 
  }) as UseSupabaseUploadReturn;

  const getYoutubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYoutubeVideoMetadata = async (videoId: string) => {
    try {
      // Using oEmbed API to get video metadata (no API key required)
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!response.ok) throw new Error(`oEmbed fetch failed with status ${response.status}`);
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
            // Reset upload state even if DB save fails
            imageUpload.reset(); 
            return;
          }

          // Update local state only after successful database save
          console.log('Updating UI state...');
          const updatedItems = [...items, newItem];
          setItems(updatedItems);
          onSave(updatedItems);
          console.log('UI state updated with new items:', updatedItems);

          // Clean up and reset upload state
          console.log('Cleaning up...');
          setIsUploadModalOpen(false);
          imageUpload.reset(); // Use reset function
          // setUploadKey(prev => prev + 1); // Remove key increment
        } catch (error) {
          console.error('Error saving to database:', error);
           // Reset upload state on catch
          imageUpload.reset();
        }
      };

      saveToDatabase();
    }
  }, [imageUpload.isSuccess, imageUpload.successes, items, courseId, onSave, imageUpload.reset]); // Added dependencies

  // Log errors and reset
  useEffect(() => {
    if (imageUpload.errors.length > 0) {
      console.error('Upload errors:', imageUpload.errors);
      // Optionally show error to user
      // Reset state on error
      // Consider if reset is needed here or if user should retry
      // imageUpload.reset(); 
      // setUploadKey(prev => prev + 1); // Remove key increment
    }
  }, [imageUpload.errors]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isUploadModalOpen) {
      imageUpload.reset(); // Reset on modal close
      // setUploadKey(prev => prev + 1); // Remove key increment
    }
  }, [isUploadModalOpen, imageUpload.reset]); // Added dependency

  const handleAddItem = (type: 'image' | 'youtube') => {
    setNewItemType(type);
    setNewUrl('');
    if (type === 'image') {
      imageUpload.reset(); // Reset before opening image modal
      setIsUploadModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSaveNewItem = async () => {
    if (!newUrl) return;

    const videoId = getYoutubeVideoId(newUrl);
    if (newItemType === 'youtube' && !videoId) {
      console.error('Invalid YouTube URL');
      // Optionally show error to user
      return;
    }

    let metadata = null;
    if (newItemType === 'youtube' && videoId) {
      metadata = await getYoutubeVideoMetadata(videoId);
      if (!metadata) {
        console.error('Could not fetch YouTube metadata');
        // Optionally proceed without metadata or show error
      }
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

    // Save YouTube video to database immediately
    const supabase = createClient();
    const { data, error } = await supabase
      .from('carousel')
      .insert({
        id: newItem.id,
        url: newItem.url,
        index: newItem.index,
        course_id: courseId,
        title: newItem.title, // Save metadata
        thumbnail: newItem.thumbnail // Save metadata
      });

    if (error) {
      console.error('Error saving YouTube item:', error);
      // Optionally show error to user
      return;
    }

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onSave(updatedItems); // Update parent state immediately
    setHasUnsavedChanges(false); // No unsaved changes after direct DB save
    setIsModalOpen(false);
    setNewUrl('');
  };

  const handleRemoveItem = async (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;

    // Remove from database
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('carousel')
      .delete()
      .match({ id: id });

    if (deleteError) {
        console.error('Error deleting item:', deleteError);
        // Optionally show error to user
        return;
    }

    // Remove from Supabase storage if it's an image
    if (itemToRemove.type === 'image') {
        try {
            const urlParts = itemToRemove.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `carousel/${courseId}/${fileName}`;
            const { error: storageError } = await supabase.storage
              .from('courses')
              .remove([filePath]);
            if (storageError) {
                console.error('Error removing image from storage:', storageError);
                // Decide if you want to proceed with UI update despite storage error
            }
        } catch (e) {
            console.error('Error parsing image URL for deletion:', e);
        }
    }

    const updatedItems = items.filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, index })); // Re-index
    setItems(updatedItems);
    onSave(updatedItems); // Update parent immediately after DB change
    setHasUnsavedChanges(false); // Reset unsaved changes flag if any
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(index, 1);
    updatedItems.splice(newIndex, 0, movedItem);

    // Update indices
    const finalItems = updatedItems.map((item, idx) => ({ ...item, index: idx }));

    setItems(finalItems);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges) return;

    const supabase = createClient();
    
    // Use upsert to update indices of all items
    const updates = items.map(item => ({
        id: item.id,
        index: item.index,
        // Include other fields needed for potential insert/update if necessary
        url: item.url,
        course_id: courseId,
        title: item.title,
        thumbnail: item.thumbnail
    }));

    const { error } = await supabase
        .from('carousel')
        .upsert(updates, { onConflict: 'id' }); // Upsert based on ID conflict

    if (error) {
        console.error('Error saving changes:', error);
        // Optionally show error to user
        return;
    }
    
    onSave(items); // Notify parent of the saved state
    setHasUnsavedChanges(false);
    console.log('Carousel changes saved successfully');
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
                      onError={(e) => { e.currentTarget.style.display = 'none'; /* Hide broken image */ }}
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
                        onError={(e) => { e.currentTarget.src = '/placeholder-video.png'; /* Fallback placeholder */ }}
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
                      aria-label="Move item up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  )}
                  {index < items.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveItem(item.id, 'down')}
                      aria-label="Move item down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
                No carousel items added yet.
            </div>
          )}
        </div>
      </CardContent>
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleSaveChanges}
            className="flex items-center gap-2 shadow-lg"
            size="lg"
          >
            <Save className="h-4 w-4" />
            Save Carousel Order
          </Button>
        </div>
      )}

      {/* Add YouTube Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add YouTube Video
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="youtube-url" className="text-sm font-medium">YouTube URL</label>
              <Input
                id="youtube-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter YouTube video URL"
              />
              {newUrl && getYoutubeVideoId(newUrl) && (
                <div className="aspect-video mt-4 overflow-hidden rounded">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(newUrl)}`}
                    title="YouTube video preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
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
          imageUpload.reset(); // Reset on close
        }}
        title="Upload Image"
        type="image"
        upload={imageUpload} // Pass the whole hook result
      />
    </Card>
  );
}
