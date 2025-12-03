import { Card } from "@/components/ui/card";
import PublicLayout from "@/layouts/Public/wrapper/PublicLayoutTemplate";

export default function GovernmentPage() {
    const officials = [
        {
            name: "Hon. James Marty L. Lim",
            position: "Municipal Mayor",
            image: "https://scontent.fmnl4-3.fna.fbcdn.net/v/t39.30808-6/550656754_815149738128259_7419807359012882333_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHSd3L6MzdZylKmYfkFs5gDun_g4mrkGIG6f-DiauQYgbyRFWHBV3ENeq9TpR5o3GkfS06h43ZAU-SLGjr7qW1o&_nc_ohc=_hxEv-B9ytgQ7kNvwEGdSJl&_nc_oc=AdnLsAFAstnNmR6B92LiSjTnn6rtNs6VZaAIMQ5EjnlGyVPAwA_w1-Ns16PVVsXZndk&_nc_zt=23&_nc_ht=scontent.fmnl4-3.fna&_nc_gid=LjUbekQBXAg9ADv9gG9iSA&oh=00_AflDueldBaoZPw_Gz3I0TztlprTOgDmqmfdZ_HhT0aRy2A&oe=69356406",
            description:
                "As the chief executive of the Municipality of Gasan, the Municipal Mayor oversees the implementation of development programs, ensures efficient delivery of public services, and upholds transparent and accountable governance for every Gasanon.",
        },
        {
            name: "Hon. Lidany A. Lao-Baldo",
            position: "Municipal Vice Mayor",
            image: "https://scontent.fmnl4-3.fna.fbcdn.net/v/t39.30808-6/514499976_710701225046712_1071594883676977387_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHrBD73o8u357-tc9bSjAnzNL33JvDs-Kw0vfcm8Oz4rKvw5PzOxZ6-a5FublObtQ1cG0BWpMn5m1Pj_OxeWtWz&_nc_ohc=Vchjky7YBPYQ7kNvwHNgRc8&_nc_oc=AdkTmJXcjF9I_atZCyyH81EHlF_ssXgPOBDHTg-9Wb02kWfnpVSpcgg3cAbhKBxtWuY&_nc_zt=23&_nc_ht=scontent.fmnl4-3.fna&_nc_gid=Hh_DRx7FRIixQLLItw06Aw&oh=00_AfmafFJIVH2rL8Y9u4ITWrhmk4vWneZaHkg3aQkm4ADEeA&oe=693563C5",
            description:
                "The Municipal Vice Mayor presides over the Sangguniang Bayan and supports the Mayor in ensuring effective legislative and executive coordination for the welfare of the community.",
        },
        { name: "Hon. Ricardo F. Macunat", position: "Municipal Councilor", image: "https://scontent.fmnl4-3.fna.fbcdn.net/v/t39.30808-6/514413954_710699061713595_5992977258682643732_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEOPTcsKS0Z-x8pInyxBxmEQH-0iZDUPxZAf7SJkNQ_FhDf65Lzcq5QEBUG7LPTNJMu5rBYf7vPIPjgpTglh4eN&_nc_ohc=4EFUkG36HvEQ7kNvwEA9_7n&_nc_oc=AdldbsO_g57HuBkevXWi1vmqGycuKjNd05XHkcvOAGdJ8x_Hm9mHAspkv6aOVFDxUBU&_nc_zt=23&_nc_ht=scontent.fmnl4-3.fna&_nc_gid=Uit8TGi7JbulFpgwAA7hPw&oh=00_AfldxqzHUE2vFpeYyd7HT708Qq_PKX0qkazWOGBVojR8zQ&oe=6935524D" },
        { name: "Hon. Dunne Melton S. Motol", position: "Municipal Councilor", image: "https://scontent.fmnl4-3.fna.fbcdn.net/v/t39.30808-6/514601849_710699065046928_5174553878583697667_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFcBM9p8jGhmwoj4gRldlpbZPk9w1GHFsFk-T3DUYcWwaXDFODLTueCG7OHKvoL2d71sZPqt2Cf4EY6r3KRjf48&_nc_ohc=rX59GS_PXAEQ7kNvwHfT2c-&_nc_oc=Adm80XWjwragiQyZ3rQ48RCuGL5Bc8jr9E2HVK-328KqY9QYG_u1DEDUDLikB70NjjU&_nc_zt=23&_nc_ht=scontent.fmnl4-3.fna&_nc_gid=r20wbHLvEc70GJl9N63yfw&oh=00_AflyMNPnFpWkfUOq1Q6LflvV3BYBouaB8aV46XLNnM1mtQ&oe=6935620B" },
        { name: "Hon. Reynaldo M. Maming", position: "Municipal Councilor", image: "https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/514647434_710699071713594_4289868672478160387_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEnboECA9sY8-GvBW-7x4EQJwM75oV35F8nAzvmhXfkXzA9VduWB6oZgqlgw-1U-8qbNFUX7Of_rZlvZBpq-qrS&_nc_ohc=rguMiUGxL5IQ7kNvwHFbh24&_nc_oc=AdlcyvR-v9_xLZRZlap-xyWJ_ZR6g-AFiULFgDMRnFe3LIRiVt-cl0NwQiNcJoy4fa8&_nc_zt=23&_nc_ht=scontent.fmnl4-2.fna&_nc_gid=5IFnyoIOdS-u4pBsf_NB1Q&oh=00_Afk8LCMi3l6b-Awn9nKuAiohMaDtM05To0WzTTbL7CF6CQ&oe=6935736D" },
        { name: "Hon. Mary Kris Tolentino", position: "Municipal Councilor", image: "https://scontent.fmnl4-6.fna.fbcdn.net/v/t39.30808-6/515041702_710699191713582_6006854631222912150_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHKNc9I-iZRbf-DLQeNhU8zm5OmHr9X2bObk6Yev1fZs-v7FKPwKwdMkam3stjhR1sYSTxDg2801XqDogbUv0_Q&_nc_ohc=zgJJZE9GzXMQ7kNvwH5wWAE&_nc_oc=Adlrm59Awz2hURtQfqcey2GB1xCgfZ3tFOdKc4jVLJcZL3bNsBF6qXCMWhfzRP90AW4&_nc_zt=23&_nc_ht=scontent.fmnl4-6.fna&_nc_gid=GvL2I9m2AmW2wc60DOVqTw&oh=00_AfmuUwdeaYu8tKLTLmIe_BzIFCRX3Am1zem6yghJO46tcw&oe=693548A8" },
        { name: "Hon. Maria Merlie Soberano-Selda", position: "Municipal Councilor", image: "https://scontent.fmnl4-6.fna.fbcdn.net/v/t39.30808-6/515319219_711317601651741_4863559060463655908_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEV5q7rgjls_QMKAbFlVES35Z6C4yJoLtblnoLjImgu1tzQXqLSmN2dJx2g5W3zhAPFhyX7ZvLOQ0_9m-Pitrio&_nc_ohc=SEwMXX_f-zoQ7kNvwE3Dp53&_nc_oc=AdlV12nuOyFavJBk-CR_QdykzdQPGFycznO0GSeSLHO2a6gqIICYrelVnI2jr5KbdWM&_nc_zt=23&_nc_ht=scontent.fmnl4-6.fna&_nc_gid=yXsl6bb3pDymtXuD397Xcw&oh=00_AfkEHjiogbyY6zEiRrE7e27eDs9rs20wjiK-N4GQ3REdMw&oe=6935514C" },
        { name: "Hon. Servillano M. Balitaan", position: "Municipal Councilor", image: "https://scontent.fmnl4-6.fna.fbcdn.net/v/t39.30808-6/514320409_710699198380248_4379646378771987371_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHcgXyGEAZeWvJzDgmKY45YlYsJofEkEzqViwmh8SQTOgH5tSwpkPkOKv3l6GNno5g8kPsqeICGSbLEPdroeKJe&_nc_ohc=pat0xLdPM9kQ7kNvwESrM7i&_nc_oc=Adlt4ZBrNg34NOc8-CcBhwQmKKU5JTrdcFguj6j2e3teYLwpXiQ2nqglhcB0L_hgiEc&_nc_zt=23&_nc_ht=scontent.fmnl4-6.fna&_nc_gid=Zg8E62jCDr4AXqhlnpaM-A&oh=00_AfnKDywjc9xWJBWothdxHAVQjn2fagfjWVRF58p0jkkwtA&oe=693563BC" },
        { name: "Hon. Harold K. Lim", position: "Municipal Councilor", image: "https://scontent.fmnl4-7.fna.fbcdn.net/v/t39.30808-6/514411799_710699285046906_254425484772528954_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFjfGTDK90HpSxRUUwkk4dxBTV-FhJ7z14FNX4WEnvPXrMoexG3PYBT39LFsk8cgdtcE5K7Gm3ilmqO33ImDMYe&_nc_ohc=847Cm_wViEEQ7kNvwFWOmlM&_nc_oc=AdmK9jUl8ogdqMO21FIpJPeE6dHL2BVctjCvXo9FA0gD5W1WeyP3pmaWUglrNY1Kxco&_nc_zt=23&_nc_ht=scontent.fmnl4-7.fna&_nc_gid=ymxFmwJ-OILA4gWMKXlBOA&oh=00_Aflm6nWbvlurjgZaNoQFQF7uKmwgsF827lo5P3vB1Sjbtw&oe=69355367" },
        { name: "Hon. Constancio W. Saludo", position: "Municipal Councilor", image: "https://scontent.fmnl4-7.fna.fbcdn.net/v/t39.30808-6/514317161_710699298380238_901660718128282282_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeH5hBbMJX0Y6Uj6QZwdcCZRhgY_tiwVxR6GBj-2LBXFHuNto6-nMXVbU0lXx9jyampSC9LhKdSYu6qQOuO9KvJ5&_nc_ohc=_lGtTtdIn6oQ7kNvwEpQmxl&_nc_oc=AdlBW0PF4-EO9oHlfmbPLIytmcP9gSPyCnpqxC-xj5etq-328JYvSQ1Zm-cAuSXHh90&_nc_zt=23&_nc_ht=scontent.fmnl4-7.fna&_nc_gid=mrXR4Yf6Y0-jBIMVZBs_KA&oh=00_AfmAJ1VnPXhIvxulHrTZZGKwfgVPIMfuJkwk_0uWL9UTmA&oe=69353CAF" },
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
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                            Municipality of Gasan
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 tracking-wide">
                            Province of Marinduque
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
                            Councilors
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
