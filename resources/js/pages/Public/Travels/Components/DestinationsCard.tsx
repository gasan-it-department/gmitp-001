import { Card, CardContent } from "@/components/ui/card";
import React from "react";

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
                        className="min-w-[250px] flex-shrink-0 overflow-hidden shadow-md hover:shadow-lg transition-transform duration-300 cursor-pointer hover:-translate-y-1"
                    >
                        <CardContent className="p-0">
                            <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-3">
                                <h3 className="text-base font-semibold mb-1">{dest.name}</h3>
                                <p className="text-sm text-gray-600">{dest.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
