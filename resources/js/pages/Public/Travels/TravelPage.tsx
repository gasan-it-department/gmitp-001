import LeaftfletMapView from "./Components/LeafletMapView";
import { DestinationCard } from "./Components/DestinationsCard";
import PromotionPage from "./Components/PromotionPage";
import TravelHeader from "./Components/TravelHeader";
import { Establishments } from "./Components/Establishments";
import { MunicipalityProvider } from "@/Core/Context/MunicipalityContext";

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
            description: "Featureing a panoraic view of the setting sun.",
            position: [13.324171199366216, 121.84521758873431],
            image: "/assets/sea_view.png",
        },
        {
            id: 2,
            name: "Kawilihan Park",
            description: "Feel the lush of green at the Kawilihan Park and breath the fresh air the giant Ipil-Ipil trees exclude! Rises above Gasan skyline, this park is ideal for camping, picnic and mountains.",
            position: [13.325587727541594, 121.84931602870688],
            image: "/assets/kawilihan.png",
        },
        {
            id: 3,
            name: "Tres Reyes Islands",
            description: "Want a perfect hideaway for both relaxation and discovery? Come and explore this tourist attraction.",
            position: [13.254117982609364, 121.86766968796603],
            image: "/assets/travel_banner_1.png",
        },
        {
            id: 4,
            name: "St. Joseph, Spouse of Mary Parish Church",
            description: "Visit our church and be facinated by its beauty while forgetting all your sadness and tourbles. The church sits on top a high portion of Gasan. From the church you will be able to see the magnificent view of Gasan.",
            position: [13.322925179715332, 121.84767138911421],
            image: "/assets/st_joseph.png",
        },
        {
            id: 5,
            name: "Gasan People's Park",
            description: "Perhaps the most obvious attraction visitors will notice when arriving in Gasan is the Gasan People's Park (formerly know as Guingona Park). It is where most of the activities during Lenten celebration are being held.",
            position: [13.325787399849315, 121.84634770869236],
            image: "/assets/guingona.jpg",
        },
    ];

    return (
        <MunicipalityProvider>
            <div className="max-w-[2000px] mx-auto">
                <TravelHeader />
                <PromotionPage />
                <LeaftfletMapView destinationList={destinations} />
                <DestinationCard destinationList={destinations} />
                <Establishments />
            </div>
        </MunicipalityProvider>
    );
}