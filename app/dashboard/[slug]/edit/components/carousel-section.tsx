'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface CarouselSectionProps {
  courseId: string;
  initialItems?: CarouselItem[];
  onSave: (items: CarouselItem[]) => void;
}

export function CarouselSection({ courseId, initialItems = [], onSave }: CarouselSectionProps) {
  const [items, setItems] = useState<CarouselItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);

  const imageUpload = useSupabaseUpload({
    bucketName: 'courses',
    path: `carousel/${courseId}`,
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
  });

  const handleAddItem = () => {
    const newItem: CarouselItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      imageUrl: '',
    };
    setItems([...items, newItem]);
    setEditingItem(newItem);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (direction === 'up' && index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setItems(newItems);
    } else if (direction === 'down' && index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setItems(newItems);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<CarouselItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Carousel Items</h3>
        <Button onClick={handleAddItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* List of items */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card 
              key={item.id}
              className={`cursor-pointer ${editingItem?.id === item.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setEditingItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-md overflow-hidden">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-secondary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.title || 'Untitled'}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description ? `${item.description.slice(0, 50)}...` : 'No description'}
                      </div>
                    </div>
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
                    {index < items.length - 1 && (
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

        {/* Edit panel */}
        <div>
          {editingItem && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editingItem.title}
                    onChange={(e) => handleUpdateItem(editingItem.id, { title: e.target.value })}
                    placeholder="Enter title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => handleUpdateItem(editingItem.id, { description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Image</label>
                  <Dropzone {...imageUpload} className="h-32">
                    {imageUpload.files.length === 0 ? (
                      editingItem.imageUrl ? (
                        <img
                          src={editingItem.imageUrl}
                          alt={editingItem.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <DropzoneEmptyState className="h-full" />
                      )
                    ) : (
                      <DropzoneContent className="h-full" />
                    )}
                  </Dropzone>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => onSave(items)}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
