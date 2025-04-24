"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseCard } from '@/components/our-course/course-card';
import { OurCourse } from '@/types/course';
import { useState } from 'react';
import Player from 'lottie-react';
import spinnerAnimation from '@/public/spinner.json';

interface CourseTabsProps {
  courses: OurCourse[];
  isLoading?: boolean;
  error?: string | null;
}

export function CourseTabs({ courses, isLoading, error }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState('All Courses');

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
    if (a === 'All Courses') return -1;
    if (b === 'All Courses') return 1;
    if (a === 'Popular') return -1;
    if (b === 'Popular') return 1;
    if (a === 'Others') return 1;
    if (b === 'Others') return -1;
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

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 md:w-40 md:h-40">
          <Player autoplay loop animationData={spinnerAnimation} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
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

      {uniqueTabs.map(tab => (
        <TabsContent key={tab} value={tab}>
          <div className="flex justify-center w-full px-4 py-3.5 lg:pt-8">
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
      ))}
    </Tabs>
  );
}
