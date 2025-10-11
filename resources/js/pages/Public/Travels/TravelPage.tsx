import PublicLayout from "@/layouts/Public/PublicLayout";
import { TravelBanner } from "./Components/TravelBanner";
import LeaftfletMapView from "./Components/LeafletMapView";
import { DestinationCard } from "./Components/DestinationsCard";

type Destination = {
    id: number;
    name: string;
    description: string;
    position: [number, number];
    image: string;
};

export default function TravelPage() {

    const destinations: Destination[] = [
        {
            id: 1,
            name: "Gasan Sea View & Children's Park",
            description: "A relaxing beach with clear waters and stunning sunsets.",
            position: [13.324171199366216, 121.84521758873431],
            image: "/assets/travel_banner_1.png",
        },
        {
            id: 2,
            name: "Kawilihan Park",
            description: "A peaceful park with a view of Boac river valley.",
            position: [13.325587727541594, 121.84931602870688],
            image: "/assets/travel_banner_1.png",
        },
        {
            id: 3,
            name: "Tres Reyes Islands",
            description: "Three scenic islands great for snorkeling and diving.",
            position: [13.254117982609364, 121.86766968796603],
            image: "/assets/travel_banner_1.png",
        },
        {
            id: 4,
            name: "St. Joseph, Spouse of Mary Parish Church",
            description: "Three scenic islands great for snorkeling and diving.",
            position: [13.322925179715332, 121.84767138911421],
            image: "/assets/travel_banner_1.png",
        },
        {
            id: 5,
            name: "Gasan People's Park",
            description: "Three scenic islands great for snorkeling and diving.",
            position: [13.325787399849315, 121.84634770869236],
            image: "/assets/travel_banner_1.png",
        },
    ];

    return (
        <PublicLayout title="Home" description="">
            <div>
                {/* <TravelBanner/> */}
                <LeaftfletMapView
                    destinationList={destinations} />
                <DestinationCard
                    destinationList={destinations} />
            </div>
        </PublicLayout>
    );
}