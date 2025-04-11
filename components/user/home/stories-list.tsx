import Image from 'next/image';

const students = [
    {
        id: 1,
        name: 'M. IKRAM',
        imageUrl: '/images/student.png',
        dpUrl: '/images/student-dp.png',
        description: 'He is a student who is currently pursuing his B.Tech in Computer Science from IIT Kharagpur.'
    },
    {
        id: 2,
        name: 'MOHMED RAMSHAD',
        imageUrl: '/images/student.png',
        dpUrl: '/images/student-dp.png',
        description: 'He is a student who is currently pursuing his B.Tech in Computer Science from IIT Kharagpur.'
    },
    {
        id: 3,
        name: 'MEENAKSHI SREEJITH',
        imageUrl: '/images/student.png',
        dpUrl: '/images/student-dp.png',
        description: 'He is a student who is currently pursuing his B.Tech in Computer Science from IIT Kharagpur.'
    },
    {
        id: 4,
        name: 'CHAITHAN K',
        imageUrl: '/images/student.png',
        dpUrl: '/images/student-dp.png',
        description: 'He is a student who is currently pursuing his B.Tech in Computer Science from IIT Kharagpur.'
    }
];

const StudentProfileCards = () => {
    return (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-[60px]">
            {students.map((student) => (
                <div key={student.id} className="bg-white rounded-2xl overflow-hidden border">
                    {/* Student Info Header */}

                    <div className="flex items-center p-[14px]">
                        <div className="w-10 h-10 mr-3 rounded-full overflow-hidden">
                            <Image
                                src={student.dpUrl}
                                alt={student.name}
                                width={40}
                                height={40}
                            />
                        </div>
                        <h3 className="text-[#1d2939] text-sm font-semibold ">{student.name}</h3>
                    </div>


                    <div className=" justify-start text-[#475467] text-sm font-normal leading-normal px-[14px] pb-[14px]">
                        {student.description}
                    </div>


                    <div className="flex justify-center items-center px-[14px] bg-white">
                        {/* Student photo */}
                        <div className="relative">
                            <div className="w-32 h-32 overflow-hidden">
                                <Image
                                    src={student.imageUrl}
                                    alt={student.name}
                                    width={222}
                                    height={222}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Name Footer */}
                    <div className="bg-[#FF7B34] text-white text-center py-2">
                        <h2 className="text-lg font-bold">{student.name}</h2>
                    </div>
                </div>
            ))}
        </div>

    );
};

export default StudentProfileCards;