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

interface CarouselItem {
  id: string;
  url: string;
  index: number;
  type: 'image' | 'youtube';
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

    if (newItemType === 'youtube' && !getYoutubeVideoId(newUrl)) {
      return; // Invalid YouTube URL
    }

    const newItem: CarouselItem = {
      id: crypto.randomUUID(),
      url: newUrl,
      index: items.length,
      type: newItemType
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
          course_id: courseId
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

  const getYoutubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
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
            course_id: courseId
          }))
        );
    }

    onSave(items);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Carousel Items</h3>
        <div className="flex gap-2">
          <Button onClick={() => handleAddItem('image')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
          <Button onClick={() => handleAddItem('youtube')} size="sm" variant="outline">
            <Youtube className="h-4 w-4 mr-2" />
            Add YouTube
          </Button>
        </div>
      </div>

      {/* Images Section */}
      <div>
        <h4 className="text-sm font-medium mb-3">Images</h4>
        <div className="space-y-2">
          {items
            .filter(item => item.type === 'image')
            .map((item, index, filteredItems) => (
              <Card 
                key={item.id}
                className={`cursor-pointer ${editingItem?.id === item.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setEditingItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-muted rounded-md overflow-hidden">
                        <img 
                          src={item.url} 
                          alt="Carousel item"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-sm">Image {index + 1}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(item.id, 'up');
                          }}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      )}
                      {index < filteredItems.length - 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(item.id, 'down');
                          }}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <h4 className="text-sm font-medium mb-3">YouTube Videos</h4>
        <div className="space-y-2">
          {items
            .filter(item => item.type === 'youtube')
            .map((item, index, filteredItems) => (
              <Card 
                key={item.id}
                className={`cursor-pointer ${editingItem?.id === item.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setEditingItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                        <Youtube className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-sm">Video {index + 1}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(item.id, 'up');
                          }}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      )}
                      {index < filteredItems.length - 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(item.id, 'down');
                          }}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {item.url && (
                    <div className="mt-2 text-sm text-muted-foreground truncate">
                      {item.url}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Save Changes Button */}
      {hasUnsavedChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>
            <Save className="h-4 w-4 mr-2" />
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
        upload={{
          ...imageUpload,
          onUpload: async () => {
            try {
              console.log('Starting image upload process...');
              console.log('Current files:', imageUpload.files);
              
              if (!imageUpload.files || imageUpload.files.length === 0) {
                console.error('No files selected for upload');
                return;
              }

              await imageUpload.onUpload();
            } catch (error) {
              console.error('Error in upload process:', error);
            }
          }
        }}
      />

      {/* Edit panel for YouTube videos */}
      {editingItem && editingItem.type === 'youtube' && (
        <Card>
          <CardHeader>
            <CardTitle>Edit YouTube Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube URL</label>
              <Input
                value={editingItem.url}
                onChange={(e) => {
                  const videoId = getYoutubeVideoId(e.target.value);
                  if (videoId) {
                    handleUpdateItem(editingItem.id, { url: e.target.value });
                  }
                }}
                placeholder="Enter YouTube video URL"
              />
              {editingItem.url && getYoutubeVideoId(editingItem.url) && (
                <div className="aspect-video mt-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(editingItem.url)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
