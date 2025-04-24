"use client";

import Head from 'next/head';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseCard } from '@/components/our-course/course-card';

export default function OurCoursesPage() {
  const courses = [
    // Popular (5)
    {
      id: 1,
      title: "Master online class for Xth SSLC",
      description: "Free classes for English/Malayalam Kerala Syllabus students with recorded and live classes.",
      board: ["CBSE", "KERALA STATE", "IB"],
      tab_title: "Popular",
      tab_id: 1,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 2,
      title: "Top Rated Science Program",
      description: "Most enrolled science course with concept-based learning. Free classes for English/Malayalam Kerala Syllabus students with recorded and live classes.",
      board: ["CBSE"],
      tab_title: "Popular",
      tab_id: 1,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 3,
      title: "Most Watched Recorded Class",
      description: "Popular among students for self-paced revision.",
      board: ["KERALA STATE"],
      tab_title: "Popular",
      tab_id: 1,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 4,
      title: "Best Math Booster",
      description: "Fast-paced math revision with interactive quizzes.",
      board: ["CBSE"],
      tab_title: "Popular",
      tab_id: 1,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 5,
      title: "Top Weekly Doubt Sessions",
      description: "Live sessions for weekly doubt solving and peer discussions.",
      board: ["IB"],
      tab_title: "Popular",
      tab_id: 1,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },

    // NEET (6)
    {
      id: 6,
      title: "NEET Preparation Course",
      description: "Comprehensive NEET prep with live classes and mock tests.",
      board: ["NEET"],
      tab_title: "NEET",
      tab_id: 2,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 7,
      title: "NEET Fast Track",
      description: "Crash course with revision notes and live mentoring.",
      board: ["NEET"],
      tab_title: "NEET",
      tab_id: 2,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 8,
      title: "NEET Mock Test Series",
      description: "Full-length NEET mock tests with performance analytics.",
      board: ["NEET"],
      tab_title: "NEET",
      tab_id: 2,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 9,
      title: "NEET Previous Year Questions",
      description: "Solved papers with discussion and explanation.",
      board: ["NEET"],
      tab_title: "NEET",
      tab_id: 2,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 10,
      title: "NEET Biology 60 Days Plan",
      description: "Topic-wise biology strategy with regular assessments.",
      board: ["NEET"],
      tab_title: "NEET",
      tab_id: 2,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 11,
      title: "NEET Chemistry Crash Pack",
      description: "All-in-one chemistry revision pack for NEET aspirants.",
      board: ["NEET"],
      tab_title: "NEET",
      tab_id: 2,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },

    // JEE (4)
    {
      id: 12,
      title: "JEE Crash Course",
      description: "Fast track revision with weekly mock tests.",
      board: ["JEE"],
      tab_title: "JEE",
      tab_id: 3,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 13,
      title: "JEE Main Practice Pack",
      description: "100+ practice tests and doubt-solving sessions.",
      board: ["JEE"],
      tab_title: "JEE",
      tab_id: 3,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 14,
      title: "JEE Previous Year Solved",
      description: "Learn from JEE PYQs with detailed walkthroughs.",
      board: ["JEE"],
      tab_title: "JEE",
      tab_id: 3,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 15,
      title: "JEE Advanced Math Booster",
      description: "Deep dive into advanced level math concepts.",
      board: ["JEE"],
      tab_title: "JEE",
      tab_id: 3,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },

    // CUET (3)
    {
      id: 16,
      title: "CUET Foundation",
      description: "Prepare for CUET with structured classes and assessments.",
      board: ["CUET"],
      tab_title: "CUET",
      tab_id: 4,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 17,
      title: "CUET Test Series",
      description: "CUET-specific MCQs with feedback and review options.",
      board: ["CUET"],
      tab_title: "CUET",
      tab_id: 4,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 18,
      title: "CUET Subject-wise Crash",
      description: "Focused 15-day revision per CUET subject.",
      board: ["CUET"],
      tab_title: "CUET",
      tab_id: 4,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },

    // 11 - 12 (4)
    {
      id: 19,
      title: "Master Class for XII",
      description: "Live + recorded sessions with board exam prep.",
      board: ["CBSE", "KERALA STATE"],
      tab_title: "11 - 12",
      tab_id: 5,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 20,
      title: "11th Grade Physics Concepts",
      description: "Visual explanations with quizzes and assignments.",
      board: ["CBSE"],
      tab_title: "11 - 12",
      tab_id: 5,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 21,
      title: "12th Grade Biology Live Class",
      description: "Live class series with weekly unit tests.",
      board: ["CBSE"],
      tab_title: "11 - 12",
      tab_id: 5,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 22,
      title: "11-12 Chemistry Doubt Series",
      description: "Doubt-solving sessions every weekend for Chemistry.",
      board: ["CBSE"],
      tab_title: "11 - 12",
      tab_id: 5,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },

    // 7 - 10 (2)
    {
      id: 23,
      title: "Class 8 Complete Course",
      description: "Recorded + live sessions in all subjects.",
      board: ["KERALA STATE"],
      tab_title: "7 - 10",
      tab_id: 6,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    {
      id: 27,
      title: "Math Tricks for Middle School",
      description: "Fun and visual math tricks to build problem-solving skills.",
      board: ["CBSE"],
      tab_title: "7 - 10",
      tab_id: 6,
      imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    },
    // {
    //   id: 27,
    //   title: "Math Tricks for Middle School",
    //   description: "Fun and visual math tricks to build problem-solving skills.",
    //   board: ["CBSE"],
    //   tab_title: "7 - 10",
    //   tab_id: 6,
    //   imageUrl: "https://assets.eduport.app/media/assets/MathsMaths0822105333cujcpx.png"
    // }
  ];


  // Add 'All Courses' tab and get unique tabs
  const uniqueTabs = ['All Courses', ...Array.from(new Set(courses.map(course => course.tab_title)))];
  const [activeTab, setActiveTab] = useState(uniqueTabs[0]);

  // Filter courses based on active tab
  const filteredCourses = activeTab === 'All Courses' ? courses : courses.filter(course => course.tab_title === activeTab);

  return (
    <div className="bg-white w-full flex justify-center">
      <Head>
        <title>Our Courses - Learn with Live Classes</title>
        <meta name="description" content="Learn free with Live Classes and Pre Recorded Videos" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="bg-white w-full max-w-7xl mx-auto py-9 lg:py-10">
        <div className="text-center mx-5 mb-3.5 lg:mb-8">
          <h1 className="font-bold text-4xl lg:text-5xl mb-3">
            <span className="text-[#101828]">Our</span> <span className="text-[#FB6514]">Courses</span>
          </h1>
          <p className="text-[#667085] text-normal lg:text-lg">
            Learn free with Live Classes and Pre Recorded Videos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto no-scrollbar">
            <TabsList className="h-auto bg-[#00000000] flex gap-3 lg:gap-4 w-max min-w-full sm:min-w-0 sm:w-fit sm:mx-auto px-4">
              {uniqueTabs.map(tab_title => (
                <TabsTrigger
                  key={tab_title}
                  value={tab_title}
                  className="px-3 sm:px-6 md:px-8 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 text-sm lg:text-xl font-medium data-[state=active]:bg-[#FB6514] data-[state=active]:text-white data-[state=active]:border-[#FB6514] data-[state=inactive]:bg-[#FFFBFA] data-[state=inactive]:text-[#FB6514] data-[state=inactive]:hover:bg-[#FFE4D2] border-2 border-[#FFE4D2]"
                >
                  {tab_title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Show filtered courses for the selected tab */}
          {uniqueTabs.map(tab_title => {
            return (
              <TabsContent key={tab_title} value={tab_title}>
                <div className="flex justify-center w-full  px-4 py-3.5 lg:pt-8">
                  <div className="w-full max-w-6xl">
                    {filteredCourses.length <= 2 ? (
                      <div className="flex flex-col sm:flex-row justify-center gap-6 mx-auto">
                        {filteredCourses.map((course) => (
                          <div className="w-full sm:max-w-sm" key={course.id}>
                            <CourseCard course={course} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
                        {filteredCourses.map((course) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}