import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CourseTabs } from '@/components/our-course/course-tabs';

export const metadata: Metadata = {
  title: 'Our Courses - Learn with Live Classes',
  description: 'Learn free with Live Classes and Pre Recorded Videos',
};

// Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = createClient();
  
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'active')
    .order('title', { ascending: true });

  const courses = coursesData?.map(course => ({
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
  })) || [];

  return (
    <div className="bg-white w-full flex justify-center">
      <div className="bg-white w-full max-w-7xl mx-auto py-9 lg:py-10">
        <div className="text-center mx-5 mb-3.5 lg:mb-8">
          <h1 className="font-bold text-4xl lg:text-5xl mb-3">
            <span className="text-[#101828]">Our</span> <span className="text-[#FB6514]">Courses</span>
          </h1>
          <p className="text-[#667085] text-normal lg:text-lg">
            Learn free with Live Classes and Pre Recorded Videos
          </p>
        </div>

        <CourseTabs 
          courses={courses} 
          error={coursesError ? coursesError.message : null} 
        />
      </div>
    </div>
  );
}
