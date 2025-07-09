import MainPage from "../MainPage";

export default function ServicesPage(){
    return(
        <div>
            <h3>
                SERVICES PAGE
            </h3>
        </div>
    );
}

ServicesPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;