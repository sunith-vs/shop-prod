'use client';

import React from 'react';
import Image from 'next/image';

interface PaymentDetails {
  name: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  amount: number;
}

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  paymentId?: string;
  details?: PaymentDetails;
}

const PaymentConfirmation = ({ isOpen, onClose, success, paymentId, details }: PaymentConfirmationProps) => {
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-300 ease-in-out"
        style={{ opacity: isOpen ? '0.5' : '0' }}
        onClick={onClose}
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
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center">
          {success ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">Your course purchase has been completed successfully.</p>
              
              {details && (
                <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Purchase Details:</h3>
                  <p className="text-gray-700"><span className="font-medium">Course:</span> {details.courseName}</p>
                  <p className="text-gray-700"><span className="font-medium">Amount:</span> ₹{details.amount.toLocaleString()}</p>
                  <p className="text-gray-700"><span className="font-medium">Payment ID:</span> {paymentId}</p>
                  <p className="text-gray-700"><span className="font-medium">Name:</span> {details.name}</p>
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {details.email}</p>
                </div>
              )}
              
              <p className="text-gray-600 mb-6">A confirmation email has been sent to your email address.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">We couldn&#39;t process your payment. Please try again or contact support.</p>
            </>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-[#FB6514] text-white font-bold py-3 rounded-xl transition duration-200 hover:bg-orange-600"
          >
            {success ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
