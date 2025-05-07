'use client';

import React, { useState, useEffect } from 'react';
import { validateEmail, validatePhone, validateName } from '@/utils/validation';
import CourseListFooter from '@/components/user/course-list/cource-list-footer';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseAmount: number;
  courseName: string;
  batches?: any[];
}

const PurchaseModal = ({ isOpen, onClose, courseId, courseAmount, courseName, batches = [] }: PurchaseModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showFooter, setShowFooter] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false
  });

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowFooter(false);
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle close button click
  const handleClose = () => {
    setShowFooter(true);
    // Make the CourseListFooter visible again
    const footerContainer = document.getElementById('course-list-footer-container');
    if (footerContainer) {
      footerContainer.style.display = 'block';
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const newErrors = {
      name: false,
      email: false,
      phone: false
    };

    // Validate inputs
    let isValid = true;

    if (!validateName(name)) {
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

    // Push checkout initiated event to dataLayer with user details
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'checkout_initiated',
        'course_id': courseId,
        'course_name': courseName,
        'amount': courseAmount,
        'user_name': name,
        'user_email': email,
        'user_phone': phone
      });
    }

    // Initialize Razorpay
    if (typeof window !== 'undefined') {
      const options = {
        key: "rzp_test_sotrour4Ez6eFy",
        amount: courseAmount * 100,
        currency: "INR",
        name: "Eduport",
        description: `Course Purchase: Batch ${courseId}`,
        handler: function (response: any) {
          // Show payment confirmation
          if (typeof window !== 'undefined' && window.showPaymentConfirmation) {
            window.showPaymentConfirmation(true, response.razorpay_payment_id, {
              name,
              email,
              phone,
              courseId,
              courseName,
              amount: courseAmount
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
          batch: courseId
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
      handleClose();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-300 ease-in-out"
        style={{ opacity: isOpen ? '0.5' : '0' }}
        onClick={handleClose}
      ></div>
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative transition-all duration-300 ease-in-out transform z-10"
        style={{ 
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          opacity: isOpen ? '1' : '0',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Purchase</h2>
        <p className="text-gray-600 mb-6">Please enter your details to proceed with the payment.</p>
        
        <form id="purchase-form" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Enter your full name"
            />
            {errors.name && <p id="name-error" className="text-red-500 text-sm mt-1">Please enter a valid name (letters, spaces, hyphens, and apostrophes only)</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Enter your email address"
            />
            {errors.email && <p id="email-error" className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Enter your phone number"
            />
            {errors.phone && <p id="phone-error" className="text-red-500 text-sm mt-1">Please enter a valid 10-digit phone number</p>}
          </div>
          
          <input type="hidden" name="course-id" value={courseId} />
          <input type="hidden" name="course-amount" value={courseAmount} />
          
          <button
            type="submit"
            className="w-full bg-[#FB6514] text-white font-bold py-3 rounded-xl transition duration-200 hover:bg-orange-600"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
    {showFooter && !isOpen && <CourseListFooter batches={batches} />}
    </>
  );
};

export default PurchaseModal;
