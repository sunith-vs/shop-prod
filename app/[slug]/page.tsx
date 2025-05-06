import BorderText from '@/components/user/course-list/border-text'
import CarouselList from '@/components/user/course-list/carousel-list'
import CourseBenefitsList from '@/components/user/course-list/course-benifit-list'
import CourseOffering from '@/components/user/course-list/course-offering'
import StudentProfileCards from '@/components/user/course-list/stories-list'
import React from 'react'
import CourseListFooter from '@/components/user/course-list/cource-list-footer'
import { createClient } from '@/lib/supabase/server';
import CoursesOfferBanner from '@/components/user/course-list/courses-offer-banner'

// Define types based on the data structure
type Course = {
  id: string;
  banner_url: string;
  title: string;
  slug: string;
  sub_heading: string;
  description: string;
  highlights: string[];
  brochure_url: string | null;
  tag_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  thumbnail: string;
  eduport_course_id: number;
  banner_mobile: string;
};

type Batch = {
  id: string;
  name: string;
  type: string;
  amount: number;
  subject_batch_id: string;
  course_id: string;
  created_at: string;
  offline?: boolean;
};

const CourseList = async ({ params }: { params: { slug: string } }) => {
  const supabase = createClient();
  // Fetch course data
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (courseError) {
    console.error('Error fetching course:', courseError);
    throw new Error('Failed to fetch course');
  }

  // Fetch course and batch details using the new function
  const { data: courseDetails, error: detailsError } = await supabase
    .rpc('get_course_and_batch_details', { eduport_id: course.eduport_course_id });

  if (detailsError) {
    console.error('Error fetching course details:', detailsError);
    throw new Error('Failed to fetch course details');
  }

  // Extract batches from the response
  const batches = courseDetails?.batches || [];

  // Fetch course benefits for this course
  const { data: courseBenefits, error: benefitsError } = await supabase
    .from('course_benefits')
    .select('*')
    .eq('course_id', course.id)
    .order('order');


  if (benefitsError) {
    console.error('Error fetching course benefits:', benefitsError);
    throw new Error('Failed to fetch course benefits');
  }

  console.log("course", course);
  console.log("courseDetails", courseDetails);
  console.log("batches", batches);
  console.log("courseBenefits", courseBenefits);

  return (
    <div className='max-w-[1580px] mx-auto pb-[150px]'>
      {((course.banner_url && course.banner_url.trim() !== '') || (course.banner_mobile && course.banner_mobile.trim() !== '')) && (
        <CoursesOfferBanner bannerUrl={course.banner_url} bannerMobile={course.banner_mobile} />
      )}
      <div className='max-w-[1380px] mx-auto px-[16px] md:px-[24px]'>
        <div className="lg:flex mt-[60px]">
          <CarouselList courseId={course.id} courseTitle={course.title} />
          <CourseOffering batches={batches} course={course} />
        </div>
        <CourseBenefitsList courseBenefits={courseBenefits} />
        {/*<BorderText />*/}
        {/*<StudentProfileCards />*/}

      </div>
      <CourseListFooter batches={batches} />

    </div>
  )
}

export default CourseList