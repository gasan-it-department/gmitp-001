import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { ExecutiveOrders } from '@/pages/Public/ExecutiveOrder/Components/Eo';

export default function Home() {
    return (
        <PublicLayout title="Executive Order" description="">
            <ExecutiveOrders />
        </PublicLayout>
    );
}
