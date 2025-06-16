'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { CourseBenefitModal } from './course-benefit-modal';
import { Loader2, Pencil, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  is_template?: boolean;
}

interface CourseBenefitsManagerProps {
  courseId: string;
}

export function CourseBenefitsManager({ courseId }: CourseBenefitsManagerProps) {
  const [benefits, setBenefits] = useState<CourseBenefit[]>([]);
  const [templateBenefits, setTemplateBenefits] = useState<CourseBenefit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<CourseBenefit | undefined>();
  const [icons, setIcons] = useState<Record<string, Icon>>({});
  const [loading, setLoading] = useState(true);
  const [showingTemplates, setShowingTemplates] = useState(false);
  const { toast } = useToast();

  const supabase = createClient();

  const fetchBenefits = async () => {
    try {
      // Fetch course-specific benefits
      const { data: courseBenefits, error: courseBenefitsError } = await supabase
        .from('course_benefits')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_template', false)
        .order('order');

      if (courseBenefitsError) {
        throw courseBenefitsError;
      }

      setBenefits(courseBenefits || []);
      
      // Fetch template benefits
      const { data: templates, error: templatesError } = await supabase
        .from('course_benefits')
        .select('*')
        .eq('is_template', true)
        .order('order');
        
      if (templatesError) {
        throw templatesError;
      }
      
      setTemplateBenefits(templates || []);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      toast({
        title: "Error",
        description: 'Failed to load benefits',
        variant: "destructive"
      });
    }
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
        // Update existing benefit
        const { error } = await supabase
          .from('course_benefits')
          .update({
            title: benefit.title,
            description: benefit.description,
            color: benefit.color,
            icon_id: benefit.icon_id,
            is_template: benefit.is_template || false
          })
          .eq('id', benefit.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: 'Benefit updated successfully'
        });
      } else {
        // Create new benefit
        if (benefit.is_template) {
          // If template is checked, save two copies: one as template and one for the current course
          
          // 1. Save as a template (without course_id)
          const { error: templateError } = await supabase
            .from('course_benefits')
            .insert({
              title: benefit.title,
              description: benefit.description,
              color: benefit.color,
              icon_id: benefit.icon_id,
              is_template: true,
              order: 0 // Templates don't need specific order
            });

          if (templateError) throw templateError;
          
          // 2. Save as a course-specific benefit
          const { error: courseError } = await supabase
            .from('course_benefits')
            .insert({
              title: benefit.title,
              description: benefit.description,
              color: benefit.color,
              icon_id: benefit.icon_id,
              course_id: courseId,
              is_template: false,
              order: benefits.length
            });

          if (courseError) throw courseError;
          
          toast({
            title: "Success",
            description: 'Benefit added to both template and course'
          });
        } else {
          // Regular course-specific benefit
          const { error } = await supabase
            .from('course_benefits')
            .insert({
              ...benefit,
              course_id: courseId,
              order: benefits.length,
              is_template: false
            });

          if (error) throw error;
          toast({
            title: "Success",
            description: 'Benefit added successfully'
          });
        }
      }

      fetchBenefits();
    } catch (error) {
      console.error('Error saving benefit:', error);
      toast({
        title: "Error",
        description: 'Failed to save benefit',
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_benefits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: 'Benefit deleted successfully'
      });
      console.log('Benefit deleted successfully');
      fetchBenefits();
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to delete benefit',
        variant: "destructive"
      });
    }
  };

  const handleEdit = (benefit: CourseBenefit) => {
    setSelectedBenefit(benefit);
    setIsModalOpen(true);
  };

  // Function to add a template benefit to the course
  const addPresetBenefit = async (preset: CourseBenefit) => {
    try {
      // Add the template benefit to the course
      const { error } = await supabase
        .from('course_benefits')
        .insert({
          title: preset.title,
          description: preset.description,
          color: preset.color,
          icon_id: preset.icon_id,
          course_id: courseId,
          order: benefits.length,
          is_template: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `"${preset.title}" added to your course`
      });

      // Refresh benefits list
      await fetchBenefits();
    } catch (error) {
      console.error('Error adding template benefit:', error);
      toast({
        title: "Error",
        description: 'Failed to add benefit',
        variant: "destructive"
      });
    }
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
      <div className="flex justify-end mb-4 gap-2">
        {templateBenefits.length > 0 && (
          <Button
            onClick={() => setShowingTemplates(!showingTemplates)}
            variant={showingTemplates ? "outline" : "secondary"}
          >
            {showingTemplates ? 'Hide Templates' : 'Show Template Benefits'}
          </Button>
        )}
        <Button
          onClick={() => {
            setSelectedBenefit(undefined);
            setIsModalOpen(true);
          }}
        >
          Add Benefit
        </Button>
      </div>


      
      {showingTemplates && templateBenefits.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Template Benefits (Click to add)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {templateBenefits.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg border-2 border-blue-300 hover:shadow-md transition-shadow cursor-pointer"
                style={{ backgroundColor: `${template.color || '#e6f7ff'}25` }}
                onClick={() => addPresetBenefit({
                  ...template,
                  course_id: courseId,
                  is_template: false,
                  id: undefined
                })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {template.icon_id && icons[template.icon_id] && (
                      <img
                        src={icons[template.icon_id].url}
                        alt={icons[template.icon_id].name}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold">{template.title}</h3>
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Template</span>
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600">{template.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {benefits.length > 0 && <h2 className="text-lg font-semibold mb-2">Your Course Benefits</h2>}
        </>
      )}

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
