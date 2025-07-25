'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Link } from '@inertiajs/react';
import { ArrowRightIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { TouchEvent, useEffect, useRef, useState } from 'react';

type BlogPost = {
    id: number;
    title: string;
    date: string;
    imageUrl: string;
    excerpt: string;
};

const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: 'How Marketing Analytics is Reshaping Business Strategies',
        date: 'April 18, 2023',
        imageUrl:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        excerpt: 'Data-driven marketing is changing how companies make decisions. Learn how to leverage analytics for better results.',
    },
    {
        id: 2,
        title: "The Rise of Video Marketing: Why You Can't Ignore It",
        date: 'April 12, 2023',
        imageUrl:
            'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
        excerpt: 'Video content has become an essential part of modern marketing strategies. Find out why and how to get started.',
    },
    {
        id: 3,
        title: 'Building Customer Loyalty Through Content Marketing',
        date: 'April 5, 2023',
        imageUrl:
            'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        excerpt: 'Create content that not only attracts but retains customers. Strategies for building long-term relationships through your content.',
    },
    {
        id: 4,
        title: 'Social Media Trends That Will Dominate in 2023',
        date: 'March 29, 2023',
        imageUrl:
            'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80',
        excerpt: 'Stay ahead of the curve with these emerging social media trends that will shape the digital landscape this year.',
    },
    {
        id: 5,
        title: 'Email Marketing Personalization: Going Beyond First Name',
        date: 'March 22, 2023',
        imageUrl:
            'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
        excerpt: "Advanced techniques for personalizing your email campaigns that go well beyond simply using a subscriber's name.",
    },
    {
        id: 6,
        title: 'Sustainable Marketing: Building Eco-Friendly Campaigns',
        date: 'March 15, 2023',
        imageUrl:
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        excerpt: 'How to integrate sustainability into your marketing strategy and connect with environmentally conscious consumers.',
    },
];

export default function BlogSectionSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [startX, setStartX] = useState(0);
    const [screenSize, setScreenSize] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
    });

    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate visible items based on screen size
    const visibleItems = screenSize.isDesktop ? 3 : screenSize.isTablet ? 2 : 1;
    const maxIndex = Math.max(0, blogPosts.length - visibleItems);

    // Initialize and update screen size
    useEffect(() => {
        const updateScreenSize = () => {
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;
                setScreenSize({
                    isMobile: width < 640,
                    isTablet: width >= 640 && width < 1024,
                    isDesktop: width >= 1024,
                });
            }
        };

        // Initial check
        updateScreenSize();

        // Listen for resize
        window.addEventListener('resize', updateScreenSize);

        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    // Ensure current index is valid when screen size changes
    useEffect(() => {
        setCurrentIndex((prev) => Math.min(prev, maxIndex));
    }, [screenSize, maxIndex]);

    // Handle navigation
    function handlePrevious() {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    }

    function handleNext() {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    }

    // Scroll to current index
    useEffect(() => {
        if (sliderRef.current) {
            const scrollToIndex = () => {
                if (sliderRef.current) {
                    const cardWidth = sliderRef.current.querySelector('.carousel-item')?.clientWidth || 0;
                    const scrollLeft = cardWidth * currentIndex;

                    sliderRef.current.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth',
                    });
                }
            };

            // Small delay to ensure the DOM has updated
            const timeoutId = setTimeout(scrollToIndex, 50);
            return () => clearTimeout(timeoutId);
        }
    }, [currentIndex, screenSize]);

    // Touch event handlers for swipe functionality
    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        setIsSwiping(true);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (!isSwiping) return;

        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        // Prevent default to stop page scrolling during swipe
        if (Math.abs(diff) > 5) {
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        if (!isSwiping) return;

        const currentX = e.changedTouches[0].clientX;
        const diff = startX - currentX;

        // Determine if swipe is significant
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < maxIndex) {
                handleNext();
            } else if (diff < 0 && currentIndex > 0) {
                handlePrevious();
            }
        }

        setIsSwiping(false);
    };

    // Progress indicators
    const renderProgressIndicators = () => {
        return (
            <div className="mt-6 flex justify-center space-x-2">
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-primary/30'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <PublicLayout title="service" description="">
            <section className="py-12 md:py-20 lg:py-24">
                <div ref={containerRef} className="container mx-auto space-y-6 px-4 md:space-y-8 md:px-6 2xl:max-w-[1400px]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="max-w-md space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Services</h2>
                            <p className="text-sm text-muted-foreground md:text-base"></p>
                        </div>
                        <div className="flex hidden items-center space-x-2 sm:flex">
                            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentIndex === 0} aria-label="Previous slide">
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === maxIndex} aria-label="Next slide">
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden">
                        <div
                            ref={sliderRef}
                            className="scrollbar-hide -mx-4 flex touch-pan-x snap-x snap-mandatory overflow-x-auto px-4 pt-1 pb-2 md:pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {blogPosts.map((post) => (
                                <div key={post.id} className="carousel-item w-full flex-none snap-start px-2 sm:w-1/2 sm:px-4 lg:w-1/3">
                                    <Card className="flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="relative h-40 overflow-hidden sm:h-48 md:h-52">
                                            <image
                                                src={post.imageUrl}
                                                alt={post.title}
                                                className="object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                        <CardContent className="flex-grow">
                                            <div className="mb-2 flex items-center text-xs text-muted-foreground sm:mb-3 sm:text-sm">
                                                <CalendarIcon className="mr-1 h-3 w-3" />
                                                <span>{post.date}</span>
                                            </div>
                                            <h3 className="mb-2 line-clamp-2 text-base font-semibold sm:text-lg">{post.title}</h3>
                                            <p className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-3 sm:text-sm">{post.excerpt}</p>
                                        </CardContent>
                                        <CardFooter className="pb-6">
                                            <Button variant="ghost" size="sm" className="w-full text-sm" asChild>
                                                <Link href="#" className="flex items-center justify-center">
                                                    Apply
                                                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            ))}
                        </div>

                        {/* Progress indicators for mobile */}
                        <div className="sm:hidden">{renderProgressIndicators()}</div>

                        {/* Mobile navigation buttons - only shown on very small screens */}
                        <div className="mt-6 flex items-center justify-between sm:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="mr-2 h-9 flex-1 text-xs"
                            >
                                <ChevronLeftIcon className="mr-1 h-4 w-4" />
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
                                disabled={currentIndex === maxIndex}
                                className="ml-2 h-9 flex-1 text-xs"
                            >
                                Next
                                <ChevronRightIcon className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* <div className="mt-2 flex justify-center sm:mt-8">
                    <Button variant="outline" className="w-full max-w-sm" asChild>
                        <Link href="#">Browse All Services</Link>
                    </Button>
                </div> */}
                </div>
            </section>
        </PublicLayout>
    );
}
