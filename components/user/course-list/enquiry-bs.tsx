"use client"
// EnquiryBottomSheet.tsx
import React, { useState } from 'react';

interface EnquiryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: EnquiryFormData) => void;
}

interface EnquiryFormData {
  name: string;
  district: string;
  courseType: 'offline' | 'online';
  phoneNumber: string;
}

const EnquiryBottomSheet: React.FC<EnquiryBottomSheetProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    district: '',
    courseType: 'offline',
    phoneNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCourseTypeChange = (type: 'offline' | 'online') => {
    setFormData(prev => ({ ...prev, courseType: type }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Overlay background */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg transition-transform duration-300 ease-in-out transform pb-6">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:w-[720px]">
          {/* Close button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className=" text-[#1d2939] text-lg md:text-2xl font-bold">Enquire Now</h2>
          <p className="text-[#667085] text-xs md:text-sm font-medium leading-none my-[14px]">Fill out the form below to secure your slot and stand a chance to win exclusive offers.</p>

          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="mb-4">
              <label htmlFor="name" className="text-[#fb6514] text-xs md:text-sm font-medium">Name</label>
              <div className="mt-[4px]">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 "
                  required
                />
              </div>
            </div>

            {/* District Dropdown */}
            <div className="mb-4">
              <label htmlFor="district" className="text-[#475467] text-xs md:text-sm font-medium">District</label>
              <div className="relative shadow-sm rounded-lg mt-[4px]">
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                  required
                >
                  <option value="" disabled>Select your district</option>
                  <option value="thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="kollam">Kollam</option>
                  <option value="pathanamthitta">Pathanamthitta</option>
                  <option value="alappuzha">Alappuzha</option>
                  <option value="kottayam">Kottayam</option>
                  <option value="idukki">Idukki</option>
                  <option value="ernakulam">Ernakulam</option>
                  <option value="thrissur">Thrissur</option>
                  <option value="palakkad">Palakkad</option>
                  <option value="malappuram">Malappuram</option>
                  <option value="kozhikode">Kozhikode</option>
                  <option value="wayanad">Wayanad</option>
                  <option value="kannur">Kannur</option>
                  <option value="kasaragod">Kasaragod</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Course Type Options */}
            <div className="my-7">
              <div className="flex space-x-6">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleCourseTypeChange('offline')}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.courseType === 'offline'
                    ? 'border-orange-500'
                    : 'border-gray-400'
                    }`}>
                    {formData.courseType === 'offline' && (
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-[#475467] text-base font-bold">NEET</p>
                    <p className="text-[#475467] text-base font-bold">Crash Offline</p>
                  </div>
                </div>

                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleCourseTypeChange('online')}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.courseType === 'online'
                    ? 'border-orange-500'
                    : 'border-gray-400'
                    }`}>
                    {formData.courseType === 'online' && (
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-[#475467] text-base font-bold">NEET</p>
                    <p className="text-[#475467] text-base font-bold">CRASH Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="mb-8">
              <label htmlFor="phone" className="block text-[#475467] text-xs md:text-sm font-medium mb-2">Phone Number</label>
              <div className="flex w-full shadow-sm rounded-lg overflow-hidden">
                <div className="relative">
                  <div className="flex items-center border border-gray-300 border-r-0 rounded-l-lg px-3 py-3 bg-white">
                    <div className="flex items-center">
                      <div className="w-8 h-6 overflow-hidden mr-2 rounded-sm">
                        <img
                          src="/images/india-flag.svg"
                          alt="India flag"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              // Create a fallback flag using CSS
                              const fallbackFlag = document.createElement('div');
                              fallbackFlag.className = 'w-full h-full relative';
                              fallbackFlag.innerHTML = `
                                <div class="absolute top-0 w-full h-1/3 bg-orange-500"></div>
                                <div class="absolute top-1/3 w-full h-1/3 bg-white"></div>
                                <div class="absolute top-2/3 w-full h-1/3 bg-green-600"></div>
                              `;
                              parent.appendChild(fallbackFlag);
                            }
                          }}
                        />
                      </div>
                      <span className="text-gray-700 font-medium">+91</span>
                      <svg className="w-4 h-4 ml-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phoneNumber"
                  placeholder="8023456789"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                  required
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={onClose}
                className="py-3 border border-[#FB6514] text-[#fb6514] text-base md:text-xl font-bold rounded-lg hover:bg-orange-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 bg-[#FB6514] text-white text-base md:text-xl font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Example usage with a parent component
const ParentComponent: React.FC = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const openBottomSheet = () => setIsBottomSheetOpen(true);
  const closeBottomSheet = () => setIsBottomSheetOpen(false);

  const handleSubmit = (formData: EnquiryFormData) => {
    console.log('Form submitted with data:', formData);
    // Handle form submission, e.g., API call
    closeBottomSheet();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-xl font-medium mb-4">Course Enquiry</h1>

      <button
        onClick={openBottomSheet}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg"
      >
        Enquire Now
      </button>

      <EnquiryBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={closeBottomSheet}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EnquiryBottomSheet;