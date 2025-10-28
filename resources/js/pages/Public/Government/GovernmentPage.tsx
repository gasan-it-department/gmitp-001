import { Card } from "@/components/ui/card";
import PublicLayout from "@/layouts/Public/wrapper/PublicLayoutTemplate";

export default function GovernmentPage() {
    const officials = [
        {
            name: "Hon. James Marty Lim",
            position: "Municipal Mayor",
            image: "/assets/group.png",
            description:
                "As the chief executive of the Municipality of Gasan, the Municipal Mayor oversees the implementation of development programs, ensures efficient delivery of public services, and upholds transparent and accountable governance for every Gasanon.",
        },
        {
            name: "Hon. LOREM IPSUM 2",
            position: "Municipal Vice Mayor",
            image: "/assets/group.png",
            description:
                "The Municipal Vice Mayor presides over the Sangguniang Bayan and supports the Mayor in ensuring effective legislative and executive coordination for the welfare of the community.",
        },
        { name: "Hon. LOREM IPSUM 3", position: "Municipal Councilor", image: "/assets/group.png" },
        { name: "Hon. LOREM IPSUM 4", position: "Municipal Councilor", image: "/assets/group.png" },
        { name: "Hon. LOREM IPSUM 5", position: "Municipal Councilor", image: "/assets/group.png" },
        { name: "Hon. LOREM IPSUM 6", position: "Municipal Councilor", image: "/assets/group.png" },
        { name: "Hon. LOREM IPSUM 7", position: "Municipal Councilor", image: "/assets/group.png" },
    ];

    const mayor = officials.find((o) => o.position === "Municipal Mayor");
    const viceMayor = officials.find((o) => o.position === "Municipal Vice Mayor");
    const councilors = officials.filter((o) => o.position === "Municipal Councilor");

    return (
        <PublicLayout
            title="Government Officials"
            description="Meet the dedicated officials serving the Municipality of Gasan, Marinduque."
        >
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
                    {/* Header */}
                    <header className="text-center pb-8 border-b border-gray-300">
                        <img
                            src="/assets/municipal-logo.png"
                            alt="Municipal Logo"
                            className="mx-auto mb-4 h-16 w-16 sm:h-20 sm:w-20"
                        />
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                            Municipality of Gasan
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 tracking-wide">
                            Province of Marinduque
                        </p>
                        <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-400 mt-2 italic">
                            “Serbisyong may malasakit at katapatan.”
                        </p>
                    </header>

                    {/* Mayor Section */}
                    {mayor && (
                        <section className="mt-10 border-b border-gray-300 pb-10">
                            <h2 className="text-center text-lg sm:text-xl font-semibold uppercase text-gray-700 dark:text-gray-300 mb-8 tracking-wider">
                                Municipal Mayor
                            </h2>

                            <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-center gap-8">
                                <Card className="w-full max-w-xs sm:max-w-sm text-center border border-gray-200 bg-white rounded-2xl p-6 sm:p-8 shadow-md dark:border-gray-800 dark:bg-zinc-900">
                                    <img
                                        src={mayor.image}
                                        alt={mayor.name}
                                        className="h-36 w-36 sm:h-44 sm:w-44 rounded-full object-cover border-4 border-orange-400 mx-auto"
                                    />
                                    <h3 className="mt-5 text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                                        {mayor.name}
                                    </h3>
                                    <p className="text-sm sm:text-base text-orange-700 dark:text-orange-400 font-medium">
                                        {mayor.position}
                                    </p>
                                </Card>

                                <div className="max-w-xl text-justify text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed border-t lg:border-t-0 lg:border-l border-gray-300 pt-4 lg:pt-0 lg:pl-6">
                                    {mayor.description}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Vice Mayor Section */}
                    {viceMayor && (
                        <section className="mt-10 border-b border-gray-300 pb-10">
                            <h2 className="text-center text-lg sm:text-xl font-semibold uppercase text-gray-700 dark:text-gray-300 mb-8 tracking-wider">
                                Municipal Vice Mayor
                            </h2>

                            <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-center gap-8">
                                <Card className="w-full max-w-xs sm:max-w-sm text-center border border-gray-200 bg-white rounded-2xl p-6 sm:p-8 shadow-md dark:border-gray-800 dark:bg-zinc-900">
                                    <img
                                        src={viceMayor.image}
                                        alt={viceMayor.name}
                                        className="h-36 w-36 sm:h-40 sm:w-40 rounded-full object-cover border-4 border-orange-400 mx-auto"
                                    />
                                    <h3 className="mt-5 text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                                        {viceMayor.name}
                                    </h3>
                                    <p className="text-sm sm:text-base text-orange-700 dark:text-orange-400 font-medium">
                                        {viceMayor.position}
                                    </p>
                                </Card>

                                <div className="max-w-xl text-justify text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed border-t lg:border-t-0 lg:border-l border-gray-300 pt-4 lg:pt-0 lg:pl-6">
                                    {viceMayor.description}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Councilors Section */}
                    <section className="mt-12">
                        <h2 className="text-center text-lg sm:text-xl font-semibold uppercase text-gray-700 dark:text-gray-300 mb-8 tracking-wider">
                            Members of the Sangguniang Bayan
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
                            {councilors.map((c, i) => (
                                <Card
                                    key={i}
                                    className="flex flex-col items-center text-center border border-gray-200 bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition dark:border-gray-800 dark:bg-zinc-900"
                                >
                                    <img
                                        src={c.image}
                                        alt={c.name}
                                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-orange-400 mb-3 sm:mb-4"
                                    />
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">
                                        {c.name}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-400 font-medium">
                                        {c.position}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="mt-14 pt-6 border-t border-gray-300 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Municipality of Gasan, Marinduque. All rights reserved.
                    </footer>
                </div>
            </div>
        </PublicLayout>
    );
}
