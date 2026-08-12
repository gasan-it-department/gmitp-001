import PublicLayout from '@/layouts/Public/PublicLayout';
import { ExecutiveOrders } from './Components/ExecutiveOrders';

export default function Home() {
    return (
        <PublicLayout
            title="Executive Orders"
            description="Read official executive orders, directives, and issuances published by the municipal government."
        >
            <ExecutiveOrders />
        </PublicLayout>
    );
}
