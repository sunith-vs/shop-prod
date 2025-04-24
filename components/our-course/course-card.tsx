import { OurCourse } from '@/types/course';
import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Icons } from '@/components/icons';



type CourseCardProps = {
    course: OurCourse;
    className?: string;
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
    return (
        <Card
            className={`course-card bg-white rounded-[20px] p-3 border sm:hover:border-0 relative overflow-hidden group h-full flex flex-col ${className}`}
        >
            {/* Dimming overlay layer - visible on hover using group-hover */}
            <div
                className="absolute inset-0 bg-[rgba(255,97,42,0.18)] rounded-[20px] opacity-0 sm:group-hover:opacity-100 z-10"
            />

            <div className="bg-[#00000000] rounded-[20px] overflow-hidden relative" style={{ paddingTop: '60.57%' }}>
                <img
                    src={course.thumbnail}
                    alt={`${course.title} thumbnail`}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    loading="lazy"
                />
            </div>

            {/* View Now button - visible on hover using group-hover */}
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 sm:group-hover:opacity-100 z-20">
                <button className="flex items-center gap-2 bg-[#EC4909] text-white px-4 py-3 rounded-[10px] transition-colors text-lg font-semibold">
                    View Now
                    <div className="w-6 h-6 relative bg-white rounded-[39px] flex justify-center items-center gap-[3px] overflow-hidden">
                        <ArrowRight size={12} color="#FB6514" />
                    </div>
                </button>
            </div>

            <CardContent className="p-0 flex flex-col flex-1">
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold lg:font-bold lg:text-xl text-[#1D2939] mt-4 line-clamp-2 ml-0.5 mr-0.5">{course.title}</h3>
                    <p className="text-sm font-normal text-[#667085] mt-1.5 lg:text-base line-clamp-3 overflow-hidden text-ellipsis ml-0.5 mr-0.5">
                        {course.sub_heading}
                    </p>
                </div>
                {course.board && course.board.length > 0 && (
                    <div className="flex items-center gap-2 mt-auto pt-4">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                            <Icons.book className="w-full h-full text-orange-500" />
                        </div>
                        <div className="flex items-center flex-wrap gap-x-1.5">
                            {course.board.map((board, index) => (
                                <React.Fragment key={board}>
                                    <span className="rounded-full text-base font-semibold text-[#667085]">
                                        {board}
                                    </span>
                                    {index !== course.board.length - 1 && (
                                        <span className="rounded-full text-base text-[#D0D5DD] px-1.5">|</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}