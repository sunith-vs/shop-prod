
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

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Image 
        src={isMediumOrSmall ? bannerMobile : bannerUrl}
        alt="Our Courses Offer Banner"
        width={0}
        height={0}
        sizes="100vw"
        style={{ 
          width: '100%', 
          height: 'auto',
          objectFit: 'contain' 
        }}
        priority
      />
    </div>
  )
}

export default CoursesOfferBanner