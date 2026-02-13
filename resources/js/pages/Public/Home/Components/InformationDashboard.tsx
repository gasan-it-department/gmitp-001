
import BusinessPermitCard from "./BusinessPermitCard";
import EventsCalendarUi from "./EventsCalendarUi";
import GeneralAnnouncementUi from "./GeneralAnnouncementUi";
import JobFairUi from "./JobFairUi";

export default function InformationDashboard() {
    return (
        <section className="bg-white dark:bg-gray-900">

            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="w-full p-3">
                    <JobFairUi />
                </div>
                <div className="w-full p-3">
                    <BusinessPermitCard />
                </div>
            </div>

            <div className='h-8' />

            <div className="mx-auto flex flex-col lg:flex-row">
                <GeneralAnnouncementUi />
                <EventsCalendarUi />
            </div>
        </section>
    );
}