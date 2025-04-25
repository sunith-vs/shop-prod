'use client';

import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ComboboxSearch } from "@/components/ui/combobox-search";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { SideTabs } from './components/side-tabs';
import { BatchesSection } from './components/batches-section';
import { FileText, Image, Layout, Gift, Calendar, Plus, X } from 'lucide-react';
import { CarouselSection } from './components/carousel-section';
import { HighlightsSection } from './components/highlights-section';
import { MediaSection } from './components/media-section';
import { CourseBenefitsManager } from './components/course-benefits-manager';

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
  eduport_course_id?: string;
  carousel_items?: Array<{
    id: string;
    url: string;
    index: number;
    type: 'image' | 'youtube';
  }>;
  created_at: string;
  updated_at: string;
}

interface EduportCourse {
  id: number;
  title: string;
  order: number;
  batches: any[];
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [editedSlug, setEditedSlug] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [eduportCourses, setEduportCourses] = useState<EduportCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [selectedEduportCourse, setSelectedEduportCourse] = useState<string>();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (courseError || !courseData) {
          notFound();
          return;
        }

        // Fetch carousel items
        const { data: carouselData } = await supabase
          .from('carousel')
          .select('*')
          .eq('course_id', courseData.id)
          .order('index');

        // Combine course data with carousel items
        const courseWithCarousel = {
          ...courseData,
          carousel_items: carouselData?.map(item => ({
            id: item.id,
            url: item.url,
            index: item.index,
            // Determine if URL is YouTube or image
            type: item.url.includes('youtube.com') || item.url.includes('youtu.be') ? 'youtube' : 'image'
          })) || []
        };

        setCourse(courseWithCarousel);
        setEditedSlug(courseData.slug);
        setIsPopular(courseData.popular);
        setHighlights(courseData.highlights || []);
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

  useEffect(() => {
    const fetchEduportCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await fetch('https://uat.eduport.in/staffapp/api/v3/v1/course/lists');
        const data = await response.json();
        if (!data.error && data.courses) {
          setEduportCourses(data.courses);
        }
      } catch (error) {
        console.error('Failed to fetch Eduport courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchEduportCourses();
  }, []);

  useEffect(() => {
    if (course?.eduport_course_id) {
      setSelectedEduportCourse(course.eduport_course_id.toString());
    }
  }, [course]);

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
        description: error instanceof Error ? error.message : "Failed to update course status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        sub_heading: formData.get('subHeading') as string,
        slug: newSlug,
        course_type: formData.get('courseType') as CourseType,
        popular: isPopular,
        eduport_course_id: formData.get('eduportCourseId') as string,
        highlights: highlights.filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('slug', params.slug);

      if (error) throw error;

      // Update local state
      setCourse(prev => prev ? { ...prev, ...updates } : null);

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

  const handleMediaUpdate = async (updates: Partial<{
    banner_url: string;
    thumbnail: string;
    brochure_url: string;
  }>) => {
    if (!course) return;
    
    try {
      setIsSubmitting(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', params.slug);

      if (error) throw error;

      setCourse(prev => ({
        ...prev!,
        ...updates
      }));

      toast({
        title: "Success",
        description: "Media updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update media",
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
                  <label htmlFor="subHeading" className="text-sm font-medium">Sub Heading</label>
                  <Input
                    id="subHeading"
                    name="subHeading"
                    placeholder="Enter course sub heading"
                    defaultValue={course.sub_heading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="courseType" className="text-sm font-medium">Course Type</label>
                  <Select name="courseType" defaultValue={course.course_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE">JEE</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="CUET">CUET</SelectItem>
                      <SelectItem value="11-12">11-12</SelectItem>
                      <SelectItem value="5-10">5-10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={isPopular}
                    onCheckedChange={setIsPopular}
                  />
                  <Label htmlFor="popular">Mark as Popular Course</Label>
                  <input 
                    type="hidden" 
                    name="popular" 
                    value={isPopular.toString()} 
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="eduportCourseId" className="text-sm font-medium">Eduport Course</label>
                  {isLoadingCourses ? (
                    <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
                  ) : (
                    <ComboboxSearch
                      name="eduportCourseId"
                      options={eduportCourses.map(course => ({
                        value: course.id.toString(),
                        label: course.title
                      }))}
                      value={selectedEduportCourse}
                      onValueChange={setSelectedEduportCourse}
                      placeholder="Select a course"
                      searchPlaceholder="Search by title or ID..."
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Highlights</label>
                  <div className="space-y-3">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => {
                            const newHighlights = [...highlights];
                            newHighlights[index] = e.target.value;
                            setHighlights(newHighlights);
                          }}
                          placeholder={`Highlight ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setHighlights(highlights.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setHighlights([...highlights, ''])}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Highlight
                    </Button>
                  </div>
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
              {activeTab === 'media' && course && (
                <MediaSection
                  courseId={course.id}
                  initialData={{
                    banner_url: course.banner_url,
                    thumbnail: course.thumbnail,
                    brochure_url: course.brochure_url
                  }}
                  onUpdate={handleMediaUpdate}
                />
              )}
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
                onSave={async (items) => {
                  if (!course) return;
                  
                  // Update the course state
                  setCourse({
                    ...course,
                  });

                  // Save to database
                  const supabase = createClient();
                  
                  // Delete existing items
                  await supabase
                    .from('carousel')
                    .delete()
                    .eq('course_id', course.id);
                  
                  // Insert new items
                  if (items.length > 0) {
                    await supabase
                      .from('carousel')
                      .insert(
                        items.map(item => ({
                          id: item.id,
                          url: item.url,
                          index: item.index,
                          course_id: course.id
                        }))
                      );
                  }
                }}
              />
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
              <CourseBenefitsManager courseId={course.id} />
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
              <BatchesSection courseId={course.id} />
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
            <Button onClick={() => router.push(`/${params.slug}`)}>
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
