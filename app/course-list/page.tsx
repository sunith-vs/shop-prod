import BorderText from '@/components/user/course-list/border-text'
import CarouselList from '@/components/user/course-list/carousel-list'
import CourseBenefitsList from '@/components/user/course-list/course-benifit-list'
import CourseOffering from '@/components/user/course-list/course-offering'
import OurCoursesOfferBanner from '@/components/user/course-list/courses-offer-banner'
import StudentProfileCards from '@/components/user/course-list/stories-list'
import React from 'react'
import CourseListFooter from '@/components/user/course-list/cource-list-footer'

const CourseList = () => {
  return (
    <div className='max-w-[1580px] mx-auto pb-[150px]'>
      <OurCoursesOfferBanner />

      <div className='max-w-[1380px] mx-auto px-[16px] md:px-[24px]'>

        <div className="lg:flex mt-[60px]">
          <CarouselList />
          <CourseOffering />
        </div>
        <CourseBenefitsList />
        <BorderText />
        <StudentProfileCards />

      </div>
      <CourseListFooter />

    </div>

  )
}

export default CourseList