import React from 'react';

const BorderText = () => {
    return (
        <div className="w-full py-[40px] overflow-hidden">
            <h1
                className="text-7xl md:text-9xl font-light text-transparent text-center"
                style={{
                    WebkitTextStroke: '1px #7D7D7D',
                    color: 'transparent'
                }}
            >
                Hear Their Stories
            </h1>
        </div>
    );
};

export default BorderText;