
import { Card, CardContent } from "@/components/ui/card"
import Autoplay from 'embla-carousel-autoplay';
import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

interface CarouselItemType {
    id: number;
    title: string;
    image: string;
}

interface CarouselInterface {
    carouselItems: CarouselItemType[];
    itemClicked: (item: CarouselItemType) => void;
}

export default function HomeMunicipalProgramsCarousel({carouselItems, itemClicked}: CarouselInterface) {

  const plugin = React.useRef(
    Autoplay({ delay: 22000, stopOnInteraction: true })
  );

  return (
    <Carousel className="w-full flex justify-center" plugins={[plugin.current]}>
      <CarouselContent>
        {carouselItems.map((item) => (
          <CarouselItem key={item.id}>
            <div className="p-1">
              <Card
                onClick={() => itemClicked(item)}
                className="cursor-pointer"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <span className="mt-4 text-lg font-semibold">
                    {item.title}
                  </span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
