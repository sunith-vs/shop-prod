'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { IconSelector } from './icon-selector';

interface Icon {
  id: string;
  url: string;
  name: string;
}

interface CourseBenefit {
  id?: string;
  icon_id?: string;
  title: string;
  description?: string;
  course_id?: string;
  order?: number;
  color: string;
}

interface CourseBenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (benefit: CourseBenefit) => void;
  courseId: string;
  benefit?: CourseBenefit;
}

export function CourseBenefitModal({
  isOpen,
  onClose,
  onSave,
  courseId,
  benefit
}: CourseBenefitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FF7B34');
  const [iconId, setIconId] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form fields to default or populate with benefit data
  const resetForm = () => {
    if (benefit) {
      setTitle(benefit.title || '');
      setDescription(benefit.description || '');
      setColor(benefit.color || '#FF7B34');
      setIconId(benefit.icon_id || '');
    } else {
      setTitle('');
      setDescription('');
      setColor('#FF7B34');
      setIconId('');
    }
  };
  
  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, benefit]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newBenefit: CourseBenefit = {
        id: benefit?.id,
        title,
        description,
        color,
        icon_id: iconId,
        course_id: courseId,
        order: benefit?.order
      };
      await onSave(newBenefit);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Reset form when closing
          setLoading(false);
          setTimeout(resetForm, 300); // Wait for dialog animation to complete
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader >
          <DialogTitle className="ml-0.25">{benefit ? 'Edit Benefit' : 'Add New Benefit'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto pl-1 pr-5" style={{ maxHeight: 'calc(80vh)' }}>
          <div>
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input
              className="mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter benefit title"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              className="mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter benefit description"
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Enter hex color code"
              />
            </div>
          </div>
          <div>
            <Label>Icon <span className="text-red-500">*</span></Label>
            <IconSelector
              className="mt-1"
              selectedIconId={iconId}
              onSelect={(icon) => setIconId(icon.id)}
            />
          </div>
          <div className="flex justify-end gap-2 pb-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title || !iconId || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
