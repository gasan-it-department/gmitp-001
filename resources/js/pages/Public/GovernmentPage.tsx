import { Card } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/template/PublicLayoutTemplate';
import { useEffect, useState } from 'react';

export default function GovernmentPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-lg text-gray-500">Loading, please wait...</p>
            </div>
        );
    }

    const members = [
        {
            name: 'Hon. James Marty Lim',
            position: 'Mayor',
            image: '/assets/group.png',
            description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.
Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.`,
        },
        {
            name: 'LOREM IPSUM 2',
            position: 'Vice Mayor',
            image: '/assets/group.png',
            description: '',
        },
        {
            name: 'LOREM IPSUM 3',
            position: 'Test 1',
            image: '/assets/group.png',
            description: '',
        },
        {
            name: 'LOREM IPSUM 4',
            position: 'Test 2',
            image: '/assets/group.png',
            description: '',
        },
        {
            name: 'LOREM IPSUM 5',
            position: 'Test 3',
            image: '/assets/group.png',
            description: '',
        },
        {
            name: 'LOREM IPSUM 6',
            position: 'Test 4',
            image: '/assets/group.png',
            description: '',
        },
        {
            name: 'LOREM IPSUM 7',
            position: 'Test 5',
            image: '/assets/group.png',
            description: '',
        },
    ];

    return (
        <PublicLayout title="Government" description="">
            <h3 className="mg:text-[10px] w-full p-5 text-[20px] font-bold">MUNICIPALITY OF GASAN, MARINDUQUE</h3>

            <div className="flex flex-col items-center lg:flex-row lg:items-start">
                <Card className="m-5 p-2">
                    <img src={members[0].image} className="h-40 w-40 object-cover lg:h-90 lg:w-90" alt="Mayor" />
                </Card>

                <div className="flex flex-1 flex-col p-5">
                    <h3 className="p-3 text-[25px] font-bold text-black">{members[0].name}</h3>

                    <p className="p-3 text-[15px] text-gray-500">{members[0].description}</p>
                </div>
            </div>

            <div>
                <h3 className="pt-10 pr-7 pl-7 text-[25px] font-bold text-black">COUNCILORS</h3>

                <div className="grid grid-cols-1 lg:grid-cols-5">
                    {members
                        .filter((member) => member.position !== 'Mayor')
                        .map((member, index) => (
                            <Card key={index} className="m-5 w-auto p-2">
                                <div className="flex flex-col items-center">
                                    <img src={member.image} className="h-20 w-20 object-cover lg:h-40 lg:w-40" alt={member.name} />

                                    <h3 className="mt-2 p-2 text-center font-semibold">{member.name}</h3>

                                    <h3 className="p-2 text-center text-gray-600">{member.position}</h3>
                                </div>
                            </Card>
                        ))}
                </div>
            </div>
        </PublicLayout>
    );
}
