import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ArrowRightIcon, CalendarIcon, Link } from 'lucide-react';
import moment from 'moment';
//import { UnixTime} from '@/components/UnixTime';

const newsCarouselItems = [
    { time: 1753431319, title: 'Class Suspended', excerpt: 'Sinuspende ang lahat ng klase sa buong marinduque dahil sa inaasahang malakas na pag ulan.', image: '/assets/news_banner_1.png' },
    { time: 1753665747, title: 'News 2 Item', excerpt: 'This is a short summary for news 2', image: '/assets/news_banner_2.png' },
    { time: 1753431331, title: 'News 3 Item', excerpt: 'This is a short summary for news 3', image: '/assets/news_banner_3.png' },
    { time: 1753665565, title: 'News 1 Item', excerpt: 'This is a short summary for news 1', image: '/assets/news_banner_1.png' },
];

newsCarouselItems.sort((a, b) => a.time - b.time);

export default function CarouselComponent() {
    let headlineTitle = "Latest News and Updates";

    return (
        <section>
            <div className="mx-auto max-w-md text-center">
                <h2 className="text-4xl font-extrabold tracking-tight md:text-3xl">{headlineTitle}</h2>
            </div>

            <div className='mt-5 mb-5' />

            <div className="px-5 lg:px-2">
                <Carousel>
                    <CarouselContent>
                        {newsCarouselItems.map((item) => (
                            <CarouselItem key={item.time} className="mx-auto md:basis-1/2 lg:basis-1/3">
                                <Card className="flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="relative h-40 overflow-hidden sm:h-48 md:h-52">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-primary hover:bg-primary/90">{item.title}</Badge>
                                        </div>
                                    </div>
                                    <CardContent className="flex-grow">
                                        <div className="mb-2 flex items-center text-xs text-muted-foreground sm:mb-3 sm:text-sm">
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            <span>
                                                {moment.unix(item.time).format('MMMM D, YYYY hh:mm A')}
                                            </span>
                                        </div>
                                        <h3 className="mb-2 line-clamp-2 text-base font-semibold sm:text-lg">{item.title}</h3>
                                        <p className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-3 sm:text-sm">{item.excerpt}</p>
                                    </CardContent>
                                    <CardFooter className="pb-6">
                                        <Button variant="outline" size="sm" className="w-full text-sm" asChild>
                                            <a className='p-5'>
                                                Read More
                                            </a>
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
