import CarouselList from '@/components/user/home/carousel-list'
import CourseBenefitsList from '@/components/user/home/course-benifit-list'
import CourseOffering from '@/components/user/home/course-offering'
import OurCoursesOfferBanner from '@/components/user/home/our-courses-offer-banner'
import React from 'react'

const Home = () => {
  return (
    <div>
      <OurCoursesOfferBanner />
      {/* space between offer banner and NEET CRASH */}

      <div className="lg:flex mt-[60px]">
        <CarouselList />
        <CourseOffering />
      </div>
      <CourseBenefitsList />

    </div>
  )
}

export default Home