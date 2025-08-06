import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { router } from "@inertiajs/react";
import { ArrowRight, LifeBuoy, Star } from "lucide-react";


export default function ActionCenterUi(){
    return(
        <div className="px-4 sm:px-6 md:px-10 lg:px-16">
            <Card className="p-5 m-1 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full">
                <div className="flex items-center">
                    <LifeBuoy className="w-12 h-12 text-blue-600" />
                    <a className="ml-4 font-bold text-lg sm:text-xl md:text-2xl">
                        Action Center
                    </a>
                </div>

                <span className="block mt-2 mb-4 text-sm sm:text-base">
                    One-stop help desk that provides quick access to services like medical, financial, food, and transportation assistance for residents.
                </span>
                <Button
                    className="p-3 w-full sm:w-fit flex items-center justify-center gap-2"
                    variant="outline"
                    size="sm"
                    onClick={() => {router.visit(route('action.center.show'))}}
                >
                    View Services
                    <ArrowRight size={20} />
                </Button>
            </Card>
        </div>
    );
}