import BorderText from '@/components/user/course-list/border-text'
import CarouselList from '@/components/user/course-list/carousel-list'
import CourseBenefitsList from '@/components/user/course-list/course-benifit-list'
import CourseOffering from '@/components/user/course-list/course-offering'
import OurCoursesOfferBanner from '@/components/user/course-list/courses-offer-banner'
import StudentProfileCards from '@/components/user/course-list/stories-list'
import React from 'react'
import CourseListFooter from '@/components/user/course-list/cource-list-footer'
import { createClient } from '@/lib/supabase/server';

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

  // Fetch batches for this course
  const { data: batches, error: batchesError } = await supabase
    .from('batches')
    .select('*')
    .eq('course_id', course.id);

  if (batchesError) {
    console.error('Error fetching batches:', batchesError);
    throw new Error('Failed to fetch batches');
  }

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
  console.log("batches", batches);
  console.log("courseBenefits", courseBenefits);

  return (
    <div className='max-w-[1580px] mx-auto pb-[150px]'>
      <OurCoursesOfferBanner />
      <div className='max-w-[1380px] mx-auto px-[16px] md:px-[24px]'>
        <div className="lg:flex mt-[60px]">
          <CarouselList />
          <CourseOffering batches={batches} course={course} />
        </div>
        <CourseBenefitsList />
        <BorderText />
        <StudentProfileCards />

      </div>
      <CourseListFooter batches={batches} />

    </div>
  )
}

export default CourseList