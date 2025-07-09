import MainPage from "../MainPage";

export default function GovernmentPage(){
    return(
        <div>
            <h3>
                GOVERNMENT PAGE
            </h3>
        </div>
    );
}

GovernmentPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;