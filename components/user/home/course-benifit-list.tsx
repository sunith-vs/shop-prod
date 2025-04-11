import React from 'react';

interface BenefitItem {
    icon: string;
    title: string;
    subtitle?: string;
    description?: string;
    backgroundColor: string; // Using hex value for background color
    borderColor: string; // Using hex value for border color
    bulletPoints?: string[];
}

// Constants file to store all benefit data
const COURSE_BENEFITS: BenefitItem[] = [
    {
        icon: '/svgs/class-hours.svg',
        title: '140+',
        subtitle: 'Class Hours',
        backgroundColor: '#E3F7FF', // Light blue background
        borderColor: '#BEDDFF'      // Light blue border
    },
    {
        icon: '/svgs/revision.svg',
        title: '7 DAYS',
        subtitle: 'Revision',
        backgroundColor: '#EEFFF4', // Light green background
        borderColor: '#ACDDC0'      // Light green border
    },
    {
        icon: '/svgs/moc-test.svg',
        title: '22',
        subtitle: 'Mock Tests',
        backgroundColor: '#FFFFE8', // Light yellow background
        borderColor: '#FFD5BF'      // Light yellow border
    },
    {
        icon: '/svgs/doubt-clearence.svg',
        title: 'DOUBT CLEARANCE',
        subtitle: 'BY NIT, IIT ALUMNI',
        backgroundColor: '#FFF0E8', // Light orange background
        borderColor: '#FFD5BF'      // Light orange border
    },
    {
        icon: '/svgs/expert-facalties.svg',
        title: 'EXPERT FACULTIES',
        subtitle: 'From NIT, IIT ALUMNI',
        backgroundColor: '#FDEDFF', // Light purple background
        borderColor: '#E9BEFD'      // Light purple border
    },
    {
        icon: '/svgs/toppers-strategy.svg',
        title: 'TOPPERS STRATEGY',
        backgroundColor: '#FFF2F9', // Light pink background
        borderColor: '#FFD0E9',     // Light pink border
        bulletPoints: [
            'Exclusive study plans',
            'Motivational talks',
            'Tips and tricks for MCQ'
        ]
    },
    {
        icon: '/svgs/premium-study.svg',
        title: 'PREMIUM STUDY MATERIALS',
        description: 'Comprehensive textbooks with theory, practice, NCERT, and PYQs.',
        backgroundColor: '#FFF0E8', // Light orange background
        borderColor: '#FFD5BF'      // Light orange border
    },
    {
        icon: '/svgs/question-library.svg',
        title: 'QUESTION LIBRARY',
        description: 'All attempted questions in one place, where you can revisit, correct, and improve.',
        backgroundColor: '#E3F7FF', // Light blue background
        borderColor: '#BEDDFF'      // Light blue border
    },
    {
        icon: '/svgs/quick-notes.svg',
        title: 'QUICK NOTES',
        description: 'Digital notes where you can add reminders and explanations.',
        backgroundColor: '#FFFFE8', // Light yellow background
        borderColor: '#FFD5BF'      // Light yellow border
    },
    {
        icon: '/svgs/mentorship.svg',
        title: 'MENTORSHIP',
        description: 'Each student is assigned a dedicated mentor.',
        backgroundColor: '#EEFFF4', // Light green background
        borderColor: '#ACDDC0'      // Light green border
    }
];

// BulletPoints component for better separation of concerns
const BulletPoints: React.FC<{ points: string[] }> = ({ points }) => {
    if (points.length === 0) return null;

    return (
        <ul className="mt-2">
            {points.map((point, index) => (
                <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-[#1d2939] text-sm font-medium font-display leading-snug">
                        {point}
                    </span>
                </li>
            ))}
        </ul>
    );
};

// BenefitCard as a separate component
const BenefitCard: React.FC<BenefitItem> = ({
    icon,
    title,
    subtitle,
    description,
    backgroundColor,
    borderColor,
    bulletPoints = []
}) => {
    return (
        <div
            className="lg:min-w-[150px] lg:max-w-[420px] px-5 py-4 rounded-xl 
                shadow-sm hover:shadow-md transition-shadow duration-300 h-full border"
            style={{
                backgroundColor,
                borderColor
            }}
        >
            <div className="text-3xl mb-2">
                <img src={icon} alt={title} />
            </div>
            <h3 className="text-[#1d2939] text-2xl md:text-[28px] font-semibold font-display leading-snug">
                {title}
            </h3>

            {subtitle && (
                <p className="text-[#1d2939] text-sm font-medium font-display leading-snug">
                    {subtitle}
                </p>
            )}

            {description && (
                <p className="text-sm text-gray-700 font-display text-wrap">
                    {description}
                </p>
            )}

            <BulletPoints points={bulletPoints || []} />
        </div>
    );
};

// Main component with a more semantic name
const CourseBenefitsSection: React.FC = () => {
    return (
        <section className="course-benefits py-10">
            <h2 className="text-[#1d2939] text-4xl md:text-[52px] font-bold text-center mb-10">
                Course Benefits
            </h2>

            <div className="grid lg:flex flex-wrap md:grid-cols-2 gap-6 justify-center">
                {COURSE_BENEFITS.map((benefit, index) => (
                    <div key={index} className="flex-none">
                        <BenefitCard {...benefit} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CourseBenefitsSection;