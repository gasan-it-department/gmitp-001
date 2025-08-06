import { useState } from 'react';
import { Home, FileText, Settings, Network } from 'lucide-react';

export default function MunicipalAdminPage() {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const menuItems = [
        { icon: <Home size={20} />, label: 'My Account' },
        { icon: <FileText size={20} />, label: 'Executive Orders' },
        { icon: <Settings size={20} />, label: 'Settings' },
        { icon: <Network size={20} />, label: 'Departments' },
    ];
    return (
        <div className="flex">
            <div className={`bg-primary text-white h-screen transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} shadow-lg`}>
                <div className="flex items-center justify-between px-4 py-3">
                    <span className={`text-lg font-semibold transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>Municipal Admin</span>
                
                </div>
                <ul className="mt-6 space-y-2">
                    {menuItems.map((item, index) => (
                        <li key={index} className="flex items-center px-4 py-2 hover:bg-primary/80 cursor-pointer">
                            {item.icon}
                            {isOpen && <span className="ml-3">{item.label}</span>}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-4">
                <h1 className="text-xl font-bold">Content Area</h1>
            </div>
        </div>
    );
}