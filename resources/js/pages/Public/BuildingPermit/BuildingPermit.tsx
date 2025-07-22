import PublicLayout from "@/layouts/PublicLayoutTemplate";


export default function BuildingPermit(){
    return(
        <PublicLayout title="Business Permit" description="">
            <div className="px-4 py-4 max-w-5xl mx-auto">
                <h1 className="font-bold text-[20px] mb-4 ml-3">
                    Building Permit
                </h1>
                <div className="bg-white p-5 rounded shadow-sm">
                    <p>Details about the building permit process will be added here.</p>
                </div>
            </div>
        </PublicLayout>
    );
}