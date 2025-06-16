'use client'
import React from 'react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const CoursesOfferBanner = ({ bannerUrl, bannerMobile }: { bannerUrl: string, bannerMobile: string }) => {
  const [isMediumOrSmall, setIsMediumOrSmall] = useState(false)

  useEffect(() => {
    // Function to check if screen is medium or small (less than 1024px)
    const checkScreenSize = () => {
      setIsMediumOrSmall(window.innerWidth < 1024)
    }

    // Initial check
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize)

    // Clean up event listener
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Ensure we have valid image URLs by providing fallbacks
  const mobileSrc = bannerMobile || bannerUrl || '/images/default-banner-mobile.jpg'
  const desktopSrc = bannerUrl || bannerMobile || '/images/default-banner.jpg'

  return (
    <div className="relative w-full" style={{ aspectRatio: '1728/220' }}>
      <Image
        src={isMediumOrSmall ? mobileSrc : desktopSrc}
        alt="Our Courses Offer Banner"
        fill
        sizes="100vw"
        style={{
          objectFit: 'contain'
        }}
        priority
      />
    </div>
  )
}

export default CoursesOfferBanner