"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BenefitItem {
    icon: string;
    title: string;
    description?: string;
    color: string; // Using hex value for background color
}

// Constants file to store all benefit data
const COURSE_BENEFITS: BenefitItem[] = [
    {
        icon: '/svgs/class-hours.svg',
        title: '140+',
        description: 'Class Hours',
        color: '#E3F7FF', // Light blue background
    },
    {
        icon: '/svgs/revision.svg',
        title: '7 DAYS',
        description: 'Revision',
        color: '#ACDDC0', // Light green background
    },
    {
        icon: '/svgs/moc-test.svg',
        title: '22',
        description: 'Mock Tests',
        color: '#FFFFE8', // Light yellow background
    },
    {
        icon: '/svgs/doubt-clearence.svg',
        title: 'DOUBT CLEARANCE',
        description: 'BY NIT, IIT ALUMNI',
        color: '#FFF0E8', // Light orange background
    },
    {
        icon: '/svgs/expert-facalties.svg',
        title: 'EXPERT FACULTIES',
        description: 'From NIT, IIT ALUMNI',
        color: '#FDEDFF', // Light purple background
    },
    {
        icon: '/svgs/toppers-strategy.svg',
        title: 'TOPPERS STRATEGY',
        description: 'Exclusive study plans, motivational talks, and tips and tricks for MCQ',
        color: '#FFF2F9', // Light pink background
    },
    {
        icon: '/svgs/premium-study.svg',
        title: 'PREMIUM STUDY MATERIALS',
        description: 'Comprehensive textbooks with theory, practice, NCERT, and PYQs.',
        color: '#FFF0E8', // Light orange background
    },
    {
        icon: '/svgs/question-library.svg',
        title: 'QUESTION LIBRARY',
        description: 'All attempted questions in one place, where you can revisit, correct, and improve.',
        color: '#E3F7FF', // Light blue background
    },
    {
        icon: '/svgs/quick-notes.svg',
        title: 'QUICK NOTES',
        description: 'Digital notes where you can add reminders and explanations.',
        color: '#FFFFE8', // Light yellow background
    },
    {
        icon: '/svgs/mentorship.svg',
        title: 'MENTORSHIP',
        description: 'Each student is assigned a dedicated mentor.',
        color: '#EEFFF4', // Light green background
    }
];

// Interface for Icon data from the database
interface Icon {
    id: string;
    url: string;
    name: string;
    created_at: string;
}

// BenefitCard as a separate component
const BenefitCard: React.FC<CourseBenefit & { icons: Record<string, Icon> }> = ({
    id,
    icon_id,
    title,
    description,
    color,
    icons
}) => {
    const icon = icon_id ? icons[icon_id] : null;
    
    return (
        <div
            className="lg:min-w-[150px] lg:max-w-[420px] px-5 py-4 rounded-xl 
                shadow-sm hover:shadow-md transition-shadow duration-300 h-full border"
            style={{
                backgroundColor: `${color}25`, 
                borderColor: `${color}60`
            }}
        >
            <div className="mb-3">
                {icon ? (
                    <img src={icon.url} alt={icon.name || title} className="w-[52px] h-[52px] object-contain" />
                ) : (
                    <div className="w-[52px] h-[52px] bg-gray-100 rounded-full flex items-center justify-center text-xl">?</div>
                )}
            </div>
            <h3 className="text-[#1d2939] text-2xl md:text-[28px] font-semibold font-display leading-snug">
                {title}
            </h3>

            {description && (
                description.includes('#') ? (
                    <ul className="mt-2 space-y-1">
                        {description.split('#').map((item, index) => (
                            item.trim() && (
                                <li key={index} className="flex items-start">
                                    <span className="text-[#1d2939] mr-2 font-bold">•</span>
                                    <span className="text-[#1d2939] text-sm font-medium font-display leading-snug">
                                        {item.trim()}
                                    </span>
                                </li>
                            )
                        ))}
                    </ul>
                ) : (
                    <p className="justify-start text-[#1d2939] text-sm font-medium leading-snug">
                        {description}
                    </p>
                )
            )}
        </div>
    );
};

interface CourseBenefit {
    id: string;
    icon_id: string;
    title: string;
    description?: string;
    course_id: string;
    order: number;
    color?: string;
}

// Define props for the component
interface CourseBenefitsListProps {
    courseBenefits: CourseBenefit[];
}


// Main component with a more semantic name
const CourseBenefitsSection: React.FC<CourseBenefitsListProps> = ({ courseBenefits }) => {
    const [icons, setIcons] = useState<Record<string, Icon>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIcons = async () => {
            try {
                // Get all unique icon_ids from the benefits
                const iconIds = courseBenefits
                    .map(benefit => benefit.icon_id)
                    .filter(Boolean) as string[];
                
                if (iconIds.length === 0) {
                    setLoading(false);
                    return;
                }
                
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('icons')
                    .select('*')
                    .in('id', iconIds);
                
                if (error) {
                    console.error('Error fetching icons:', error);
                    setLoading(false);
                    return;
                }
                
                // Convert array to object with id as key for easy lookup
                const iconsMap = (data || []).reduce((acc, icon) => {
                    acc[icon.id] = icon;
                    return acc;
                }, {} as Record<string, Icon>);
                
                setIcons(iconsMap);
            } catch (error) {
                console.error('Failed to fetch icons:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchIcons();
    }, [courseBenefits]);

    console.log("courseBenefits from props", courseBenefits);
    return (
        <section className="course-benefits py-10">
            <h2 className="text-[#1d2939] text-4xl md:text-[52px] font-bold text-center mb-10">
                Course Benefits
            </h2>

            <div className="grid lg:flex flex-wrap md:grid-cols-2 gap-6 justify-center">
                {loading ? (
                    // Show loading placeholders
                    Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex-none lg:min-w-[150px] lg:max-w-[420px] px-5 py-4 rounded-xl shadow-sm h-full border animate-pulse bg-gray-100">
                            <div className="w-[52px] h-[52px] bg-gray-200 rounded-full mb-3"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))
                ) : (
                    courseBenefits.map((benefit, index) => (
                        <div key={index} className="flex-none">
                            <BenefitCard {...benefit} icons={icons} />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default CourseBenefitsSection;