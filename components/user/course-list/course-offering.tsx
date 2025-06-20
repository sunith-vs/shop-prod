'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import PurchaseModal from '../purchase/purchase-modal';
import { usePurchaseStore } from '@/lib/store/purchase-store';

// Define TypeScript interfaces
interface CourseOptionProps {
  id: number;
  type: string;
  name: string;
  price: number;
  isSelected: boolean;
  onClick: (id: number) => void;
  highlighted?: boolean;
  batches?: Batch[];
}

interface FeatureItemProps {
  text: string;
}

interface CourseData {
  id: number;
  type: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  highlighted?: boolean;
  duration?: string;
}

interface CourseCategory {
  courses: CourseData[];
}

interface Batch {
  id: string;
  name: string;
  type: string;
  amount: number;
  subject_batch_id: string;
  course_id: string;
  created_at: string;
  offline?: boolean;
  eduport_batch_id: number;
  discount: number;
  duration: string;
  offer_claims?: {
    id: string;
    created_at: string;
    offer: {
      id: string;
      title: string;
      percentage: number;
      expiry: string;
      is_active: boolean;
      created_at: string;
    };
  }[];
}

interface Course {
  id: number;
  banner_url: string;
  title: string;
  slug: string;
  sub_heading: string;
  description: string;
  highlights: string[];
  brochure_url: string;
  tag_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  thumbnail: string;
  banner_mobile: string;
  eduport_course_id: number;
}

interface CourseOfferingProps {
  batches?: Batch[];
  course?: Course;
}

// Course option component for better reusability
const CourseOption = ({ id, type, name, price, isSelected, onClick, batches }: CourseOptionProps) => {
  console.log('duration', batches?.find(batch => batch.eduport_batch_id === id)?.duration);
  const batch = batches?.find(batch => batch.eduport_batch_id === id);
  // Get discount directly from the batch object, similar to choose-cource-bs.tsx
  const discountPercentage = batch?.discount || 0;
  // Calculate discounted price using the same formula as in choose-cource-bs.tsx
  const discountedPrice = Math.round(price * (1 - discountPercentage / 100));
  return (
    <div
      className={`border ${isSelected ? 'border-orange-500' : 'border-gray-200'} 
    rounded-xl p-4 mb-[10px] bg-[#FFF8E4] relative `}
    >
      <div className="flex items-center justify-between cursor-pointer" onClick={() => onClick(id)}>
        <div className="flex items-center">
          <div
            className={`p-[1px] relative rounded-[10.83px] border-[1.50px] ${isSelected ? 'border-[#fb6514]' : 'border-[#1d2939]'} rounded-full border border-gray-400 mr-3 flex items-center justify-center cursor-pointer`}
          >
            {isSelected ? <div className="w-4 h-4 bg-[#fb6514] rounded-full"></div> : <div className="w-4 h-4 rounded-full"></div>}
          </div>
          <div>
            <p className="text-[#1d2939] text-base font-bold">{name}</p>
            <h3 className="text-[#1d2939] text-sm font-normal">{type}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#1d2939] text-sm md:text-base font-bold">₹{discountedPrice.toLocaleString()} <span className="text-[#1d2939] font-normal text-sm md:text-base">{batch?.duration ? (batch.duration === '0' ? '' : { 12: 'for 1 year', 24: 'for 2 years', 36: 'for 3 years' }[batch.duration] || `for ${batch.duration} months`) : 'for 0 months'}</span></p>
          {discountPercentage > 0 && (<div className="flex items-center justify-end">
            <p className="text-[#1d2939] text-xs md:text-sm font-normal line-through mr-1">₹{price.toLocaleString()}</p>
            <p className="text-[#0e9a49] text-xs md:text-sm font-bold">({discountPercentage}% OFF)</p>
          </div>)}
        </div>
      </div>
    </div>
  );
};

// Feature item component for consistency
const FeatureItem = ({ text }: FeatureItemProps) => (
  <div className="flex items-center">
    <span className="text-yellow-400 mr-2">★</span>
    <span className="text-gray-800 font-medium">{text}</span>
  </div>
);

