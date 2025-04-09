"use client"

// CourseBottomSheet.tsx
import React, { useState } from 'react';

interface CourseBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const CourseBottomSheet: React.FC<CourseBottomSheetProps> = ({ isOpen, onClose }) => {
    const [selectedCourse, setSelectedCourse] = useState('NEET');

    const courses = [
        {
            id: 'neet',
            title: 'NEET Crash',
            type: 'NEET CRASH',
            price: '₹15,000',
            duration: '2 years',
            originalPrice: '₹15,000',
            discount: '(10% OFF)'
        },
        {
            id: 'jee',
            title: 'JEE Crash',
            type: 'JEE CRASH',
            price: '₹15,000',
            duration: '2 years',
            originalPrice: '₹15,000',
            discount: '(10% OFF)'
        }
    ];

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            {/* Overlay background */}
            <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

            {/* Bottom sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg transition-transform duration-300 ease-in-out transform">
                <div className="max-w-4xl mx-auto px-4 py-6 lg:w-[720px]">
                    <h2 className="text-[#1d2939] text-2xl font-bold mb-[14px]">Choose Course</h2>

                    {/* Course selection area */}
                    <div className="space-y-4">
                        {courses.map((course) => (
                            <div key={course.id}>
                                <h3 className="text-[#1d2939] text-lg font-bold mb-[14px]">{course.title}</h3>
                                <div className={`border rounded-lg p-4 flex items-center justify-between transition-all ${selectedCourse === course.id ? 'border-orange-500' : 'border-gray-300'}`}>
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`w-6 h-6 flex items-center justify-center rounded border ${selectedCourse === course.id
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'bg-white border-gray-300'
                                                }`}
                                            onClick={() => setSelectedCourse(course.id)}
                                        >
                                            {selectedCourse === course.id && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[#1d2939] font-bold">Offline</p>
                                            <p className="text-gray-600 text-sm">{course.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#1d2939] font-bold">{course.price} <span className="text-gray-600 font-normal">for {course.duration}</span></p>
                                        <p>
                                            <span className="line-through text-gray-500 text-sm">{course.originalPrice}</span>
                                            <span className="text-green-600 text-sm ml-1">{course.discount}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="py-3 px-6 border border-orange-500 text-[#fb6514] text-xl font-bold rounded-lg hover:bg-orange-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            className="py-3 px-6 bg-orange-500 text-white text-xl font-bold rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            BUY NOW
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Removed example parent component as we're using this component directly in HomeFooter
export default CourseBottomSheet;