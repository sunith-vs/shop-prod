'use client';

import React, { useState } from 'react';
import Image from 'next/image';

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
  title: string;
  courses: CourseData[];
}

// Course option component for better reusability
const CourseOption = ({ id, type, name, price, originalPrice, discount, isSelected, onClick, highlighted = false }: CourseOptionProps) => (
  <div
    className={`border ${isSelected ? 'border-orange-500' : 'border-gray-200'} 
    rounded-xl p-4 mb-[10px] ${highlighted ? 'bg-yellow-50' : ''} relative h-[82px]`}
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
          <h3 className="font-medium text-gray-800">{type}</h3>
          <p className="text-gray-700">{name}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-xl">₹{price.toLocaleString()} <span className="text-gray-600 font-normal text-sm">for 2 years</span></p>
        <div className="flex items-center justify-end">
          {originalPrice && <p className="text-gray-600 line-through text-sm">₹{originalPrice.toLocaleString()}</p>}
          {discount && <p className="text-green-600 font-medium ml-1">({discount}% OFF)</p>}
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
const CourseOffering = () => {
  const [selectedCourse, setSelectedCourse] = useState('offline-neet');

  // Course data - makes it easier to add/modify courses
  const courseCategories: CourseCategory[] = [
    {
      title: "NEET Crash",
      courses: [
        {
          id: 'offline-neet',
          type: 'Offline',
          name: 'NEET CRASH',
          price: 15000,
          originalPrice: 15000,
          discount: 10,
          highlighted: false
        },
        {
          id: 'online-neet',
          type: 'Online',
          name: 'NEET CRASH',
          price: 15000,
          originalPrice: 15000,
          discount: 10,
          highlighted: true
        }
      ]
    },
    {
      title: "JEE Crash",
      courses: [
        {
          id: 'online-jee-1',
          type: 'Online',
          name: 'NEET CRASH', // This seems to be an error in the original, keeping it as is
          price: 15000,
          originalPrice: 15000,
          discount: 10,
          highlighted: true
        },
        {
          id: 'online-jee-2',
          type: 'Online',
          name: 'NEET CRASH', // This seems to be an error in the original, keeping it as is
          price: 15000,
          originalPrice: 15000,
          discount: 10,
          highlighted: true
        }
      ]
    }
  ];

  // Features list
  const features = [
    "Expert Classes by IIT/AIIMS/NIT Alumn",
    "78 progress tests",
    "Personal mentorship",
    "Personal mentorship",
    "Focused 60-Day Crash Plan"
  ];

  return (
    <div className=" lg:pl-[40px] md:mt-[18px] lg:w-[900px]">
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
          <h1 className="text-3xl font-bold mb-4">
            <span className="text-[#fb6514]">Join</span> classes now!
          </h1>

          {/* Description */}
          <p className="text-[#667085] text-base font-normal font-['Inter'] leading-normal mb-[14px]">
            Eduport provides over 1000 hours of clear, simple classes and 78 tests to help you track your progress, all guided by experienced local teachers from IITs and NITs, while the system adjusts to your pace with easy-to-use tools and personal mentorship.
          </p>


          {/* Feature List */}
          <div className="justify-start text-[#1d2939] text-base font-medium font-['Inter'] tracking-wider">
            {features.map((feature: string, index: number) => (
              <FeatureItem key={index} text={feature} />
            ))}
          </div>

          {/* Course Categories */}
          {courseCategories.map((category, categoryIndex) => (
            <div className="mb-4" key={categoryIndex}>
              <h2 className="text-xl font-bold mb-3">{category.title}</h2>

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
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl mb-[14px] transition duration-200">
            BUY NOW
          </button>

          <button className="w-full text-orange-500 font-bold py-4 flex items-center justify-center bg-[#fff6f1] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Brochure
          </button>
        </div>
      </div>

    </div>
  );
};

export default CourseOffering;