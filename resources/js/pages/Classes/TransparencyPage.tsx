import MainPage from "../MainPage";

export default function Transparency(){
    return(
        <div>
            <h3>
                TRANSPARENCY PAGE
            </h3>
        </div>
    );
}

Transparency.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;