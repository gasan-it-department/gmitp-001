import MainPage from "../MainPage";

export default function PrivacyPolicy() {
    return (
        <>
            <h3 className="p-5 font-bold flex">
                PRIVACY POLICY
            </h3>
        </>
    );
}

PrivacyPolicy.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;