// Main component
const CourseOffering = ({ batches, course }: CourseOfferingProps) => {
  // Use the first batch ID as the default selected course
  const defaultSelectedCourse = batches && batches.length > 0 ? batches[0].eduport_batch_id : -1;
  const [selectedCourse, setSelectedCourse] = useState(defaultSelectedCourse);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Access the Zustand store
  const { openBottomSheet } = usePurchaseStore();

  // Use provided batches or sample data if none provided
  const batchesToUse = batches && batches.length > 0 ? batches : [];

  // Convert batches to course categories format using the same approach as in choose-cource-bs.tsx
  const courseCategories: CourseCategory[] = [
    {
      courses: batchesToUse.map(batch => {
        // Using the same approach as in choose-cource-bs.tsx
        return {
          id: batch.eduport_batch_id,
          type: batch.type === 'offline' ? 'Offline' : 'Online',
          name: batch.name,
          price: batch.amount * (1 - batch.discount / 100),
          originalPrice: batch.amount,
          discount: batch.discount,
          highlighted: batch.type !== 'offline',
          duration: { 12: '1 year', 24: '2 years', 36: '3 years' }[batch.duration] || `${batch.duration} months`
        };
      })
    }
  ];

  console.log('Using batches:', batchesToUse);

  // Use course highlights if available, otherwise use default features
  const highlights = course?.highlights || [];

  return (
    <div className=" lg:pl-[40px]  lg:w-[900px]">
      <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header with Special Offer */}
        {course?.tag_url && (
          <div className="relative">
            <Image
              src={course?.tag_url || ''}
              alt="Special Offer"
              width={135}
              height={40}
              className="object-contain"
            />
          </div>
        )}

        <div className="px-6 pb-6 pt-[12px]">
          {/* Title */}
          <h1 className="text-[#101828] text-2xl font-semibold leading-relaxed mb-4">
            <span className="text-[#ff7b34]">Join</span> classes now!
          </h1>

          {/* Description */}
          <p className="text-[#667085] text-sm md:text-base font-normal  leading-normal mb-[14px]">
            {course?.description || 'Description not available'}
          </p>


          {/* Feature List */}
          <div className="justify-start text-[#1d2939] text-sm md:text-base font-medium tracking-wider">
            {highlights.map((feature: string, index: number) => (
              <FeatureItem key={index} text={feature} />
            ))}
          </div>

          {/* Course Categories */}
          {courseCategories.map((category, categoryIndex) => (
            <div className="mb-4 mt-[14px]" key={categoryIndex}>
              {/* Course Options */}
              {category.courses.map((course: CourseData) => (
                <CourseOption
                  key={course.id}
                  id={course.id}
                  type={course.type}
                  name={course.name}
                  price={course.originalPrice || 0}
                  isSelected={selectedCourse === course.id}
                  onClick={setSelectedCourse}
                  highlighted={course.highlighted}
                  batches={batchesToUse}
                />
              ))}
            </div>
          ))}

          {/* CTA Buttons */}
          {courseCategories.length > 0 && (<button
              className="w-full bg-[#FB6514] text-white font-bold py-4 rounded-xl mb-[14px] transition duration-200 hover:bg-orange-600"
              onClick={() => {
                setIsPurchaseModalOpen(true);
                // Hide the CourseListFooter when BUY NOW is clicked
                const footerContainer = document.getElementById('course-list-footer-container');
                if (footerContainer) {
                  footerContainer.style.display = 'none';
                }
              }}
          >
            BUY NOW
          </button>)}

          {course?.brochure_url && course.brochure_url.trim() !== '' && (
            <button
              className="w-full text-[#FB6514] font-bold py-4 flex items-center justify-center bg-[#fff6f1] rounded-xl"
              onClick={() => {
                // Open the brochure URL in a new tab
                window.open(course.brochure_url, '_blank', 'noopener,noreferrer');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Brochure
            </button>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          courseId={selectedCourse}
          courseAmount={courseCategories[0].courses.find(course => course.id === selectedCourse)?.price || 0}
          courseName={courseCategories[0].courses.find(course => course.id === selectedCourse)?.name || ''}
          batches={batches}
        />
      )}
    </div>
  );
};

export default CourseOffering;