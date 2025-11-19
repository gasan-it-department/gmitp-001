import SAdminLayout from '@/layouts/App/AppLayout';

export default function SuperAdminDashboard() {
    return (
        <SAdminLayout>
            <div className="flex h-full items-center justify-center">
                <div>
                    <h1 className="text-4xl font-bold">Under Development</h1>
                    <p className="text-center text-red-500">Ask the I.T Department for more information.</p>
                </div>
            </div>
        </SAdminLayout>
    );
}
