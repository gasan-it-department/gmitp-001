
import EventsCalendarUi from "./EventsCalendarUi";
import GeneralAnnouncementUi from "./GeneralAnnouncementUi";
import JobFairUi from "./JobFairUi";

export default function InformationDashboard() {
    return (
        <section className="bg-white dark:bg-gray-900">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <JobFairUi />
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