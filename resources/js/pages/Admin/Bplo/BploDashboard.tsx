
import { Menu, X } from "lucide-react";
import { useState } from "react";


export default function BploDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: "Dashboard", href: "#" },
        { name: "Applications", href: "#" },
        { name: "Pending", href: "#" },
        { name: "Cancelled", href: "#" },
    ];

    return (
        <div className="flex min-h-screen">
            <div className={`bg-white w-64 p-4 shadow-lg fixed sm:relative z-20 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}>
                <div className="font-bold text-lg mb-6">BPLO Admin</div>
                <ul className="space-y-3">
                    {navigation.map((item, index) => (
                        <li key={index}>
                            <a
                                href={item.href}
                                className="block w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-black transition text-gray-800 hover:text-black font-medium"
                            >
                                <div className="flex justify-between items-center">
                                    <span>{item.name}</span>
                                    <span className="bg-black text-white text-xs font-semibold px-2 py-0.5 rounded-full">1</span>
                                </div>
                            </a>

                        </li>
                    ))}
                </ul>
            </div>

            <button
                className="sm:hidden absolute top-4 left-4 z-30 text-gray-800"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="p-4">
                <a className="p-8 text-[25px]">
                    DASHBOARD
                </a>
            </div>
        </div>
    );
}