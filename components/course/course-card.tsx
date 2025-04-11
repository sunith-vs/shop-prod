import { Course } from '@/types/course';
import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Icons } from '@/components/icons';



type CourseCardProps = {
    course: Course;
    className?: string;
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
    return (
        <Card
            className={`course-card bg-white rounded-[20px] p-3 border hover:border-0 relative overflow-hidden group ${className}`}
        >
            {/* Dimming overlay layer - visible on hover using group-hover */}
            <div
                className="absolute inset-0 bg-[rgba(255,97,42,0.18)] rounded-[20px] opacity-0 group-hover:opacity-100 z-10"
            />

            <div className="bg-[#00000000] rounded-[20px] overflow-hidden relative" style={{ paddingTop: '60.57%' }}>
                <img
                    src={course.imageUrl}
                    alt={`${course.title} thumbnail`}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    loading="lazy"
                />
            </div>

            {/* View Now button - visible on hover using group-hover */}
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-20">
                <button className="flex items-center gap-2 bg-[#EC4909] text-white px-4 py-3 rounded-[10px] transition-colors">
                    View Now
                    <div className="w-6 h-6 relative bg-white rounded-[39px] flex justify-center items-center gap-[3px] overflow-hidden">
                        <ArrowRight size={12} color="#FB6514" />
                    </div>
                </button>
            </div>

            <CardHeader className="p-0">
                <h3 className="text-lg sm:text-xl font-semibold text-[#1D2939] mt-3 sm:mt-4 line-clamp-2">{course.title}</h3>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col justify-between min-h-[120px]">
                    <p className="font-regular text-[#667085] mt-1 sm:mt-1.5 text-sm sm:text-base line-clamp-3 overflow-hidden text-ellipsis">
                        {course.description}
                    </p>
                    <div className="flex flex-wrap items-center mt-2">
                        <div className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                            <Icons.book className="w-full h-full text-orange-500" />
                        </div>
                        {course.board && course.board.map((board, index) => (
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
            </CardContent>
        </Card>
    )
}

