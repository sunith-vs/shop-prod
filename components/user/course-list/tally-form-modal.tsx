"use client"

import React, { useEffect, useState } from 'react';

interface TallyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseSlug: string;
}

const TallyFormModal: React.FC<TallyFormModalProps> = ({ isOpen, onClose, courseSlug }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get URL parameters for UTM tracking
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const utmSource = urlParams.get('utm_source') || '';
  const utmMedium = urlParams.get('utm_medium') || '';
  const utmCampaign = urlParams.get('utm_campaign') || '';

  // Construct the Tally form URL with parameters
  const tallyUrl = `https://tally.so/embed/w2VrQM?hideTitle=1&transparentBackground=1&course_name=${encodeURIComponent(courseSlug)}&utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        // Close modal when clicking on the backdrop (outside the modal content)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-lg w-full max-w-md md:max-w-xl h-[80vh] md:h-[90vh] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Heading and description */}
        <div className="px-6 pt-8 pb-4">
          <h2 className="text-3xl font-bold text-[#333] border-b border-dotted border-blue-300 pb-2 inline-block">
            Enquire Now
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Fill out the form below to secure your slot and stand a chance to win exclusive offers.
          </p>
        </div>
        
        {/* Loading spinner */}
        {!iframeLoaded && (
          <div className="flex-grow flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fb6514]"></div>
          </div>
        )}
        
        {/* Tally form iframe */}
        <div className={`flex-grow ${!iframeLoaded ? 'hidden' : ''}`}>
          <iframe
            src={tallyUrl}
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full border-0"
            frameBorder="0"
            title="Enquiry Form"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TallyFormModal;
