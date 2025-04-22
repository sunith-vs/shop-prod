'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import PaymentConfirmation from './payment-confirmation';

interface PaymentDetails {
  name: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  amount: number;
}

interface RazorpayContextType {
  isLoaded: boolean;
  showPaymentConfirmation: (success: boolean, paymentId: string | null, details?: PaymentDetails) => void;
}

const RazorpayContext = createContext<RazorpayContextType>({
  isLoaded: false,
  showPaymentConfirmation: () => {},
});

export const useRazorpay = () => useContext(RazorpayContext);

interface RazorpayProviderProps {
  children: ReactNode;
}

export const RazorpayProvider = ({ children }: RazorpayProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | undefined>(undefined);

  useEffect(() => {
    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
      console.log('Razorpay script loaded');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Add showPaymentConfirmation to window for access from Razorpay callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showPaymentConfirmation = (success: boolean, paymentId: string | null, details?: PaymentDetails) => {
        setPaymentSuccess(success);
        setPaymentId(paymentId);
        setPaymentDetails(details);
        setShowConfirmation(true);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.showPaymentConfirmation = undefined as any;
      }
    };
  }, []);

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <RazorpayContext.Provider
      value={{
        isLoaded,
        showPaymentConfirmation: (success, paymentId, details) => {
          setPaymentSuccess(success);
          setPaymentId(paymentId);
          setPaymentDetails(details);
          setShowConfirmation(true);
        },
      }}
    >
      {children}
      <PaymentConfirmation
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        success={paymentSuccess}
        paymentId={paymentId || undefined}
        details={paymentDetails}
      />
    </RazorpayContext.Provider>
  );
};

// Declare global window interface
declare global {
  interface Window {
    Razorpay: any;
    showPaymentConfirmation: (success: boolean, paymentId: string | null, details?: PaymentDetails) => void;
    dataLayer: any[];
  }
}
