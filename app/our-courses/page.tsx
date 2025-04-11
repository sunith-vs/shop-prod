import Head from 'next/head';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard } from '@/components/course/course-card';

export default function OurCoursesPage() {
  const tabs = ['Popular', 'NEET', 'JEE', 'KEAM', 'CUET', '11 - 12', '7 - 10'];

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
    // white background for the entire viewport
    <div className="bg-white w-full flex justify-center">
      <Head>
        <title>Our Courses - Learn with Live Classes</title>
        <meta name="description" content="Learn free with Live Classes and Pre Recorded Videos" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* White content area with responsive padding */}
      <div className="bg-white w-full max-w-7xl mx-auto px-4 lg:px-12 md:px-8 sm:px-6 py-10 sm:py-9">
        <div className="text-center mb-10 md:mb-7 sm:mb-4">
          <h1 className="font-bold text-3xl md:text-4xl mb-3">
            <span className="text-[#101828]">Our</span> <span className="text-[#FB6514]">Courses</span>
          </h1>
          <p className="text-[#667085] text-base sm:text-lg">Learn free with Live Classes and Pre Recorded Videos</p>
        </div>

        {/* Tabs using Shadcn UI - Fixed for mobile view */}
        <div className="mb-10 md:mb-7.5 sm:mb-5">
          <Tabs defaultValue="Popular" className="w-full">
            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
              <TabsList className="h-auto p-1 bg-[#00000000] flex gap-4 sm:gap-3 mb-10 sm:mb-4 w-max min-w-full sm:min-w-0 sm:w-fit sm:mx-auto">
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

        {/* Course Grid - Responsive columns with conditional rendering for 1-2 items */}
        {courses.length <= 2 ? (
          <div className="flex justify-center gap-4 mt-6 sm:mt-10">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} className="max-w-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 sm:mt-10">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}