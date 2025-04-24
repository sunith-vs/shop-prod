'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

interface HighlightsSectionProps {
  courseId: string;
  slug: string;
  initialHighlights: string[];
  onUpdate?: (highlights: string[]) => void;
}

export function HighlightsSection({ courseId, slug, initialHighlights, onUpdate }: HighlightsSectionProps) {
  const [highlights, setHighlights] = useState<string[]>(initialHighlights);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const handleRemoveHighlight = (index: number) => {
    const newHighlights = highlights.filter((_, i) => i !== index);
    setHighlights(newHighlights);
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();
      const filteredHighlights = highlights.filter(Boolean);

      const { error } = await supabase
        .from('courses')
        .update({
          highlights: filteredHighlights,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', slug);

      if (error) throw error;

      onUpdate?.(filteredHighlights);
      
      toast({
        title: "Success",
        description: "Course highlights updated successfully!",
      });
    } catch (error) {
      console.error('Error updating highlights:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course highlights",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Highlights</h3>
        <Button onClick={handleAddHighlight} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Highlight
        </Button>
      </div>

      <div className="space-y-3">
        {highlights.map((highlight, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={highlight}
              onChange={(e) => handleHighlightChange(index, e.target.value)}
              placeholder={`Highlight ${index + 1}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveHighlight(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {highlights.length > 0 && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Highlights"}
          </Button>
        </div>
      )}
    </div>
  );
}
