'use client';

import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ComboboxSearch } from "@/components/ui/combobox-search";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { SideTabs } from './components/side-tabs';
import { BatchesSection } from './components/batches-section';
import { FileText, Image, Layout, Gift, Calendar, Plus, X, Menu } from 'lucide-react';
import { CarouselSection } from './components/carousel-section';
import { HighlightsSection } from './components/highlights-section';
import { MediaSection } from './components/media-section';
import { CourseBenefitsManager } from './components/course-benefits-manager';
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type CourseType = 'JEE' | 'NEET' | 'CUET' | '11-12' | '5-10';

interface Course {
  id: string;
  title: string;
  description: string;
  sub_heading: string;
  banner_url: string;
  thumbnail: string;
  brochure_url: string;
  tag_url?: string;
  slug: string;
  highlights: string[];
  status: 'draft' | 'active' | 'inactive';
  popular: boolean;
  course_type: string;
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
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editedSlug, setEditedSlug] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [eduportCourses, setEduportCourses] = useState<EduportCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [selectedEduportCourse, setSelectedEduportCourse] = useState<string>();
  const [courseTypes, setCourseTypes] = useState<string[]>([]);
  const [courseTypeOpen, setCourseTypeOpen] = useState(false);
  const [courseTypeValue, setCourseTypeValue] = useState("");
  const [courseTypeInput, setCourseTypeInput] = useState("");

  useEffect(() => {
    const fetchCourseTypes = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('course_type')
        .not('course_type', 'is', null);

      if (error) {
        console.error('Error fetching course types:', error);
        return;
      }

      // Get unique types and filter out nulls/empty strings
      const uniqueTypes = Array.from(new Set(data.map(item => item.course_type)))
        .filter(type => type && type.trim());

      setCourseTypes(uniqueTypes.sort());
    };

    fetchCourseTypes();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        
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

  useEffect(() => {
    if (course?.course_type) {
      setCourseTypeValue(course.course_type);
      setCourseTypeInput(course.course_type);
    }
  }, [course]);

  const handleStatusChange = async () => {
    if (!course) return;
    
    try {
      setIsSubmitting(true);
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

      // Required field validation
      const requiredFields = ['title', 'subHeading', 'slug', 'eduportCourseId'];
      const missingFields = requiredFields.filter(field => !formData.get(field));
      if (missingFields.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Slug validation and formatting
      const rawSlug = formData.get('slug') as string;
      const formattedSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens

      if (!formattedSlug) {
        toast({
          title: "Invalid Slug",
          description: "Please enter a valid slug using letters, numbers, and hyphens",
          variant: "destructive",
        });
        return;
      }

      const updates = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        sub_heading: formData.get('subHeading') as string,
        slug: formattedSlug,
        course_type: formData.get('courseType') as string,
        popular: isPopular,
        eduport_course_id: formData.get('eduportCourseId') as string,
        highlights: highlights.filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      const supabase = createClient();

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
      if (formattedSlug !== params.slug) {
        router.push(`/dashboard/${formattedSlug}/edit`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background border-b">
          <div className="container px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between mb-2 sm:mb-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
              <Skeleton className="h-10 w-full sm:w-24" />
              <Skeleton className="h-10 w-full sm:w-24" />
              <Skeleton className="h-10 w-full sm:w-24" />
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row">
          <div className="hidden sm:block w-64 border-r p-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="mb-2">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 sm:p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <div className="grid gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return notFound();
  }

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
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={course?.title}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subHeading" className="text-sm font-medium">
                    Sub Heading <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="subHeading"
                    name="subHeading"
                    defaultValue={course?.sub_heading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="slug" className="text-sm font-medium">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={course?.slug}
                    required
                    pattern="^[a-z0-9-]+$"
                    title="Only lowercase letters, numbers, and hyphens allowed"
                    onChange={(e) => {
                      e.target.value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="courseType" className="text-sm font-medium">Course Type</label>
                  <Popover open={courseTypeOpen} onOpenChange={setCourseTypeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={courseTypeOpen}
                        className="w-full justify-between"
                      >
                        {courseTypeValue || "Select course type..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or enter new type..." 
                          value={courseTypeInput}
                          onValueChange={setCourseTypeInput}
                        />
                        {courseTypeInput && !courseTypes.includes(courseTypeInput) && (
                          <CommandEmpty className="py-2 px-4 text-sm">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-left font-normal"
                              onClick={() => {
                                setCourseTypeValue(courseTypeInput);
                                setCourseTypeOpen(false);
                              }}
                            >
                              Add &#34;{courseTypeInput}&#34;
                            </Button>
                          </CommandEmpty>
                        )}
                        <CommandGroup>
                          {courseTypes
                            .filter(type => 
                              type.toLowerCase().includes(courseTypeInput.toLowerCase())
                            )
                            .map((type) => (
                              <CommandItem
                                key={type}
                                onSelect={() => {
                                  setCourseTypeValue(type);
                                  setCourseTypeInput(type);
                                  setCourseTypeOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    courseTypeValue === type ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {type}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <input 
                    type="hidden" 
                    name="courseType" 
                    value={courseTypeValue} 
                  />
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
                  <label htmlFor="eduportCourseId" className="text-sm font-medium">
                    Eduport Course <span className="text-red-500">*</span>
                  </label>
                  {isLoadingCourses ? (
                    <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
                  ) : (
                    <ComboboxSearch
                      options={eduportCourses.map(course => ({
                        value: course.id.toString(),
                        label: course.title
                      }))}
                      value={selectedEduportCourse}
                      onValueChange={setSelectedEduportCourse}
                      name="eduportCourseId"
                      // id="eduportCourseId"
                      // required
                      placeholder="Select an Eduport course"
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
                    defaultValue={course?.description}
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
                    tag_url: course.tag_url,
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
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container px-4 py-2 sm:py-3">
          {/* Title and Menu Row */}
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild className="sm:hidden">
                  <Button variant="ghost" size="icon" className="-ml-3">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:hidden p-0">
                  <nav className="h-full py-4">
                    <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={(tab) => {
                      setActiveTab(tab);
                      const sheetClose = document.querySelector('[data-sheet-close]');
                      if (sheetClose instanceof HTMLElement) {
                        sheetClose.click();
                      }
                    }} />
                  </nav>
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-medium truncate">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
            <div className="flex-1 sm:flex-none flex gap-2 sm:gap-3 order-1 sm:order-none">
              <Button
                variant={course.status === 'active' ? "destructive" : "default"}
                onClick={handleStatusChange}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {course.status === 'active' ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-[2] sm:flex-none order-0 sm:order-none">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => router.push(`/${params.slug}`)}
                className="flex-1 sm:flex-none"
              >
                View Course
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row">
        <div className="hidden sm:block w-64 border-r">
          <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="flex-1 p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
