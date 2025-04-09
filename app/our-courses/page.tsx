'use client';

import React, { useEffect } from 'react'
import { useState } from 'react';
import Head from 'next/head';
import { Icons } from '@/components/icons';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OurCoursesPage() {
  const tabs = ['Popular', 'NEET', 'JEE', 'KEAM', 'CUET', '11 - 12', '7 - 10'];
  const [contentHeight, setContentHeight] = useState('100vh');
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  // Calculate the correct height after the component mounts
  useEffect(() => {
    // Function to calculate and set the page height
    const calculateHeight = () => {
      // Assuming the navbar has a fixed height or we can get it dynamically
      const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
      setContentHeight(`calc(100vh - ${navbarHeight}px)`);
    };

    // Calculate on mount and when window resizes
    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    // Clean up event listener
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  const courses = [
    {
      id: 1,
      title: "Master online class for Xth SSLC",
      description: "Free classes provided to all English/Malayalam Kerala Syllabus students that contain recorded, live classes.",
      board: ["CBSE", "KERALA STATE", "IB"],
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 2,
      title: "Master online class for XIIth",
      description: "Free classes provided to all English/Malayalam Kerala Syllabus students that contain recorded, live classes.",
      board: ["CBSE", "KERALA STATE"],
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 3,
      title: "NEET Preparation Course",
      description: "Comprehensive NEET preparation course with live classes, mock tests, and study materials.",
      board: ["NEET"],
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 4,
      title: "Master online class for XIIth",
      description: "Free classes provided to all English/Malayalam Kerala Syllabus students that contain recorded, live classes.",
      board: ["CBSE", "KERALA STATE"],
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 5,
      title: "Master online class for Xth SSLC",
      description: "Free classes provided to all English/Malayalam Kerala Syllabus students that contain recorded, live classes.",
      board: ["CBSE", "KERALA STATE"],
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 6,
      title: "NEET Preparation Course",
      description: "Comprehensive NEET preparation course with live classes, mock tests, and study materials.",
      board: ["NEET"],
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    }
  ];

  return (
    // Yellow background for the entire viewport
    <div className="bg-white w-full flex justify-center"
      style={{ minHeight: contentHeight }}>
      <Head>
        <title>Our Courses - Learn with Live Classes</title>
        <meta name="description" content="Learn free with Live Classes and Pre Recorded Videos" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* White content area with responsive padding */}
      <div className="bg-white w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-10 md:py-16">
        <div className="text-center mb-4 sm:mb-5">
          <h1 className="text-3xl sm:text-4xl font-bold mb-1">
            <span className="text-[#101828]">Our</span> <span className="text-[#FB6514]">Courses</span>
          </h1>
          <p className="text-[#667085] text-base sm:text-lg">Learn free with Live Classes and Pre Recorded Videos</p>
        </div>

        {/* Tabs using Shadcn UI - Fixed for mobile view */}
        <div className="mb-5">
          <Tabs defaultValue="Popular" className="w-full">
            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
              <TabsList className="h-auto p-1 bg-[#00000000] flex gap-2.5 w-max min-w-full sm:min-w-0 sm:w-fit sm:mx-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-3 sm:px-6 md:px-8 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 text-xs sm:text-sm data-[state=active]:bg-[#FB6514] data-[state=active]:text-white data-[state=active]:border-[#FB6514] data-[state=inactive]:bg-[#FFFBFA] data-[state=inactive]:text-[#FB6514] data-[state=inactive]:hover:bg-[#FFE4D2] border-2 border-[#FFE4D2]"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Add custom scrollbar style */}
        <style jsx global>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>

        {/* Course Grid - Responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-10">
          {courses.map((course) => (

            <div
              key={course.id}
              className={`bg-white rounded-[20px] p-3 border border ${hoveredCardId === course.id ? 'border-[#00000000]' : 'border-[#EAECF0]'} ${hoveredCardId === course.id ? ' border-0' : ' border-1'} relative overflow-hidden"`}
              onMouseEnter={() => setHoveredCardId(course.id)}
              onMouseLeave={() => setHoveredCardId(null)}
            >
              {/* Dimming overlay layer - only visible when card is hovered */}
              <div
                className={`absolute inset-0 bg-[rgba(255,97,42,0.18)] rounded-[20px] transition-opacity duration-300 z-10 ${hoveredCardId === course.id ? 'opacity-100' : 'opacity-0'
                  }`}
              />

              <div className="bg-[#00000000] rounded-[20px] overflow-hidden relative" style={{ paddingTop: '60.57%' }}>
                <img
                  src={course.imageUrl}
                  alt={`${course.title} thumbnail`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>

              {/* View Now button - only visible for the specific hovered card */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hoveredCardId === course.id ? 'opacity-100' : 'opacity-0'} z-20`}>
                <button className="flex items-center gap-2 bg-[#EC4909] text-white px-4 py-3 rounded-[10px] transition-colors">
                  View Now
                  <div className="w-6 h-6 relative bg-white rounded-[39px] flex justify-center items-center gap-[3px] overflow-hidden">
                    <ArrowRight size={12} color="#FB6514" />
                  </div>
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-[#1D2939] mt-3 sm:mt-4 line-clamp-2 ">{course.title}</h3>
              <div className='flex flex-col justify-between h-[120px]'>
                <p className="font-regular text-[#667085] mt-1 sm:mt-1.5 text-sm sm:text-base line-clamp-3 overflow-hidden text-ellipsis">{course.description}</p>
                <div className="flex flex-wrap items-center">
                  <div className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    <Icons.book className="w-full h-full text-orange-500" />
                  </div>
                  {course.board.map((board, index) => (
                    <React.Fragment key={board}>
                      <span className="rounded-full text-xs sm:text-sm font-medium text-[#667085]">
                        {board}
                      </span>
                      {index !== course.board.length - 1 && (
                        <span className="rounded-full text-xs sm:text-sm font-regular text-[#D0D5DD] px-1.5">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}