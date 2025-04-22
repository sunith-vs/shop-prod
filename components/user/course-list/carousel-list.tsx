'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import RouteListNav from './route-list-nav';
import { createClient } from '@/lib/supabase/client';

// Define the carousel item type
interface CarouselItem {
    id: string;
    url: string;
    index: number;
    course_id: string;
    created_at: string;
}

function CarouselList({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
    const supabase = createClient();
    const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [activeSlide, setActiveSlide] = useState(0);
    const totalSlides = carouselItems.length;

    // Fetch carousel items from the database
    useEffect(() => {
        const fetchCarouselItems = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('carousel')
                    .select('*')
                    .eq('course_id', courseId)
                    .order('index', { ascending: true });
                
                if (error) {
                    throw error;
                }
                
                if (data && data.length > 0) {
                    setCarouselItems(data);
                } else {
                    // Fallback to default images if no carousel items found
                    const defaultImages = [
                        'https://images.unsplash.com/photo-1516214104703-d870798883c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
                        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
                        'https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
                        'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
                        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
                    ];
                    
                    // Create mock carousel items with default images
                    const mockItems: CarouselItem[] = defaultImages.map((url, index) => ({
                        id: `default-${index}`,
                        url,
                        index,
                        course_id: courseId,
                        created_at: new Date().toISOString()
                    }));
                    
                    setCarouselItems(mockItems);
                }
            } catch (err) {
                console.error('Error fetching carousel items:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch carousel items');
                
                // Set default images on error
                const defaultImages = [
                    'https://images.unsplash.com/photo-1516214104703-d870798883c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
                    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
                ];
                
                const mockItems: CarouselItem[] = defaultImages.map((url, index) => ({
                    id: `default-${index}`,
                    url,
                    index,
                    course_id: courseId,
                    created_at: new Date().toISOString()
                }));
                
                setCarouselItems(mockItems);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCarouselItems();
    }, [courseId, supabase]);
    
    // Auto-slide functionality
    useEffect(() => {
        if (totalSlides === 0) return;
        
        const interval = setInterval(() => {
            setActiveSlide((prevSlide) => (prevSlide + 1) % totalSlides);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [totalSlides]);

    // Functions to control the carousel
    const goToSlide = (slideIndex: number) => {
        setActiveSlide(slideIndex);
    };

    const goToPrevSlide = () => {
        setActiveSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
    };

    const goToNextSlide = () => {
        setActiveSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    };

    // Helper function to check if a URL is external
    const isExternalUrl = (url: String) => {
        return url.startsWith('http://') || url.startsWith('https://');
    };

    return (
        <div className="w-full max-w-4xl mb-[12px] lg:mb-0">
            <RouteListNav courseTitle={courseTitle} />
            <div className="text-[#667085] text-[26px] md:text-[52px] font-bold my-[20px]">{courseTitle}</div>
            <div className="relative w-full">
                <div className="relative h-[280px] overflow-hidden rounded-lg md:h-[450px] bg-black">
                    {/* Carousel slides */}
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500">
                            Failed to load carousel images
                        </div>
                    ) : carouselItems.map((item, index) => (
                        <div
                            key={index}
                            className={`absolute w-full h-full transition-opacity duration-700 ease-in-out ${activeSlide === index ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            {/* Modified this section to make images fill the entire container */}
                            <div className="absolute inset-0">
                                {isExternalUrl(item.url) ? (
                                    // For external network images
                                    <Image
                                        src={item.url}
                                        alt={`Carousel image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 900px"
                                        priority={index === 0}
                                        style={{ objectFit: 'cover' }}
                                        unoptimized={process.env.NODE_ENV === 'development'} // Optional: For faster development builds
                                    />
                                ) : (
                                    // For local images
                                    <Image
                                        src={item.url}
                                        alt={`Carousel image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 900px"
                                        priority={index === 0}
                                        style={{ objectFit: 'cover' }}
                                    />
                                )}

                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-8 h-8">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Slide indicators - styled to match the image with orange active indicator */}
                <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`${activeSlide == index ? 'w-[12px] md:w-[29px]' : 'w-2 md:w-3'} h-2 md:h-3 rounded-full ${activeSlide === index ? 'bg-[#FF6B35]' : 'bg-gray-300'
                                }`}
                            aria-current={activeSlide === index}
                            aria-label={`Slide ${index + 1}`}
                            onClick={() => goToSlide(index)}
                        ></button>
                    ))}
                </div>

                {/* Previous button */}
                <button
                    type="button"
                    className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                    onClick={goToPrevSlide}
                >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/20 group-hover:bg-black/30 group-focus:ring-2 group-focus:ring-white group-focus:outline-none">
                        <svg
                            className="w-4 h-4 text-white rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 6 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 1 1 5l4 4"
                            />
                        </svg>
                        <span className="sr-only">Previous</span>
                    </span>
                </button>

                {/* Next button */}
                <button
                    type="button"
                    className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                    onClick={goToNextSlide}
                >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/20 group-hover:bg-black/30 group-focus:ring-2 group-focus:ring-white group-focus:outline-none">
                        <svg
                            className="w-4 h-4 text-white rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 6 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 9 4-4-4-4"
                            />
                        </svg>
                        <span className="sr-only">Next</span>
                    </span>
                </button>
            </div>
        </div>
    );
}

export default CarouselList;