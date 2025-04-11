import BorderText from '@/components/user/home/border-text'
import CarouselList from '@/components/user/home/carousel-list'
import CourseBenefitsList from '@/components/user/home/course-benifit-list'
import CourseOffering from '@/components/user/home/course-offering'
import HomeFooter from '@/components/user/home/home-footer'
import OurCoursesOfferBanner from '@/components/user/home/our-courses-offer-banner'
import StudentProfileCards from '@/components/user/home/stories-list'
import React from 'react'

const Home = () => {
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
      <HomeFooter />

    </div>

  )
}

export default Home