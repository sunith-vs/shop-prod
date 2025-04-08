import React from 'react';

// Define TypeScript interfaces for our components
interface BenefitCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    description?: string;
    color: string;
    bulletPoints?: string[];
}

const BenefitCard = ({ icon, title, subtitle, description, color, bulletPoints = [] }: BenefitCardProps) => (
    <div className={`min-w-[200px] max-w-[320px] px-[20px] py-[14px] rounded-xl ${color} shadow-sm hover:shadow-md transition-shadow duration-300 h-full`}>
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="text-[#1d2939] text-[28px] font-semibold font-['Mona_Sans'] leading-snug">{title}</h3>
        {subtitle && <p className="text-[#1d2939] text-sm font-medium font-['Mona_Sans'] leading-snug">{subtitle}</p>}
        {description && <p className="text-sm text-gray-700">{description}</p>}
        {bulletPoints.length > 0 && (
            <ul className="mt-2">
                {bulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

interface BenefitItem {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    description?: string;
    color: string;
    bulletPoints?: string[];
}

const CourseBenefitsList = () => {
    const benefits: BenefitItem[] = [
        {
            icon: "👨‍🏫",
            title: "140+",
            subtitle: "Class Hours",
            color: "bg-blue-50"
        },
        {
            icon: "📝",
            title: "7 DAYS",
            subtitle: "Revision",
            color: "bg-green-50"
        },
        {
            icon: "📊",
            title: "22",
            subtitle: "Mock Tests",
            color: "bg-yellow-50"
        },
        {
            icon: "❓",
            title: "DOUBT CLEARANCE",
            subtitle: "BY NIT, IIT ALUMNI",
            color: "bg-orange-50"
        },
        {
            icon: "👨‍🏫",
            title: "EXPERT FACULTIES",
            subtitle: "From NIT, IIT ALUMNI",
            color: "bg-purple-50"
        },
        {
            icon: "🏆",
            title: "TOPPERS STRATEGY",
            color: "bg-pink-50",
            bulletPoints: [
                "Exclusive study plans",
                "Motivational talks",
                "Tips and tricks for MCQ"
            ]
        },
        {
            icon: "📚",
            title: "PREMIUM STUDY MATERIALS",
            description: "Comprehensive textbooks with theory, practice, NCERT, and PYQs.",
            color: "bg-orange-50"
        },
        {
            icon: "❓",
            title: "QUESTION LIBRARY",
            description: "All attempted questions in one place, where you can revisit, correct, and improve.",
            color: "bg-blue-50"
        },
        {
            icon: "📝",
            title: "QUICK NOTES",
            description: "Digital notes where you can add reminders and explanations.",
            color: "bg-yellow-50"
        },
        {
            icon: "👨‍🏫",
            title: "MENTORSHIP",
            description: "Each student is assigned a dedicated mentor.",
            color: "bg-green-50"
        }
    ];


    return (
        <div>
            <div className="text-[#1d2939] text-[52px] font-bold font-['Inter'] text-center mt-[60px] mb-[40px]">Course Benefits</div>

            {/* Top row benefits - inline with flexbox and wrap */}
            <div className="flex flex-wrap gap-[24px] justify-center">
                {benefits.map((benefit: BenefitItem, index: number) => (
                    <div key={index} className="flex-none">
                        <BenefitCard {...benefit} />
                    </div>
                ))}
            </div>

        </div>
    );
};

export default CourseBenefitsList;