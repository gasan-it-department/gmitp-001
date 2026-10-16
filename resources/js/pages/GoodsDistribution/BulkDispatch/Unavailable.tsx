import { DirectoryLayout } from '../Inventory/DirectoryLayout';

export default function Unavailable() {
    return <DirectoryLayout title="Bulk Dispatches"><p role="status" className="border-t border-[#dfe6e1] py-8 text-sm text-muted-foreground">Bulk Dispatches will be available after the database update.</p></DirectoryLayout>;
}
