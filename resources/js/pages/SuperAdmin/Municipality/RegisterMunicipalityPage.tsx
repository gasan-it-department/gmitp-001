import AppLayout from '@/layouts/App/AppLayout';

export default function MunicipalityRegister() {
    const ADDRESS_URL = 'https://psgc.gitlab.io/api';

    const getMunicipalities = async (provinceCode: string) => {
        // const response = await fetch(`${ADDRESS_URL}/municipalities/${provinceCode}`);
    };
    return (
        <AppLayout>
            <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Add Municipality</h2>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Municipality Name</label>
                        <input
                            type="text"
                            name="name"
                            className="mt-1 w-full rounded-lg border p-2 focus:ring focus:ring-green-300"
                            placeholder="e.g., Bayawan City"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Municipality Code</label>
                        <input
                            type="text"
                            name="code"
                            className="mt-1 w-full rounded-lg border p-2 focus:ring focus:ring-green-300"
                            placeholder="e.g., 746202"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Region</label>
                        <input
                            type="text"
                            name="region"
                            className="mt-1 w-full rounded-lg border p-2 focus:ring focus:ring-green-300"
                            placeholder="e.g., Region VII"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Province</label>
                        <input
                            type="text"
                            name="province"
                            className="mt-1 w-full rounded-lg border p-2 focus:ring focus:ring-green-300"
                            placeholder="e.g., Negros Oriental"
                        />
                    </div>

                    <button type="submit" className="w-full rounded-lg bg-green-600 py-2 text-white transition hover:bg-green-700"></button>
                </form>
            </div>
        </AppLayout>
    );
}
