import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import Utility from '@/pages/Utility/Utility';
import * as XLSX from 'xlsx';

export function ToExcel(requests: AssistanceRequest[], fileName?: string) {
    if (!requests || requests.length === 0) {
        console.warn('No data to export');
        return;
    }

    // 🧠 Format data for Excel
    const formattedData = requests.map((req, index) => ({
        No: index + 1,
        Name: `${req.beneficiary.first_name} ${req.beneficiary.last_name}`,
        'Request Date': Utility().formatToReadableDate(req.created_at),
        'Assistance Type': req.assistance_type || '',
        'Transaction Number': req.transaction_number || '',
        Status:
            {
                pending: 'Pending',
                in_review: 'In Review',
                approved: 'Approved',
                rejected: 'Rejected',
                completed: 'Completed',
            }[req.status] || 'Unknown',
        'Due Date': Utility().formatAndAddDays(req.created_at, 90),
    }));

    // 🧾 Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assistance Requests');

    // 💾 File name with fallback
    const exportFileName = fileName || `Assistance_Requests_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, exportFileName);
}
