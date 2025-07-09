import { Card } from "@/components/ui/card";
import MainPage from "../MainPage";
import { useEffect, useState } from 'react';

export default function GovernmentPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-lg">Loading, please wait...</p>
            </div>
        );
    }

    const members = [
        {
            name: 'Hon. James Marty Lim',
            position: "Mayor",
            image: "/assets/group.png",
            description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.
Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.`
        },
        {
            name: 'LOREM IPSUM 2',
            position: "Vice Mayor",
            image: "/assets/group.png",
            description: ""
        },
        {
            name: 'LOREM IPSUM 3',
            position: "Test 1",
            image: "/assets/group.png",
            description: ""
        },
        {
            name: 'LOREM IPSUM 4',
            position: "Test 2",
            image: "/assets/group.png",
            description: ""
        },
        {
            name: 'LOREM IPSUM 5',
            position: "Test 3",
            image: "/assets/group.png",
            description: ""
        },
        {
            name: 'LOREM IPSUM 6',
            position: "Test 4",
            image: "/assets/group.png",
            description: ""
        },
        {
            name: 'LOREM IPSUM 7',
            position: "Test 5",
            image: "/assets/group.png",
            description: ""
        },
    ];

    return (
        <div>
            <h3 className="w-full p-5 font-bold mg:text-[10px] text-[20px]">
                MUNICIPALITY OF GASAN, MARINDUQUE
            </h3>

            <div className="flex flex-col lg:flex-row items-center lg:items-start">
                <Card className="m-5 p-2">
                    <img
                        src={members[0].image}
                        className="w-40 h-40 lg:w-90 lg:h-90 object-cover"
                        alt="Mayor"
                    />
                </Card>

                <div className="flex flex-col p-5 flex-1">
                    <h3 className="p-3 font-bold text-[25px] text-black">
                        {members[0].name}
                    </h3>

                    <p className="p-3 text-[15px] text-gray-500">
                        {members[0].description}
                    </p>
                </div>
            </div>

            <div>
                <h3 className="pl-7 pr-7 pt-10 font-bold text-[25px] text-black">
                    COUNCILORS
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-5">
                    {members
                        .filter((member) => member.position !== 'Mayor')
                        .map((member, index) => (
                            <Card key={index} className="m-5 p-2 w-auto">
                                <div className="flex flex-col items-center">
                                    <img
                                        src={member.image}
                                        className="w-20 h-20 lg:w-40 lg:h-40 object-cover"
                                        alt={member.name}
                                    />

                                    <h3 className="mt-2 font-semibold text-center p-2">
                                        {member.name}
                                    </h3>

                                    <h3 className="text-center text-gray-600 p-2">
                                        {member.position}
                                    </h3>
                                </div>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    );
}

GovernmentPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;