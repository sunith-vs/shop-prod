import { OurCourse } from '@/types/course';
import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from "next/link";



type CourseCardProps = {
    course: OurCourse;
    className?: string;
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
    return (
        <Link href={`/${course.slug}`} className="group">
            <Card
                className={`course-card bg-white rounded-[20px] p-3 border hover:border-2 hover:border-[#FB6514] relative overflow-hidden group h-full flex flex-col ${className}`}
            >

                <div className="bg-[#00000000] rounded-[20px] overflow-hidden relative" style={{ paddingTop: '60.57%' }}>
                    <img
                        src={course.thumbnail}
                        alt={`${course.title} thumbnail`}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        loading="lazy"
                    />
                </div>

                <CardContent className="p-0 flex flex-col flex-1">
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium lg:font-semibold lg:text-xl text-[#1D2939] mt-4 line-clamp-2 ml-0.5 mr-0.5">{course.title}</h3>
                        <p className="text-sm font-light text-[#667085] mt-1.5 lg:text-base line-clamp-3 overflow-hidden text-ellipsis ml-0.5 mr-0.5">
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
                                        <span className="rounded-full text-sm font-semibold text-[#667085]">
                                            {board}
                                        </span>
                                        {index !== course.board.length - 1 && (
                                            <span className="rounded-full text-sm font-light text-[#D0D5DD] px-1.5">|</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}