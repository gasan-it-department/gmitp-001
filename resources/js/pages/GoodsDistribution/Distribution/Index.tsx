import { Button } from '@/components/ui/button';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useInventoryContext } from '../Inventory/components';
import { DirectoryLayout } from '../Inventory/DirectoryLayout';
import RequestList, { type RequestListProps } from './RequestList';
import type { Permissions } from './types';

export default function Index(props: RequestListProps & { permissions: Permissions }) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.requests;
    return (
        <DirectoryLayout
            rootHref={routes.index.url({ municipality: slug })}
            title="Distribution"
            actions={
                props.permissions.intake && (
                    <Button asChild className="bg-[#245e4f] text-white shadow-none">
                        <Link href={routes.create.url({ municipality: slug })}>
                            <Plus className="size-4" />
                            New distribution
                        </Link>
                    </Button>
                )
            }
        >
            <RequestList key={JSON.stringify(props.filters)} {...props} />
        </DirectoryLayout>
    );
}
