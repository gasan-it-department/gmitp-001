
import EventsCalendarUi from "./EventsCalendarUi";
import GeneralAnnouncementUi from "./GeneralAnnouncementUi";
import JobFairUi from "./JobFairUi";

export default function InformationDashboard(){
    return(
        <section className="bg-white dark:bg-gray-900">
            <JobFairUi/>
            <div className="mx-auto flex flex-col lg:flex-row">
                <GeneralAnnouncementUi/>
                <EventsCalendarUi/>
            </div>
        </section>
    );
}