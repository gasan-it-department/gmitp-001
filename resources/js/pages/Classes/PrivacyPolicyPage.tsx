import MainPage from "../MainPage";

export default function PrivacyPolicyPage() {
    return (
        <>
            <h3 className="p-5 font-bold flex">
                PRIVACY POLICY
            </h3>
        </>
    );
}

PrivacyPolicyPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;