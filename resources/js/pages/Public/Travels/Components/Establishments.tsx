import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import EstablishmentDetailsDialog from "./EstablishmentDetailsDialog";
import { useState } from "react";
import { set } from "date-fns";

interface EstablishmentData {
    id: number;
    name: string;
    category: string;
    image?: string[]; // array of image URLs
    promo_video_url?: string | null; // YouTube or other video URL
    address?: string;
    phone?: string;
    number_rooms?: number;
    total_capacity?: string;
}


export function Establishments() {
    const [establishmentDialog, setEstablishmentDialog] = useState({
        isOpen: false,
        selectedEstablishment: undefined as EstablishmentData | undefined,
    });

    const establishments = [
        {
            id: 1,
            name: "HappyRoo",
            category: "Hotel & Restaurant",
            image: [
                "/assets/dummy/happyroo.webp",
                "/assets/dummy/happyroo.webp",
                "/assets/dummy/happyroo.webp"
            ],
            promo_video_url: "https://youtu.be/z_mqn4WoPTk?si=Nq0Uq87nqszxbs0R",
            address: "Bahi, Gasan, Marinduque",
            number_rooms: 8,
            total_capacity: "2-3 per room",
            phone: "+63 912 345 6789",
        },
        {
            id: 2,
            name: "Spencer's Transient Inn",
            category: "Hotel",
            image: [
                "/assets/dummy/spencer.jpg",
                "/assets/dummy/spencer.jpg",
                "/assets/dummy/spencer.jpg"
            ],
            promo_video_url: null,
            address: "Bahi, Gasan, Marinduque",
            number_rooms: 5,
            total_capacity: "2-3 per room",
            phone: "+63 917 888 5566",
        },
        {
            id: 3,
            name: "De Azura Pension House",
            category: "Hotel",
            image: [
                "/assets/dummy/de_azura.jpg",
                "/assets/dummy/de_azura.jpg",
                "/assets/dummy/de_azura.jpg"
            ],
            promo_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            address: "Masiga, Gasan, Marinduque",
            number_rooms: 10,
            total_capacity: "2-3 per room",
            phone: "+63 2 8899 9999",
        },
        {
            id: 4,
            name: "Casa-de Aplaya",
            category: "Hotel",
            image: [
                "/assets/dummy/casa_aplaya.jpg",
                "/assets/dummy/casa_aplaya.jpg",
                "/assets/dummy/casa_aplaya.jpg"
            ],
            promo_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            address: "Masiga, Gasan, Marinduque",
            number_rooms: 8,
            total_capacity: "2-3 per room",
            phone: "+63 943 555 1234",
        },
    ];

    return (
        <div className="relative p-8 sm:p-12 w-full min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100">
            {/* Subtle glowing background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.6)_0%,transparent_70%)] pointer-events-none" />

            <h2 className="text-4xl font-extrabold mb-10 text-gray-900 text-center drop-shadow-sm tracking-tight">
                Establishments
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {establishments.map((est, index) => (
                    <motion.div
                        key={est.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <Card className="group overflow-hidden bg-white/85 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-[0_10px_25px_rgba(255,83,13,0.2)] border border-amber-100 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] relative">
                            <div className="relative">
                                <img
                                    src={est.image[0]}
                                    alt={est.name}
                                    className="w-full h-48 object-cover rounded-t-3xl transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                                    {est.category}
                                </div>
                            </div>

                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">
                                    {est.name}
                                </h3>

                                <p className="text-sm text-gray-700 flex items-start gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-orange-600 mt-[2px]" />
                                    <span className="leading-tight">{est.address}</span>
                                </p>

                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-red-600" />
                                    <span>{est.phone}</span>
                                </p>

                                <div className="mt-5">
                                    <Button
                                        onClick={() => {
                                            console.log("Clicked", est);
                                            setEstablishmentDialog({ isOpen: true, selectedEstablishment: est });
                                        }}

                                        className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg hover:from-amber-400 hover:via-orange-500 hover:to-red-500 hover:scale-[1.03] active:scale-95 transition-all duration-300">
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Responsive container for the button */}
            <div className="h-8" />

            <div className="flex justify-center sm:justify-end mt-4">
                <Button
                    variant="outline"
                    className="rounded-xl border border-orange-400 text-orange-600 font-semibold
               px-6 py-2.5 text-sm sm:text-base bg-white hover:bg-gradient-to-r
               hover:from-red-500 hover:to-orange-500 hover:text-white transition-colors"
                    onClick={() => {
                        // TODO: Add your load more logic here
                    }}
                >
                    View More
                </Button>
            </div>


            <EstablishmentDetailsDialog
                establishment={establishmentDialog.selectedEstablishment}
                open={establishmentDialog.isOpen}
                onOpenChange={() => {
                    setEstablishmentDialog({ isOpen: false, selectedEstablishment: undefined });
                }} />
        </div>
    );
}