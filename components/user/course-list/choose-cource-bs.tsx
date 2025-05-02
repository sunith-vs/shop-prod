"use client"

// CourseBottomSheet.tsx
import React, { useState } from 'react';
import { validateEmail, validatePhone } from '@/utils/validation';

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

interface CourseBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    batches?: Batch[];
}

const CourseBottomSheet: React.FC<CourseBottomSheetProps> = ({ isOpen, onClose, batches = [] }) => {
    // Use the first batch ID as the default selected course or fallback to a default
    const defaultSelectedCourse = batches && batches.length > 0 ? batches[0].id : '';
    const [selectedCourse, setSelectedCourse] = useState(defaultSelectedCourse);
    const [showPurchaseForm, setShowPurchaseForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({
        name: false,
        email: false,
        phone: false
    });

    // Convert batches to the format needed for display
    const courses = batches.map(batch => ({
        id: batch.id,
        title: batch.name,
        type: batch.type === 'offline' ? 'Offline' : 'Online',
        price: batch.amount,
        priceFormatted: `₹${batch.amount.toLocaleString()}`,
        duration: '2 years',
        originalPrice: `₹${Math.round(batch.amount * 1.1).toLocaleString()}`,
        discount: '(10% OFF)',
        highlighted: batch.type !== 'offline'
    }));

    const handleBuyNow = () => {
        setShowPurchaseForm(true);
    };

    const handleSubmitPurchase = (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        const newErrors = {
            name: false,
            email: false,
            phone: false
        };

        // Validate inputs
        let isValid = true;

        if (!name) {
            newErrors.name = true;
            isValid = false;
        }

        if (!validateEmail(email)) {
            newErrors.email = true;
            isValid = false;
        }

        if (!validatePhone(phone)) {
            newErrors.phone = true;
            isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) return;

        // Get selected course
        const selectedCourseData = courses.find(course => course.id === selectedCourse);
        if (!selectedCourseData) return;

        // Push checkout initiated event to dataLayer with user details
        if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'checkout_initiated',
                'course_id': selectedCourse,
                'course_name': selectedCourseData.title,
                'amount': selectedCourseData.price,
                'user_name': name,
                'user_email': email,
                'user_phone': phone
            });
        }

        // Initialize Razorpay
        if (typeof window !== 'undefined') {
            const options = {
                key: "rzp_test_sotrour4Ez6eFy",
                amount: selectedCourseData.price * 100,
                currency: "INR",
                name: "Eduport",
                description: `Course Purchase: ${selectedCourseData.title}`,
                handler: function (response: any) {
                    // Show payment confirmation
                    if (typeof window !== 'undefined' && window.showPaymentConfirmation) {
                        window.showPaymentConfirmation(true, response.razorpay_payment_id, {
                            name,
                            email,
                            phone,
                            courseId: selectedCourse,
                            courseName: selectedCourseData.title,
                            amount: selectedCourseData.price
                        });
                    }
                },
                prefill: {
                    name,
                    email,
                    contact: phone
                },
                notes: {
                    name,
                    email,
                    contact: phone,
                    batch: selectedCourse
                },
                theme: {
                    color: "#FB6514"
                }
            };

            // @ts-ignore - Razorpay is loaded via script tag
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                if (typeof window !== 'undefined' && window.showPaymentConfirmation) {
                    window.showPaymentConfirmation(false, null);
                }
            });
            rzp.open();
            onClose();
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 ease-in-out`}>
            {/* Overlay background */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ease-in-out"
                onClick={onClose}
                style={{ opacity: isOpen ? '1' : '0' }}
            ></div>

            {/* Bottom sheet */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg transition-all duration-300 ease-in-out transform w-full"
                style={{
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    opacity: isOpen ? '1' : '0',
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
                }}
            >
                <div className="max-w-4xl mx-auto px-4 py-6 lg:w-[720px]">
                    <h2 className="text-[#1d2939] text-lg md:text-2xl font-bold mb-[14px]">{showPurchaseForm ? 'Complete Your Purchase' : 'Choose Course'}</h2>

                    {!showPurchaseForm ? (
                        <>
                            {/* Course selection area */}
                            <div className="space-y-4">
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <div key={course.id}>
                                            <h3 className="text-[#1d2939] text-sm md:text-lg font-bold mb-[14px]">{course.title}</h3>
                                            <div className={`border rounded-lg p-4 flex items-center cursor-pointer justify-between transition-all ${selectedCourse === course.id ? 'border-orange-500' : 'border-gray-300'}`} onClick={() => setSelectedCourse(course.id)}>
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`w-6 h-6 flex items-center justify-center rounded border ${selectedCourse === course.id
                                                            ? 'bg-orange-500 border-orange-500'
                                                            : 'bg-white border-gray-300'
                                                            }`}

                                                    >
                                                        {selectedCourse === course.id && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[#1d2939] text-sm md:text-xl font-bold">{course.type}</p>
                                                        <p className="text-gray-600 text-sm md:text-xl">{course.title}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[#1d2939] text-sm md:text-xl font-bold">{course.priceFormatted} <span className="text-gray-600 font-normal">for {course.duration}</span></p>
                                                    <p>
                                                        <span className="line-through text-[#1d2939] text-xs md:text-lg font-normal">{course.originalPrice}</span>
                                                        <span className="text-[#1d2939] text-[#0e9a49] text-xs md:text-lg font-bold">{course.discount}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500">No courses available</p>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <button
                                    onClick={onClose}
                                    className="py-3 px-6 border border-orange-500 text-[#fb6514] text-sm md:text-xl font-bold rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="py-3 px-6 bg-orange-500 text-white text-sm md:text-xl font-bold rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    BUY NOW
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Purchase form */}
                            <form onSubmit={handleSubmitPurchase} className="space-y-4">
                                <div>
                                    <label htmlFor="bs-name" className="block text-gray-700 font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        id="bs-name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">Please enter your name</p>}
                                </div>

                                <div>
                                    <label htmlFor="bs-email" className="block text-gray-700 font-medium mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        id="bs-email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                        placeholder="Enter your email address"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
                                </div>

                                <div>
                                    <label htmlFor="bs-phone" className="block text-gray-700 font-medium mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="bs-phone"
                                        name="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                        placeholder="Enter your phone number"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit phone number</p>}
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPurchaseForm(false)}
                                        className="py-3 px-6 border border-orange-500 text-[#fb6514] text-sm md:text-xl font-bold rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="py-3 px-6 bg-orange-500 text-white text-sm md:text-xl font-bold rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Removed example parent component as we're using this component directly in HomeFooter
export default CourseBottomSheet;