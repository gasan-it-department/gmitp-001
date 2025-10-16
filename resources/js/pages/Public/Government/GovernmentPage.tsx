import { Card, CardContent } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';

export default function GovernmentPage() {
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

    const mayor = members.find((m) => m.position === "Mayor");
    const others = members.filter((m) => m.position !== "Mayor");
    const viceMayor = others.find((m) => m.position === "Vice Mayor");
    const councilors = others.filter((m) => m.position !== "Vice Mayor");

    return (
        <PublicLayout title="Government" description="">
            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-white dark:from-zinc-900 dark:to-black">
                <div className="mx-auto w-full max-w-7xl p-5 text-center">
                    {/* Header */}
                    <h2 className="text-[22px] font-bold tracking-wide text-gray-700 dark:text-gray-200">
                        MUNICIPALITY OF GASAN, MARINDUQUE
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Official Local Government Unit Officials
                    </p>

                    {/* Mayor Section */}
                    {mayor && (
                        <div className="mt-10 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
                            <Card className="flex w-full max-w-[300px] flex-col items-center rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-md transition hover:shadow-lg dark:border-orange-800 dark:bg-zinc-900">
                                <img
                                    src={mayor.image}
                                    alt={mayor.name}
                                    className="h-40 w-40 rounded-full object-cover ring-4 ring-orange-400 dark:ring-orange-700"
                                />
                                <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">
                                    {mayor.name}
                                </h3>
                                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                    {mayor.position}
                                </p>
                            </Card>

                            <Card className="max-w-2xl border-none bg-transparent p-5 text-left">
                                <CardContent className="text-gray-700 dark:text-gray-300">
                                    {mayor.description}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Vice Mayor Section */}
                    {viceMayor && (
                        <div className="mt-14">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                Vice Mayor
                            </h3>
                            <div className="mt-4 flex justify-center">
                                <Card className="flex w-[220px] flex-col items-center rounded-xl border border-orange-200 bg-white p-4 shadow-md hover:shadow-lg dark:border-orange-800 dark:bg-zinc-900">
                                    <img
                                        src={viceMayor.image}
                                        alt={viceMayor.name}
                                        className="h-32 w-32 rounded-full object-cover ring-2 ring-orange-300 dark:ring-orange-700"
                                    />
                                    <h4 className="mt-3 font-semibold text-gray-800 dark:text-gray-100">
                                        {viceMayor.name}
                                    </h4>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                        {viceMayor.position}
                                    </p>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Councilors Section */}
                    <div className="mt-16">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            Councilors
                        </h3>
                        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                            {councilors.map((member, index) => (
                                <Card
                                    key={index}
                                    className="flex flex-col items-center rounded-xl border border-orange-200 bg-white p-4 shadow-md hover:shadow-lg dark:border-orange-800 dark:bg-zinc-900"
                                >
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="h-24 w-24 rounded-full object-cover ring-2 ring-orange-300 dark:ring-orange-700"
                                    />
                                    <h4 className="mt-3 font-semibold text-gray-800 dark:text-gray-100">
                                        {member.name}
                                    </h4>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                        {member.position}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
