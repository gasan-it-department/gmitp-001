import AppLayout from '@/layouts/App/AppLayout';

// Mock Data for the decedent
const mockDecedent = {
    id: 'DEC-80924',
    firstName: 'Pedro',
    lastName: 'Dela Cruz',
    dateOfBirth: '1945-08-15',
    dateOfDeath: '2023-11-02',
    ageAtDeath: 78,
    epitaph: '"In loving memory of a devoted husband, father, and friend. Always in our hearts."',
    plotDetails: {
        section: 'St. Peter Section',
        block: 'Block 4',
        lot: 'Lot 12',
        type: 'Lawn Lot',
        intermentDate: '2023-11-07',
        coordinates: {
            lat: 13.2205,
            lng: 121.8433,
        },
    },
    relatives: [{ name: 'Maria Dela Cruz', relation: 'Spouse', contact: '+63 917 123 4567' }],
};

const DecedentProfile = () => {
    const { firstName, lastName, dateOfBirth, dateOfDeath, ageAtDeath, epitaph, plotDetails, relatives } = mockDecedent;

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl p-6">
                {/* Header Section */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                    <h1 className="mb-2 text-3xl font-bold text-gray-800">
                        {lastName}, {firstName}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {dateOfBirth} — {dateOfDeath} (Age {ageAtDeath})
                    </p>
                    <div className="mt-4 border-l-4 border-gray-300 pl-4 text-gray-500 italic">{epitaph}</div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Plot Location Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                        <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Plot Location</h2>
                        <ul className="space-y-3 text-gray-700">
                            <li>
                                <span className="font-medium">Section:</span> {plotDetails.section}
                            </li>
                            <li>
                                <span className="font-medium">Block:</span> {plotDetails.block}
                            </li>
                            <li>
                                <span className="font-medium">Lot:</span> {plotDetails.lot}
                            </li>
                            <li>
                                <span className="font-medium">Type:</span> {plotDetails.type}
                            </li>
                            <li>
                                <span className="font-medium">Interment Date:</span> {plotDetails.intermentDate}
                            </li>
                        </ul>

                        {/* Geolocation Section */}
                        <div className="mt-6 rounded-md border border-gray-100 bg-gray-50 p-4">
                            <h3 className="mb-2 text-sm font-semibold tracking-wider text-gray-600 uppercase">Geolocation</h3>
                            <p className="font-mono text-sm text-gray-800">
                                Lat: {plotDetails.coordinates.lat} <br />
                                Lng: {plotDetails.coordinates.lng}
                            </p>
                            {/* Placeholder for future map integration */}
                            <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">View on Map &rarr;</button>
                        </div>
                    </div>

                    {/* Administrative/Family Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                        <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Record Details</h2>
                        <ul className="space-y-3 text-gray-700">
                            <li>
                                <span className="font-medium">Record ID:</span> {mockDecedent.id}
                            </li>
                        </ul>

                        <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-800">Primary Contact</h3>
                        {relatives.map((relative, index) => (
                            <div key={index} className="mb-2 rounded-md border border-gray-100 bg-gray-50 p-3">
                                <p className="font-medium text-gray-800">{relative.name}</p>
                                <p className="text-sm text-gray-600">{relative.relation}</p>
                                <p className="mt-1 text-sm text-gray-600">{relative.contact}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
export default DecedentProfile;
