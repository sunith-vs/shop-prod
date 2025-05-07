"use client"

import React, { useEffect } from 'react';

interface TallyFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  courseSlug: string;
}

const TallyFormPopup: React.FC<TallyFormPopupProps> = ({ isOpen, onClose, courseSlug }) => {
  useEffect(() => {
    // Load Tally script only once when component mounts
    const existingScript = document.getElementById('tally-js');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'tally-js';
      script.src = 'https://tally.so/widgets/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Open or close the popup based on isOpen state
    if (isOpen && typeof window !== 'undefined' && window.Tally) {
      // Get URL parameters for UTM tracking
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || '';
      const utmMedium = urlParams.get('utm_medium') || '';
      const utmCampaign = urlParams.get('utm_campaign') || '';

      // Open the Tally popup with prefilled data
      window.Tally.openPopup('w2VrQM', {
        width: 540,
        autoClose: 5000,
        hiddenFields: {
          course_name: courseSlug,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign
        },
        onClose: onClose
      });
    }
  }, [isOpen, courseSlug, onClose]);

  // This component doesn't render anything visible
  // The Tally popup is controlled via their JS API
  return null;
};

// Add TypeScript declaration for Tally
declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options: any) => void;
    };
  }
}

export default TallyFormPopup;
