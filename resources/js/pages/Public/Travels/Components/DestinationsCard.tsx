import { Card, CardContent } from "@/components/ui/card";

interface Props {
    destinationList: Destination[];
}

type Destination = {
    id: number;
    name: string;
    description: string;
    position: [number, number];
    image: string;
};

export function DestinationCard({ destinationList }: Props) {
    return (
        <div className="relative w-full p-4">
            <div
                className="flex overflow-x-auto no-scrollbar gap-4 scroll-smooth"
            >
                {destinationList.map((dest) => (
                    <Card
                        key={dest.id}
                        className="
          w-[220px] sm:w-[250px] lg:w-[280px]
          flex-shrink-0 overflow-hidden 
          shadow-md hover:shadow-lg 
          transition-transform duration-300 
          cursor-pointer hover:-translate-y-1
        "
                    >
                        <CardContent className="p-0">
                            <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-3">
                                <h3 className="text-base font-semibold mb-1 truncate">
                                    {dest.name}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {dest.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

    );
}
