'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

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
  const [showAll, setShowAll] = useState(false);
  const [isAddIconOpen, setIsAddIconOpen] = useState(false);
  const [newIconUrl, setNewIconUrl] = useState('');
  const [newIconName, setNewIconName] = useState('');
  const [addingIcon, setAddingIcon] = useState(false);

  const supabase = createClient();

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

      if (!showAll) {
        query = query.limit(5);
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
  }, [searchQuery, showAll]);

  const handleAddIcon = async () => {
    if (!newIconUrl || !newIconName) {
      toast.error('Please provide both URL and name for the icon');
      return;
    }

    setAddingIcon(true);
    try {
      const { data, error } = await supabase
        .from('icons')
        .insert({
          url: newIconUrl,
          name: newIconName
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Icon added successfully');
      setIsAddIconOpen(false);
      setNewIconUrl('');
      setNewIconName('');
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
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {icons.map((icon) => (
              <Button
                key={icon.id}
                variant={selectedIconId === icon.id ? 'default' : 'outline'}
                className="p-2 h-auto aspect-square relative group"
                onClick={() => onSelect(icon)}
              >
                <img src={icon.url} alt={icon.name} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs text-center p-1">{icon.name}</span>
                </div>
              </Button>
            ))}
          </div>

          {!showAll && icons.length === 5 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAll(true)}
            >
              Show All Icons
            </Button>
          )}
        </>
      )}

      <Dialog open={isAddIconOpen} onOpenChange={setIsAddIconOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Icon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Icon URL</Label>
              <Input
                value={newIconUrl}
                onChange={(e) => setNewIconUrl(e.target.value)}
                placeholder="https://example.com/icon.svg"
              />
            </div>
            <div>
              <Label>Icon Name</Label>
              <Input
                value={newIconName}
                onChange={(e) => setNewIconName(e.target.value)}
                placeholder="Enter icon name"
              />
            </div>
            {newIconUrl && (
              <div className="flex justify-center p-4 border rounded">
                <img
                  src={newIconUrl}
                  alt="Icon preview"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
                  }}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddIconOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddIcon} disabled={addingIcon || !newIconUrl || !newIconName}>
                {addingIcon && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Icon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
