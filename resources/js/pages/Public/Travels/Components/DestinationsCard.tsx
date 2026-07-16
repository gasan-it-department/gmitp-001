import { Card, CardContent } from "@/components/ui/card";

interface Props {
    destinationList: Destination[];
}

type Destination = {
    id: string | number;
    name: string;
    description: string;
    position?: [number, number];
    image?: string | null;
};

export function DestinationCard({ destinationList }: Props) {
    return (
        <div className="relative w-full p-4">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-sky-700">Places to visit</span>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Tourist spots</h2>
                </div>
                <p className="hidden max-w-sm text-right text-sm text-slate-500 sm:block">
                    Swipe through destinations from the AGA tourism directory.
                </p>
            </div>
            <div
                className="flex overflow-x-auto no-scrollbar gap-4 scroll-smooth"
            >
                {destinationList.map((dest) => (
                    <Card
                        key={dest.id}
                        className="
          w-[220px] sm:w-[250px] lg:w-[280px]
          flex-shrink-0 overflow-hidden 
          border border-sky-100 bg-white shadow-md shadow-slate-200/70 hover:shadow-xl hover:shadow-sky-900/10
          transition-transform duration-300 
          cursor-pointer hover:-translate-y-1
        "
                    >
                        <CardContent className="p-0">
                            {dest.image ? (
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-40 object-cover"
                                />
                            ) : (
                                <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 px-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-cyan-100">
                                    Tourism
                                </div>
                            )}
                            <div className="p-3">
                                <h3 className="text-base font-semibold mb-1 truncate text-slate-950">
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
