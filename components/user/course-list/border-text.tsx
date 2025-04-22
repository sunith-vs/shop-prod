import React from 'react';
import Image from 'next/image';

const BorderText = () => {
    return (
        <div className="w-full py-[40px]">

            <Image
                src="/images/hear_their_stories.svg"
                alt="Hear Their Stories"
                width={0}
                height={0}
                className="w-full mx-auto"
                priority
            />

        </div>
    );
};

export default BorderText;