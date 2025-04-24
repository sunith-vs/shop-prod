'use client';

import React, { useState, useEffect, useRef } from 'react';
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

    // Track if a video is currently playing
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // References to YouTube iframes
    const youtubeRefs = useRef<{ [key: number]: HTMLIFrameElement | null }>({});

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
                }
            } catch (err) {
                console.error('Error fetching carousel items:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch carousel items');
            } finally {
                setLoading(false);
            }
        };

        fetchCarouselItems();
    }, [courseId, supabase]);

    // Auto-slide functionality - don't auto-slide if there are videos in the carousel
    useEffect(() => {
        // Check if any item is a YouTube video
        const hasYoutubeVideo = carouselItems.some(item => isYoutubeUrl(item.url));

        // Don't set up auto-slide if there's a YouTube video in the carousel
        if (totalSlides <= 1 || hasYoutubeVideo) return;

        const interval = setInterval(() => {
            setActiveSlide((prevSlide) => (prevSlide + 1) % totalSlides);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [totalSlides, carouselItems]);

    // Pause any playing videos when changing slides
    useEffect(() => {
        // Pause all videos except the active one
        Object.keys(youtubeRefs.current).forEach((indexStr) => {
            const index = parseInt(indexStr);
            const iframe = youtubeRefs.current[index];

            if (iframe && iframe.contentWindow && index !== activeSlide) {
                // PostMessage to pause the video
                iframe.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}',
                    '*'
                );
            }
        });
    }, [activeSlide]);

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
    const isExternalUrl = (url: string) => {
        return url.startsWith('http://') || url.startsWith('https://');
    };

    // Helper function to check if a URL is a YouTube video
    const isYoutubeUrl = (url: string) => {
        return (
            url.includes('youtube.com/watch') ||
            url.includes('youtu.be/') ||
            url.includes('youtube.com/embed/')
        );
    };

    // Extract YouTube video ID from a YouTube URL
    const getYoutubeVideoId = (url: string) => {
        let videoId = '';

        if (url.includes('youtube.com/watch')) {
            // Regular youtube.com/watch?v=VIDEO_ID format
            const urlParams = new URL(url).searchParams;
            videoId = urlParams.get('v') || '';
        } else if (url.includes('youtu.be/')) {
            // Shortened youtu.be/VIDEO_ID format
            videoId = url.split('youtu.be/')[1];
            // Remove any additional parameters
            if (videoId.includes('?')) {
                videoId = videoId.split('?')[0];
            }
        } else if (url.includes('youtube.com/embed/')) {
            // Embed youtube.com/embed/VIDEO_ID format
            videoId = url.split('youtube.com/embed/')[1];
            // Remove any additional parameters
            if (videoId.includes('?')) {
                videoId = videoId.split('?')[0];
            }
        }

        return videoId;
    };

    // Handle YouTube player state changes
    const handleYouTubeMessage = (event: MessageEvent) => {
        try {
            // Parse the data from the YouTube iframe API
            const data = JSON.parse(event.data);

            // Check if this is a YouTube player event
            if (data.event === 'onStateChange') {
                // 1 = playing, 2 = paused, 0 = ended
                if (data.info === 1) {
                    setIsVideoPlaying(true);
                } else if (data.info === 2 || data.info === 0) {
                    setIsVideoPlaying(false);
                }
            }
        } catch (e) {
            // Ignore non-JSON messages
        }
    };

    // Add event listener for YouTube iframe API messages
    useEffect(() => {
        window.addEventListener('message', handleYouTubeMessage);
        return () => {
            window.removeEventListener('message', handleYouTubeMessage);
        };
    }, []);

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
                            className={`absolute w-full h-full transition-opacity duration-700 ease-in-out ${activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            {isYoutubeUrl(item.url) ? (
                                // YouTube video embed
                                <div id={`youtube-container-${index}`} className="absolute inset-0 bg-black">
                                    {/* YouTube video embed - with enablejsapi=1 for control */}
                                    <iframe
                                        ref={el => { youtubeRefs.current[index] = el; }}
                                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(item.url)}?enablejsapi=1&controls=1&rel=0&showinfo=1`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute w-full h-full"
                                        title={`YouTube video ${index + 1}`}
                                    ></iframe>
                                </div>
                            ) : (
                                // Regular image
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
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Slide indicators - only show if more than one item */}
                {totalSlides > 1 && (
                    <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`${activeSlide === index ? 'w-[12px] md:w-[29px]' : 'w-2 md:w-3'} h-2 md:h-3 rounded-full ${activeSlide === index ? 'bg-[#FF6B35]' : 'bg-gray-300'
                                    }`}
                                aria-current={activeSlide === index}
                                aria-label={`Slide ${index + 1}`}
                                onClick={() => goToSlide(index)}
                            ></button>
                        ))}
                    </div>
                )}

                {/* Previous button - only show if more than one item */}
                {totalSlides > 1 && (
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
                )}

                {/* Next button - only show if more than one item */}
                {totalSlides > 1 && (
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
                )}
            </div>
        </div>
    );
}

export default CarouselList;