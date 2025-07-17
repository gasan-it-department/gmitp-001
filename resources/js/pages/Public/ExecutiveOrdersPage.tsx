import MainPage from '../MainPage';

export default function ExecutiveOrdersPage() {
    return (
        <div>
            <h3>EXECUTIVE ORDER</h3>
        </div>
    );
}

ExecutiveOrdersPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;
