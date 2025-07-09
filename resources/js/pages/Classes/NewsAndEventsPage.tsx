import MainPage from "../MainPage";

export default function NewsAndEventsPage(){
    return(
        <div>
            <h2>
                News and Event Page
            </h2>
        </div>
    );
}

NewsAndEventsPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;