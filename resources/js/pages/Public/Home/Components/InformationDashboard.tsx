
import EventsCalendarUi from "./EventsCalendarUi";
import GeneralAnnouncement from "./GeneralAnnouncement";

export default function InformationDashboard(){
    return(
        <section className="bg-white dark:bg-gray-900">
            <div className="mx-auto py-8 sm:py-16 flex flex-col lg:flex-row">
                <GeneralAnnouncement/>
                <EventsCalendarUi/>
            </div>
        </section>
    );
}