import PublicLayout from "@/layouts/Public/PublicLayout";
import AllAnnouncementTable from "./Components/AllAnnouncementTable";

export default function AllAnnouncements() {
    return (
        <PublicLayout title="Executive Order" description="">
            <AllAnnouncementTable/>
        </PublicLayout>
    );
}