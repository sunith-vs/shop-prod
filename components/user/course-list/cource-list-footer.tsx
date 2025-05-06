"use client"

import React from 'react'
import CourseBottomSheet from './choose-cource-bs'
import EnquiryBottomSheet from './enquiry-bs'
import TallyFormModal from './tally-form-modal'
import { usePurchaseStore } from '@/lib/store/purchase-store'

// Define the interface for the form data to match what EnquiryBottomSheet expects
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

interface EnquiryFormData {
    name: string;
    district: string;
    courseType: 'offline' | 'online';
    phoneNumber: string;
}

interface CourseListFooterProps {
    batches?: Batch[];
    courseSlug?: string;
}

const CourseListFooter = ({ batches = [], courseSlug = '' }: CourseListFooterProps) => {
    // Use the Zustand store for bottom sheet state
    const { isBottomSheetOpen, openBottomSheet, closeBottomSheet } = usePurchaseStore();
    
    const [isEnquiryOpen, setIsEnquiryOpen] = React.useState(false);
    const [isTallyFormOpen, setIsTallyFormOpen] = React.useState(false);

    const openEnquiry = () => setIsEnquiryOpen(true);
    const closeEnquiry = () => setIsEnquiryOpen(false);
    
    // Function to open Tally form modal
    const openTallyForm = () => setIsTallyFormOpen(true);
    const closeTallyForm = () => setIsTallyFormOpen(false);

    // Handle the enquiry form submission
    const handleEnquirySubmit = (formData: EnquiryFormData) => {
        console.log('Enquiry form submitted:', formData);
        // Add your form submission logic here (e.g., API call)

        // Close the bottom sheet after submission
        closeEnquiry();
    };

    return (
        <>
            <div className="fixed bottom-0 left-0 w-full bg-[#FFFAF5] border-t border-gray-200 pb-[32px] pt-[8px] px-4 z-50 ">
                <div className="text-center justify-center text-[#454b56] text-base font-medium]">
                    <span>🎓</span>
                    <span>1,423 Learners already enrolled</span>
                </div>

                <div className="flex space-x-4 mt-[12px] lg:w-[720px] mx-auto">
                    <button
                        className="w-full p-3 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[#fb6514]  justify-center gap-2.5 text-[#fb6514] font-bold"
                        onClick={openTallyForm}
                    >
                        Enquire Now
                    </button>
                    <button
                        className=" w-full p-3 bg-[#fb6514] rounded-[10px] justify-center gap-2.5 text-white font-bold"
                        onClick={openBottomSheet}
                    >
                        BUY NOW
                    </button>
                </div>
            </div>

            <EnquiryBottomSheet
                isOpen={isEnquiryOpen}
                onClose={closeEnquiry}
                onSubmit={handleEnquirySubmit}
            />

            <CourseBottomSheet
                isOpen={isBottomSheetOpen}
                onClose={closeBottomSheet}
                batches={batches}
            />
            
            <TallyFormModal
                isOpen={isTallyFormOpen}
                onClose={closeTallyForm}
                courseSlug={courseSlug}
            />
        </>
    )
}

export default CourseListFooter