import React from 'react';

const BorderText = () => {
    return (
        <div className="w-full py-[40px]">
            <div className="max-w-[1280px] mx-auto px-[14px]">
                <h1
                    className="font-light text-center"
                    style={{
                        WebkitTextStroke: '1px #7D7D7D',
                        color: 'transparent',
                        fontSize: 'min(8vw, 7rem)',
                        lineHeight: '1.2',
                        letterSpacing: '0.01em',
                    }}
                >
                    Hear Their Stories
                </h1>
            </div>
        </div>
    );
};

export default BorderText;