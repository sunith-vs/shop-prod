'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import PurchaseModal from '../purchase/purchase-modal';

// Define TypeScript interfaces
interface CourseOptionProps {
  id: string;
  type: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isSelected: boolean;
  onClick: (id: string) => void;
  highlighted?: boolean;
}

interface FeatureItemProps {
  text: string;
}

interface CourseData {
  id: string;
  type: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  highlighted?: boolean;
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
}

interface CourseOfferingProps {
  batches?: Batch[];
}

// Course option component for better reusability
const CourseOption = ({ id, type, name, price, originalPrice, discount, isSelected, onClick, highlighted = false }: CourseOptionProps) => (
  <div
    className={`border ${isSelected ? 'border-orange-500' : 'border-gray-200'} 
    rounded-xl p-4 mb-[10px] bg-[#FFF8E4] relative `}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className={`w-[21.67px] h-[21.67px] relative rounded-[10.83px] border-[1.50px] ${isSelected ? 'border-[#fb6514]' : 'border-[#1d2939]'} rounded-full border border-gray-400 mr-3 flex items-center justify-center cursor-pointer`}
          onClick={() => onClick(id)}
        >
          {isSelected && <div className="w-4 h-4 bg-[#fb6514] rounded-full"></div>}
        </div>
        <div>
          <p className="text-[#1d2939] text-base font-bold">{name}</p>
          <h3 className="text-[#1d2939] text-sm font-normal">{type}</h3>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[#1d2939] text-sm md:text-base font-bold">₹{price.toLocaleString()} <span className="text-[#1d2939] font-normal text-sm md:text-base">for 2 years</span></p>
        <div className="flex items-center justify-end">
          {originalPrice && <p className="text-[#1d2939] text-xs md:text-sm font-normal line-through mr-1">₹{originalPrice.toLocaleString()}</p>}
          {discount && <p className="text-[#0e9a49] text-xs md:text-sm font-bold">({discount}% OFF)</p>}
        </div>
      </div>
    </div>
  </div>
);

// Feature item component for consistency
const FeatureItem = ({ text }: FeatureItemProps) => (
  <div className="flex items-center">
    <span className="text-yellow-400 mr-2">★</span>
    <span className="text-gray-800 font-medium">{text}</span>
  </div>
);

// Main component
const CourseOffering = ({ batches }: CourseOfferingProps) => {
  // Use the first batch ID as the default selected course
  const defaultSelectedCourse = batches && batches.length > 0 ? batches[0].id : 'offline-neet';
  const [selectedCourse, setSelectedCourse] = useState(defaultSelectedCourse);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Use provided batches or sample data if none provided
  const batchesToUse = batches && batches.length > 0 ? batches : [];

  // Convert batches to course categories format
  const courseCategories: CourseCategory[] = [
    {
      courses: batchesToUse.map(batch => ({
        id: batch.id,
        type: batch.type === 'offline' ? 'Offline' : 'Online',
        name: batch.name,
        price: batch.amount,
        originalPrice: Math.round(batch.amount * 1.1), // Adding 10% to original price to show discount
        discount: 10,
        highlighted: batch.type !== 'offline'
      }))
    }
  ];

  console.log('Using batches:', batchesToUse);

  // Features list
  const features = [
    "Expert Classes by IIT/AIIMS/NIT Alumn",
    "78 progress tests",
    "Personal mentorship",
    "Personal mentorship",
    "Focused 60-Day Crash Plan"
  ];

  return (
    <div className=" lg:pl-[40px]  lg:w-[900px]">
      <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header with Special Offer */}
        <div className="relative">
          <div className="absolute top-4 left-4">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
              Special Offer
            </div>
          </div>
        </div>

        <div className="p-6 pt-16">
          {/* Title */}
          <h1 className="text-[#101828] text-2xl font-semibold leading-relaxed mb-4">
            <span className="text-[#ff7b34]">Join</span> classes now!
          </h1>

          {/* Description */}
          <p className="text-[#667085] text-sm md:text-base font-normal  leading-normal mb-[14px]">
            Eduport provides over 1000 hours of clear, simple classes and 78 tests to help you track your progress, all guided by experienced local teachers from IITs and NITs, while the system adjusts to your pace with easy-to-use tools and personal mentorship.
          </p>


          {/* Feature List */}
          <div className="justify-start text-[#1d2939] text-sm md:text-base font-medium tracking-wider">
            {features.map((feature: string, index: number) => (
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
                  price={course.price}
                  originalPrice={course.originalPrice}
                  discount={course.discount}
                  isSelected={selectedCourse === course.id}
                  onClick={setSelectedCourse}
                  highlighted={course.highlighted}
                />
              ))}
            </div>
          ))}

          {/* CTA Buttons */}
          <button 
            className="w-full bg-[#FB6514] text-white font-bold py-4 rounded-xl mb-[14px] transition duration-200 hover:bg-orange-600"
            onClick={() => setIsPurchaseModalOpen(true)}
          >
            BUY NOW
          </button>

          <button className="w-full text-[#FB6514] font-bold py-4 flex items-center justify-center bg-[#fff6f1] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Brochure
          </button>
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
        />
      )}
    </div>
  );
};

export default CourseOffering;