import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ArrowRightIcon, CalendarIcon, Link } from 'lucide-react';
// or 'react-router-dom' if you're not using Next.js

const newsCarouselItems = [
    { id: 1, title: 'News 1 Item', excerpt: 'This is a short summary for news 1', image: '/assets/news_banner_1.png' },
    { id: 2, title: 'News 2 Item', excerpt: 'This is a short summary for news 2', image: '/assets/news_banner_2.png' },
    { id: 3, title: 'News 3 Item', excerpt: 'This is a short summary for news 3', image: '/assets/news_banner_3.png' },
    { id: 4, title: 'News 1 Item', excerpt: 'This is a short summary for news 1', image: '/assets/news_banner_1.png' },
    { id: 5, title: 'News 2 Item', excerpt: 'This is a short summary for news 2', image: '/assets/news_banner_2.png' },
    { id: 6, title: 'News 3 Item', excerpt: 'This is a short summary for news 3', image: '/assets/news_banner_3.png' },
];
// const plugin = React.useRef(Autoplay({ delay: 2100, stopOnInteraction: true }));
export default function CarouselComponent() {
    return (
        <section>
            <div className="mx-auto max-w-md text-center">
                <h2 className="text-4xl font-extrabold tracking-tight md:text-3xl">Lorem Ipsum</h2>
                <p className="dark:text-gray-4000 text-gray-500 sm:text-xl">
                    Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit
                </p>
            </div>

            <div className="px-5 lg:px-2">
                <Carousel>
                    <CarouselContent>
                        {newsCarouselItems.map((item) => (
                            <CarouselItem key={item.id} className="mx-auto md:basis-1/2 lg:basis-1/3">
                                <Card className="flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="relative h-40 overflow-hidden sm:h-48 md:h-52">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />{' '}
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-primary hover:bg-primary/90">{item.title}</Badge>
                                        </div>
                                    </div>
                                    <CardContent className="flex-grow">
                                        <div className="mb-2 flex items-center text-xs text-muted-foreground sm:mb-3 sm:text-sm">
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            <span>{item.title}</span>
                                        </div>
                                        <h3 className="mb-2 line-clamp-2 text-base font-semibold sm:text-lg">{item.title}</h3>
                                        <p className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-3 sm:text-sm">{item.excerpt}</p>
                                    </CardContent>
                                    <CardFooter className="pb-6">
                                        <Button variant="ghost" size="sm" className="w-full text-sm" asChild>
                                            <Link className="flex items-center justify-center">
                                                Read Article
                                                <ArrowRightIcon className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
}
