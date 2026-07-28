import PublicLayout from '@/layouts/Public/PublicLayout';
import { ExecutiveOrders } from './Components/ExecutiveOrders';

export default function Home() {
    return (
        <PublicLayout title="Executive Order" description="">
            <ExecutiveOrders />
        </PublicLayout>
    );
}
