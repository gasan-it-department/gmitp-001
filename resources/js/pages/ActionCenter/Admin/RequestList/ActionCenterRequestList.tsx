// resources/js/Pages/ActionCenter/Admin/RequestList/ActionCenterRequestList.tsx
import AdminLayout from '@/layouts/App/AppLayout';
import { AssistanceApiResponse, AssistanceRequestTable } from './Components/AssistanceRequestTable';
// Don't need to import usePage here, but good to know it's available for deep inspection if needed

interface Props {
    // These names match the keys in your Controller's Inertia::render array
    requests: AssistanceApiResponse;
    filters: any;
}

// 1. Remove the misplaced console.log(AssistanceApiResponse);

export default function ActionCenterRequestList({ requests, filters }: Props) {
    // 2. Add the console.log here, inside the function body
    // This will execute every time the component renders (including partial reloads)
    console.log('--- INERTIA PROPS RECEIVED ---');
    console.log('Requests Data (Paginator Structure):', requests);
    console.log('Filters Data:', filters);
    console.log('----------------------------');

    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        {/* Pass the props down to the table */}
                        <AssistanceRequestTable data={requests} filters={filters} />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
