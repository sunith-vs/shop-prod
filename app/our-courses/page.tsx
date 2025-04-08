'use client';

import React, { useEffect } from 'react'
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Icons } from '@/components/icons';

export default function OurCoursesPage() {
  const [activeTab, setActiveTab] = useState('Popular');
  const tabs = ['Popular', 'NEET', 'JEE', 'KEAM', 'CUET', '11 - 12', '7 - 10'];
  const [contentHeight, setContentHeight] = useState('100vh');

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
      bgColor: "bg-orange-100",
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 2,
      title: "Master online class for XIIth",
      description: "Free classes provided to all English/Malayalam Kerala Syllabus students that contain recorded, live classes.",
      board: ["CBSE", "KERALA STATE"],
      bgColor: "bg-red-100",
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 3,
      title: "NEET Preparation Course",
      description: "Comprehensive NEET preparation course with live classes, mock tests, and study materials.",
      board: ["NEET"],
      bgColor: "bg-blue-100",
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 2,
      title: "Master online class for XIIth",
      description: "Free classes provided to all English/Malayalam Kerala Syllabus students that contain recorded, live classes.",
      board: ["CBSE", "KERALA STATE"],
      bgColor: "bg-red-100",
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 1,
      title: "Master online class for Xth SSLC",
      description: "Free classes provided to all English/Malayalam Kerala Syllabus students that contain recorded, live classes.",
      board: ["CBSE", "KERALA STATE"],
      bgColor: "bg-orange-100",
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    }, {
      id: 3,
      title: "NEET Preparation Course",
      description: "Comprehensive NEET preparation course with live classes, mock tests, and study materials.",
      board: ["NEET"],
      bgColor: "bg-blue-100",
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    }
  ];

  return (
    // Yellow background for the entire viewport
    <div className="bg-white  w-full flex justify-center "
      style={{ height: contentHeight }}>
      <Head>
        <title>Our Courses - Learn with Live Classes</title>
        <meta name="description" content="Learn free with Live Classes and Pre Recorded Videos" />
      </Head>

      {/* White content area with 80px padding */}
      <div className="bg-white max-w-7xl mx-auto p-20">
        <div className="text-center mb-5">
          <h1 className="text-4xl font-bold mb-1">
            <span className="text-[#101828]">Our</span>    <span className="text-[#FB6514]">Courses</span>
          </h1>
          <p className="text-[#667085] text-lg">Learn free with Live Classes and Pre Recorded Videos</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-5  px-2.5 py-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-1.5 rounded-[73px] whitespace-nowrap ${activeTab === tab
                ? 'bg-[#FB6514] text-white border border-[#FB6514] border-2'
                : 'bg-[#FFFBFA] text-[#FB6514] hover:bg-[#FFE4D2] border border-[#FFE4D2] border-2'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-[20px] px-3 pt-3 pb-6 border border-[#EAECF0] border-1`}
            >
              <div className="bg-[#00000000] rounded-[20px] overflow-hidden relative" style={{ paddingTop: '60.57%' }}>
                <img
                  src={course.imageUrl}
                  alt={`${course.title} thumbnail`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#1D2939] mt-4">{course.title}</h3>
              <p className="font-regular text-[#667085] mt-1.5">{course.description}</p>
              <div className="flex flex-wrap mt-4  items-center " >
                <div className="mr-2 w-5 h-5 flex items-center justify-center">
                  <Icons.book className="w-full h-full text-orange-500" />
                </div>                {course.board.map((board, index) => (
                  (index == course.board.length - 1) ? <span
                    key={board}
                    className="bg-white rounded-full text-sm font-medium text-[#667085]"
                  >
                    {board}
                  </span> : <><span className="bg-white rounded-full text-sm font-medium text-[#667085]">
                    {board}
                  </span><span className="bg-white rounded-full text-sm font-regular text-[#D0D5DD] px-1.5">
                      |
                    </span></>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
