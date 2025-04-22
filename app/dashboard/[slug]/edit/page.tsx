'use client';

import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { SideTabs } from './components/side-tabs';
import { FileText, Image, Layout, Gift, Calendar } from 'lucide-react';
import { CarouselSection } from './components/carousel-section';

type CourseType = 'JEE' | 'NEET' | 'CUET' | '11-12' | '5-10';

interface Course {
  id: string;
  title: string;
  description: string;
  sub_heading: string;
  banner_url: string;
  thumbnail: string;
  brochure_url: string;
  slug: string;
  highlights: string[];
  status: 'draft' | 'active' | 'inactive';
  popular: boolean;
  course_type: CourseType;
  carousel_items?: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  }>;
  created_at: string;
  updated_at: string;
}

const tabs = [
  { id: 'general', label: 'General Details', icon: <FileText className="h-4 w-4" /> },
  { id: 'media', label: 'Images & Files', icon: <Image className="h-4 w-4" /> },
  { id: 'carousel', label: 'Carousels', icon: <Layout className="h-4 w-4" /> },
  { id: 'benefits', label: 'Course Benefits', icon: <Gift className="h-4 w-4" /> },
  { id: 'batches', label: 'Batches', icon: <Calendar className="h-4 w-4" /> },
];

const COURSE_TYPES: CourseType[] = ['JEE', 'NEET', 'CUET', '11-12', '5-10'];

export default function EditCourse({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [editedSlug, setEditedSlug] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (error || !data) {
          notFound();
          return;
        }

        setCourse(data);
        setEditedSlug(data.slug);
        setHighlights(data.highlights || ['']);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch course",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.slug, toast]);

  const handleStatusChange = async () => {
    if (!course) return;
    
    try {
      setIsSubmitting(true);
      const supabase = createClient();
      const newStatus = course.status === 'active' ? 'draft' : 'active';

      const { error } = await supabase
        .from('courses')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', params.slug);

      if (error) throw error;

      setCourse(prev => ({
        ...prev!,
        status: newStatus
      }));

      toast({
        title: "Success",
        description: `Course ${newStatus === 'active' ? 'published' : 'unpublished'} successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const addHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = highlights.filter((_, i) => i !== index);
    if (newHighlights.length === 0) {
      setHighlights(['']);
    } else {
      setHighlights(newHighlights);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData(event.currentTarget);
      const supabase = createClient();

      const newSlug = formData.get('slug') as string;
      const updates = {
        title: formData.get('title'),
        description: formData.get('description'),
        sub_heading: formData.get('subHeading'),
        banner_url: formData.get('bannerUrl'),
        thumbnail: formData.get('thumbnailUrl'),
        brochure_url: formData.get('brochureUrl'),
        slug: newSlug,
        highlights: highlights.filter(Boolean),
        course_type: formData.get('courseType'),
        popular: formData.get('popular') === 'true',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('slug', params.slug);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course updated successfully!",
        variant: "default",
      });
      
      // Redirect if slug changed
      if (newSlug !== params.slug) {
        router.push(`/dashboard/${newSlug}/edit`);
      } else {
        router.refresh();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCarouselSave = async (items: any[]) => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('courses')
        .update({
          carousel_items: items,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', params.slug);

      if (error) throw error;

      setCourse(prev => ({
        ...prev!,
        carousel_items: items
      }));

      toast({
        title: "Success",
        description: "Carousel items updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update carousel items",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;
  if (!course) return notFound();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <Card>
            <CardHeader>
              <CardTitle>General Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter course title"
                    required
                    defaultValue={course.title}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="slug" className="text-sm font-medium">URL Slug</label>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="Enter URL slug"
                    required
                    value={editedSlug}
                    onChange={(e) => setEditedSlug(e.target.value)}
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens are allowed"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be used in the course URL. Use only lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="courseType" className="text-sm font-medium">Course Type</label>
                  <Select name="courseType" defaultValue={course.course_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    name="popular"
                    defaultChecked={course.popular}
                  />
                  <Label htmlFor="popular">Mark as Popular Course</Label>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subHeading" className="text-sm font-medium">Sub Heading</label>
                  <Input
                    id="subHeading"
                    name="subHeading"
                    placeholder="Enter course sub heading"
                    defaultValue={course.sub_heading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter course description"
                    rows={5}
                    defaultValue={course.description}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 'media':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Images & Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="bannerUrl" className="text-sm font-medium">Banner URL</label>
                  <Input
                    id="bannerUrl"
                    name="bannerUrl"
                    type="url"
                    placeholder="Enter banner image URL"
                    defaultValue={course.banner_url}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="thumbnailUrl" className="text-sm font-medium">Thumbnail URL</label>
                  <Input
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    type="url"
                    placeholder="Enter thumbnail image URL"
                    defaultValue={course.thumbnail}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="brochureUrl" className="text-sm font-medium">Brochure URL</label>
                  <Input
                    id="brochureUrl"
                    name="brochureUrl"
                    type="url"
                    placeholder="Enter brochure URL"
                    defaultValue={course.brochure_url}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'benefits':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Course Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      name="highlights[]"
                      placeholder="Enter highlight"
                      value={highlight}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeHighlight(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addHighlight}
                  className="w-full"
                >
                  Add Highlight
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'carousel':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Carousels</CardTitle>
            </CardHeader>
            <CardContent>
              <CarouselSection
                courseId={course.id}
                initialItems={course.carousel_items || []}
                onSave={handleCarouselSave}
              />
            </CardContent>
          </Card>
        );

      case 'batches':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Batch management coming soon
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-lg font-medium">Editing: {course.title}</h1>
          <div className="flex items-center gap-4">
            <Button
              variant={course.status === 'active' ? "destructive" : "default"}
              onClick={handleStatusChange}
              disabled={isSubmitting}
            >
              {course.status === 'active' ? 'Unpublish' : 'Publish'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <Button onClick={() => router.push(`/dashboard/${params.slug}`)}>
              View Course
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
