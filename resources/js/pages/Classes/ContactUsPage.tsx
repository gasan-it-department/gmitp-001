import MainPage from "../MainPage";

export default function ContactUsPage(){
    return(
        <div>
            <h3>
                CONTACT US
            </h3>
        </div>
    );
}

ContactUsPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;