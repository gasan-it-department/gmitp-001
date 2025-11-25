import CommunityReportHeader from "./CommunityReportHeader";


export default function CommunityReportPageTable() {
    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Event List</h1>
                <CommunityReportHeader />
            </div>
        </div>
    );
}