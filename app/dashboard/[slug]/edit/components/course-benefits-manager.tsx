'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { CourseBenefitModal } from './course-benefit-modal';
import { Loader2, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

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

interface CourseBenefitsManagerProps {
  courseId: string;
}

export function CourseBenefitsManager({ courseId }: CourseBenefitsManagerProps) {
  const [benefits, setBenefits] = useState<CourseBenefit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<CourseBenefit | undefined>();
  const [icons, setIcons] = useState<Record<string, Icon>>({});
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchBenefits = async () => {
    const { data, error } = await supabase
      .from('course_benefits')
      .select('*')
      .eq('course_id', courseId)
      .order('order');
    
    if (error) {
      toast.error('Failed to load benefits');
      return;
    }
    
    setBenefits(data || []);
  };

  const fetchIcons = async () => {
    const { data } = await supabase.from('icons').select('*');
    if (data) {
      const iconMap = data.reduce((acc, icon) => ({
        ...acc,
        [icon.id]: icon
      }), {});
      setIcons(iconMap);
    }
  };

  useEffect(() => {
    Promise.all([fetchBenefits(), fetchIcons()]).finally(() => setLoading(false));
  }, [courseId]);

  const handleSave = async (benefit: CourseBenefit) => {
    try {
      if (benefit.id) {
        // Update
        const { error } = await supabase
          .from('course_benefits')
          .update({
            title: benefit.title,
            description: benefit.description,
            color: benefit.color,
            icon_id: benefit.icon_id
          })
          .eq('id', benefit.id);
        
        if (error) throw error;
        toast.success('Benefit updated successfully');
      } else {
        // Create
        const { error } = await supabase
          .from('course_benefits')
          .insert({
            ...benefit,
            order: benefits.length
          });
        
        if (error) throw error;
        toast.success('Benefit added successfully');
      }
      
      fetchBenefits();
    } catch (error) {
      toast.error('Failed to save benefit');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_benefits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Benefit deleted successfully');
      fetchBenefits();
    } catch (error) {
      toast.error('Failed to delete benefit');
    }
  };

  const handleEdit = (benefit: CourseBenefit) => {
    setSelectedBenefit(benefit);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setSelectedBenefit(undefined);
            setIsModalOpen(true);
          }}
        >
          Add Benefit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="p-4 rounded-lg border hover:shadow-md transition-shadow"
            style={{ backgroundColor: `${benefit.color}25` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {benefit.icon_id && icons[benefit.icon_id] && (
                  <img
                    src={icons[benefit.icon_id].url}
                    alt={icons[benefit.icon_id].name}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  {benefit.description && (
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(benefit)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => benefit.id && handleDelete(benefit.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CourseBenefitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBenefit(undefined);
        }}
        onSave={handleSave}
        courseId={courseId}
        benefit={selectedBenefit}
      />
    </div>
  );
}
