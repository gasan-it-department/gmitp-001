import MainPage from "../MainPage";
import { Card } from "@/components/ui/card";

export default function ServicesPage() {

    const services = [
        { serviceName: "BUSINESS PERMIT", enabled: false, id: "buz_permit"},
        { serviceName: "CIVIL REGISTRY", enabled: true, id: "civil_reg"}
    ]

    return (
        <div className="p-5">
            <a className="p-2 font-bold text-[20px]">
                ALL SERVICES OFFERED
            </a>
            <div className="grid grid-cols-1 lg:grid-cols-6 space-y-2 sm:space-y-0 sm:space-x-2">
                {services.map((services, index) => (
                    <a href="#" className="inline-flex p-2">
                    <Card className="border border-gray-300 rounded-2xl shadow-none p-3 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition">
                        <img src="/assets/group.png" className="w-full h-auto" />
                        <span className="p-3 text-center">
                            {services.serviceName}
                        </span>
                    </Card>
                </a>
                ))}
            </div>
        </div>
    );
}

ServicesPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;