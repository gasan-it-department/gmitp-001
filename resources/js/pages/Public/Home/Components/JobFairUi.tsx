import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, CalendarDays, MapPin } from "lucide-react";


export default function JobFairUi() {
    return (
        <div className="mx-auto px-5 lg:px-10 w-full">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                <div
                    className="flex-1 rounded-xl overflow-hidden shadow-md bg-cover bg-center 
        min-h-[280px] sm:min-h-[350px] lg:min-h-100"
                >
                    <div className="bg-black/30 w-full h-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                        Empower Your Future — Join Us!
                    </div>
                </div>
            </div>
        </div>
    );
}