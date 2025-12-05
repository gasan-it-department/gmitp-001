import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { ExecutiveOrders } from './Components/ExecutiveOrders';

export default function Home() {
    return (
        <PublicLayout title="Executive Order" description="">
            <ExecutiveOrders />
        </PublicLayout>
    );
}
