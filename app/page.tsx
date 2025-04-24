"use client";

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseCard } from '@/components/our-course/course-card';
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@/lib/supabase/client';
import { OurCourse } from '@/types/course';
import Player from 'lottie-react';
import spinnerAnimation from '@/public/spinner.json';

export default function HomePage() {
  const [courses, setCourses] = useState<OurCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Courses');
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'active')
          .order('title', { ascending: true });

        if (coursesError) throw coursesError;

        // Map database fields to OurCourse type
        const mappedCourses = coursesData.map(course => ({
          id: course.id,
          title: course.title || '',
          slug: course.slug || '',
          sub_heading: course.sub_heading || '',
          description: course.description || '',
          highlights: course.highlights || [],
          brochure_url: course.brochure_url || '',
          tagUrl: course.tag_url || '',
          status: course.status || '',
          createdAt: course.created_at,
          updatedAt: course.updated_at,
          thumbnail: course.thumbnail || '',
          popular: course.popular || false,
          courseType: course.course_type || '',
          eduportCourseId: course.eduport_course_id,
          bannerUrl: course.banner_url || '',
          bannerMobile: course.banner_mobile || '',
          board: course.board || []
        }));

        setCourses(mappedCourses);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch courses');
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Get unique course types and add required tabs
  const courseTypes = new Set(['All Courses']);

  // Check if we have popular courses
  const hasPopularCourses = courses.some(course => course.popular);
  if (hasPopularCourses) {
    courseTypes.add('Popular');
  }

  // Add course types and check if we need 'Others'
  let hasNullCourses = false;
  courses.forEach(course => {
    if (course.courseType) {
      courseTypes.add(course.courseType);
    } else {
      hasNullCourses = true;
    }
  });

  if (hasNullCourses) {
    courseTypes.add('Others');
  }

  // Convert to array and sort
  const uniqueTabs = Array.from(courseTypes).sort((a, b) => {
    // All Courses always first
    if (a === 'All Courses') return -1;
    if (b === 'All Courses') return 1;
    // Popular always second (if it exists)
    if (a === 'Popular') return -1;
    if (b === 'Popular') return 1;
    // Others always last
    if (a === 'Others') return 1;
    if (b === 'Others') return -1;
    // Rest alphabetically
    return a.localeCompare(b);
  });

  // Filter courses based on active tab
  const filteredCourses = (() => {
    switch (activeTab) {
      case 'All Courses':
        return courses;
      case 'Popular':
        return courses.filter(course => course.popular);
      case 'Others':
        return courses.filter(course => !course.courseType);
      default:
        return courses.filter(course => course.courseType === activeTab);
    }
  })();

  return (
    <div className="bg-white w-full flex justify-center">
      <Head>
        <title>Our Courses - Learn with Live Classes</title>
        <meta name="description" content="Learn free with Live Classes and Pre Recorded Videos" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="bg-white w-full max-w-7xl mx-auto py-9 lg:py-10">
        <div className="text-center mx-5 mb-3.5 lg:mb-8">
          <h1 className="font-bold text-4xl lg:text-5xl mb-3">
            <span className="text-[#101828]">Our</span> <span className="text-[#FB6514]">Courses</span>
          </h1>
          <p className="text-[#667085] text-normal lg:text-lg">
            Learn free with Live Classes and Pre Recorded Videos
          </p>
        </div>

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 md:w-40 md:h-40">
              <Player
                autoplay
                loop
                animationData={spinnerAnimation}
              />
            </div>
          </div>

        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : (

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full overflow-x-auto no-scrollbar">
              <TabsList className="h-auto bg-[#00000000] flex gap-3 lg:gap-4 w-max min-w-full sm:min-w-0 sm:w-fit sm:mx-auto px-4">
                {uniqueTabs.map(tab => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-3 sm:px-6 md:px-8 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 text-sm lg:text-xl font-medium data-[state=active]:bg-[#FB6514] data-[state=active]:text-white data-[state=active]:border-[#FB6514] data-[state=inactive]:bg-[#FFFBFA] data-[state=inactive]:text-[#FB6514] data-[state=inactive]:hover:bg-[#FFE4D2] border-2 border-[#FFE4D2]"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Show filtered courses for the selected tab */}
            {uniqueTabs.map(tab => {
              return (
                <TabsContent key={tab} value={tab}>
                  <div className="flex justify-center w-full  px-4 py-3.5 lg:pt-8">
                    <div className="w-full max-w-6xl">
                      {filteredCourses.length <= 2 ? (
                        <div className="flex flex-col sm:flex-row justify-center gap-6 mx-auto">
                          {filteredCourses.map((course) => (
                            <div className="w-full sm:max-w-sm" key={course.id}>
                              <CourseCard course={course} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
                          {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}
