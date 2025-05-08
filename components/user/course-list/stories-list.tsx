import Image from 'next/image';

const students = [
    {
        id: 1,
        name: 'MUHAMMED SAMI',
        imageUrl: '/students/mhd.sami.svg',
        dpUrl: '/dp/sami_dp.svg',
        color: '#FFA76D', // Orange color for profile picture background
        examType: 'JEE',
        examYear: '2023',
        percentile: '99.6',
        description: 'The main reason I scored well is because of the teaching faculty here, all of them are highly qualified. Their guidance and regular test series helped me improve my concepts, managing my time, and made me exam ready.'
    },
    {
        id: 2,
        name: 'ABHIJIT HM',
        imageUrl: '/students/abhijit.svg',
        dpUrl: '/dp/abhijit_dp.svg',
        color: '#1FD546', // Green color for profile picture background
        examType: 'JEE',
        examYear: '2023',
        percentile: '99.4',
        description: 'At my school exams, I was confused about JEE. After Eduport gave me clear idea and helped me focus and boosted my confidence. They guided me to success in exams.'
    },
    {
        id: 3,
        name: 'RIDHIN ZEMEER',
        imageUrl: '/students/ridhin.svg',
        dpUrl: '/dp/ridhin_dp.svg',
        color: '#6DD8FF', // Blue color for profile picture background
        examType: 'JEE',
        examYear: '2023',
        percentile: '99.3',
        description: 'Kohinoor Sir and Nasrul Sir helped me solve questions faster and approach them in the right way. The online exams I received help and excellent live classes helped me to succeed.'
    },
    {
        id: 4,
        name: 'AJMAL SADIQ J',
        imageUrl: '/students/ajmal.svg',
        dpUrl: '/dp/ajmal_dp.svg',
        color: '#1FD546', // Orange color for profile picture background
        examType: 'JEE',
        examYear: '2023',
        percentile: '98.61',
        description: 'I came here in class 12 with Eduport. The classes and teachers are amazing, and the mentors are always supportive. The test series helped improve my score, making it a better exam for me.'
    },
    // {
    //     id: 7,
    //     name: 'LIHAN MAQBOOL',
    //     imageUrl: '/students/maqbool.svg',
    //     dpUrl: '/dp/maqbool_dp.svg',
    //     color: '#FFA76D', // Orange color for profile picture background
    //     examType: 'JEE',
    //     examYear: '2023',
    //     percentile: '98.6',
    //     description: 'Content Missing'
    // },
    {
        id: 9,
        name: 'FATHIMATHUL HASEEBA',
        imageUrl: '/students/haseeba.svg',
        dpUrl: '/dp/haseeba_dp.svg',
        color: '#6DD8FF', // Blue color for profile picture background
        examType: 'JEE',
        examYear: '2023',
        percentile: '98.6',
        description: 'The campus is close, so I don\'t waste time traveling. The teachers are always ready to help, no matter how small the doubt. The peaceful environment helps me focus, which helps students excel.'
    },
    {
        id: 6,
        name: 'NAJUMAL SHAH PB',
        imageUrl: '/students/shah.svg',
        dpUrl: '/dp/shah_dp.svg',
        color: '#6DD8FF', // Blue color for profile picture background
        examType: 'JEE',
        examYear: '2023',
        percentile: '98.3',
        description: 'Eduport has the best faculty, test series, and helpful facilities. I\'ve made great improvements since joining, and I\'m grateful that I can achieve my dream of becoming a doctor.'
    },
    // {
    //     id: 5,
    //     name: 'MUHAMMED ADAAN T',
    //     imageUrl: '/students/adaan.svg',
    //     dpUrl: '/dp/adaan_dp.svg',
    //     color: '#FFD66D', // Yellow color for profile picture background
    //     examType: 'JEE',
    //     examYear: '2023',
    //     percentile: '98.2',
    //     description: 'Content Missing'
    // },
    // {
    //     id: 8,
    //     name: 'ANSIL LAKKAL',
    //     imageUrl: '/students/ansillakkal.svg',
    //     dpUrl: '/dp/ansillakkal_dp.svg',
    //     color: '#1FD546', // Green color for profile picture background
    //     examType: 'JEE',
    //     examYear: '2023',
    //     percentile: '98.08',
    //     description: 'Content Missing'
    // },
    {
        id: 10,
        name: 'BHARGAV S SHENOY',
        imageUrl: '/students/bhargav.svg',
        dpUrl: '/dp/bhargav_dp.svg',
        color: '#FFD66D', // Blue color for profile picture background
        examType: 'JEE',
        examYear: '2023',
        percentile: '98',
        description: 'I discovered Eduport in 10th grade and joined their integrated PCMB program. The step-by-step guidance helped me crack NEET with good score. The teachers made it all possible.'
    }
];

const StudentProfileCards = () => {
    return (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {students.map((student) => (
                <div key={student.id} className="bg-white rounded-2xl overflow-hidden border flex flex-col h-full">
                    {/* Student Info Header */}
                    <div className="flex items-center p-[14px]">
                        <div className="w-10 h-10 mr-3 rounded-full overflow-hidden pt-[4px]" style={{ backgroundColor: student.color }}>
                            <Image
                                src={student.dpUrl}
                                alt={student.name}
                                width={40}
                                height={40}
                            />
                        </div>
                        <h3 className="text-[#1d2939] text-sm font-semibold">{student.name}</h3>
                    </div>

                    {/* Description */}
                    <div className="justify-start text-[#475467] text-sm font-normal leading-normal px-[14px] pb-[12px]">
                        {student.description}
                    </div>

                    {/* Student photo - with flex-grow to push footer to bottom */}
                    <div className="flex justify-center items-center px-[14px] bg-white flex-grow">
                        <div className="relative mt-auto">
                            <div className=" overflow-hidden">
                                <Image
                                    src={student.imageUrl}
                                    alt={student.name}
                                    width={334}
                                    height={222}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Name Footer - will always be at bottom due to flex layout */}
                    <div className="bg-[#FF7B34] text-white text-center py-2 mt-auto">
                        <h2 className="text-lg font-bold">{student.name}</h2>
                    </div>
                </div>
            ))}
        </div>

    );
};

export default StudentProfileCards;