import { useState } from 'react';

// 1. Mock Data: Tailored for LGU activities
const mockLguEvents = [
    { id: 1, title: 'Regular Sangguniang Bayan Session', date: '2026-06-05', location: 'Municipal Session Hall', type: 'Meeting' },
    { id: 2, title: 'Barangay Health Workers Training', date: '2026-06-10', location: 'Municipal Gymnasium', type: 'Seminar' },
    { id: 3, title: 'Annual Town Fiesta & Parade', date: '2026-06-24', location: 'Town Plaza', type: 'Public Event' },
    { id: 4, title: "Mayor's Medical Mission", date: '2026-06-28', location: 'Barangay San Isidro', type: 'Outreach' },
    { id: 5, title: 'Disaster Risk Reduction Planning', date: '2026-07-02', location: 'Conference Room A', type: 'Internal' },
];

export default function Event() {
    const [events] = useState(mockLguEvents);

    // 2. The Export Function logic
    const handleExportCSV = () => {
        // Define the CSV headers
        const headers = ['ID', 'Event Title', 'Date', 'Location', 'Category'];

        // Map the event data into comma-separated strings
        const csvRows = [
            headers.join(','),
            ...events.map(
                (event) =>
                    // Wrap strings in quotes to prevent issues with commas in titles or locations
                    `"${event.id}","${event.title}","${event.date}","${event.location}","${event.type}"`,
            ),
        ];

        // Combine rows with line breaks
        const csvString = csvRows.join('\n');

        // Create a downloadable Blob
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Create a hidden link and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LGU_Event_Calendar_2026.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 font-sans shadow-md">
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Municipal Event Calendar</h2>
                    <p className="text-sm text-gray-500">Manage and export upcoming LGU activities.</p>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition duration-150 ease-in-out hover:bg-blue-700"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Export to CSV
                </button>
            </div>

            {/* Events List / Table Mockup */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-gray-50 text-sm tracking-wider text-gray-600 uppercase">
                            <th className="border-b px-4 py-3">Date</th>
                            <th className="border-b px-4 py-3">Event Title</th>
                            <th className="border-b px-4 py-3">Location</th>
                            <th className="border-b px-4 py-3">Category</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {events.map((event) => (
                            <tr key={event.id} className="border-b border-gray-100 transition hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium whitespace-nowrap text-blue-600">
                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 font-semibold">{event.title}</td>
                                <td className="px-4 py-3 text-gray-500">{event.location}</td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        {event.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-4 text-right text-sm text-gray-400">Total events: {events.length}</div>
        </div>
    );
}
