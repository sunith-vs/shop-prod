import React from 'react'
import Image from 'next/image'

const OurCoursesOfferBanner = () => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Image 
        src="/svgs/our-courses-offer-banner.svg"
        alt="Our Courses Offer Banner"
        width={0}
        height={0}
        sizes="100vw"
        style={{ 
          width: '100%', 
          height: 'auto',
          objectFit: 'contain' 
        }}
      />
    </div>
  )
}

export default OurCoursesOfferBanner