'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Plus, X, ArrowUp, ArrowDown, Youtube } from 'lucide-react';
import { FileUploadModal } from './file-upload-modal';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'image' | 'youtube'>('image');

  const imageUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: `carousel/${courseId}`,
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
  });

  const handleAddItem = (type: 'image' | 'youtube') => {
    setNewItemType(type);
    if (type === 'image') {
      setIsUploadModalOpen(true);
    } else {
      const newItem: CarouselItem = {
        id: crypto.randomUUID(),
        url: '',
        index: items.length,
        type: 'youtube'
      };
      setItems([...items, newItem]);
      setEditingItem(newItem);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
    // Update indices after removal
    const updatedItems = items
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, index }));
    setItems(updatedItems);
    onSave(updatedItems);
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (direction === 'up' && index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      // Update indices
      const updatedItems = newItems.map((item, idx) => ({ ...item, index: idx }));
      setItems(updatedItems);
      onSave(updatedItems);
    } else if (direction === 'down' && index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      // Update indices
      const updatedItems = newItems.map((item, idx) => ({ ...item, index: idx }));
      setItems(updatedItems);
      onSave(updatedItems);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<CarouselItem>) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(updatedItems);
    onSave(updatedItems);
  };

  const getYoutubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
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

      <div className="space-y-6">
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
      </div>

      {/* Edit panel */}
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

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          imageUpload.setFiles([]);
        }}
        title="Upload Image"
        type="image"
        upload={{
          ...imageUpload,
          onUpload: async () => {
            await imageUpload.onUpload();
            if (imageUpload.isSuccess && imageUpload.successes.length > 0) {
              const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/courses/carousel/${courseId}/${imageUpload.successes[0]}`;
              const newItem: CarouselItem = {
                id: crypto.randomUUID(),
                url,
                index: items.length,
                type: 'image'
              };
              const updatedItems = [...items, newItem];
              setItems(updatedItems);
              onSave(updatedItems);
              setIsUploadModalOpen(false);
            }
          }
        }}
      />
    </div>
  );
}
