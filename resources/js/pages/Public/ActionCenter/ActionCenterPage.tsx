import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { router } from '@inertiajs/react';
import { ArrowRight, Banknote, Bus, Landmark, LucideIcon, Stethoscope, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import CreateRequestDialog from './Components/CreateRequestDialog';

interface ActionCenterService {
    id: number;
    serviceName: string;
    requirements: string[];
    icon: LucideIcon;
}

interface VehicleList {
    id: number;
    vehicleName: string;
    status: string;
}

export default function ActionCenterPage() {
    const [isLoadingDialogVisible, setLoadingDialogVisible] = useState(true);
    const [services, setServices] = useState<ActionCenterService[]>([]);
    const [vehicles, setVehicles] = useState<VehicleList[]>([]);
    const [isCreateRequestDialogVisible, setCreateRequestDialogVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<ActionCenterService | null>(null);

    async function LoadMunicipalActionCenterServices() {
        setLoadingDialogVisible(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const actionCenterServices = [
            {
                id: 1,
                serviceName: 'Financial',
                icon: Banknote,
                requirements: ['Copies of Certificate of Indigency', 'Copies of valid ID', 'Copies of funeral contract'],
            },
            {
                id: 2,
                serviceName: 'Medical',
                icon: Stethoscope,
                requirements: ['Copies of Certificate of Indigency', 'Copies of valid ID', 'Medical Certificate or Prescription'],
            },
            {
                id: 3,
                serviceName: 'Burial',
                icon: Landmark,
                requirements: ['Copies of Certificate of Indigency', 'Copies of valid ID', 'Death Certificate', 'Funeral Contract'],
            },
            {
                id: 4,
                serviceName: 'Food',
                icon: Utensils,
                requirements: ['Copies of Certificate of Indigency', 'Copies of valid ID'],
            },
            {
                id: 5,
                serviceName: 'Transport',
                icon: Bus,
                requirements: ['Copies of Certificate of Indigency', 'Copies of valid ID', 'Proof of Appointment or Travel Need'],
            },
        ];

        const vehicleList = [
            {
                id: 1,
                vehicleName: 'Ambulance',
                status: 'available',
            },
            {
                id: 2,
                vehicleName: 'Rescue Vehicle',
                status: 'available',
            },
        ];

        setServices(actionCenterServices);
        setVehicles(vehicleList);
        setLoadingDialogVisible(false);
    }

    useEffect(() => {
        LoadMunicipalActionCenterServices();
    }, []);

    function handleServiceClick(service: ActionCenterService) {
        console.log('Clicked service:', service.serviceName);
        setSelectedService(service);
        setCreateRequestDialogVisible(true);
    }

    return (
        <PublicLayout title="Action Center" description="">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <CreateRequestDialog
                    isOpen={isCreateRequestDialogVisible}
                    onClose={() => setCreateRequestDialogVisible(false)}
                    selectedService={selectedService}
                    vehicleList={vehicles}
                />
                {!isLoadingDialogVisible && (
                    <>
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-800">Municipal Action Center Services</h2>
                            <p className="mt-2 text-base text-gray-500">Select from the available services offered by the local government.</p>
                        </div>

                        <div className="mt-5 mb-5 flex w-full justify-end">
                            <Button
                                className="flex items-center justify-center gap-2 p-3 sm:w-fit"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.visit(route('action.center.request.list.show'));
                                }}
                            >
                                View All Request
                                <ArrowRight size={20} />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {services.map((service) => {
                                const Icon = service.icon;

                                return (
                                    <Card
                                        key={service.id}
                                        onClick={() => handleServiceClick(service)}
                                        className="flex w-full cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                                    >
                                        <Icon className="mb-4 h-12 w-12 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-800">{service.serviceName}</h3>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
