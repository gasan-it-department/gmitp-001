import { InventoryShell } from './components';

export default function Unavailable() {
    return (
        <InventoryShell title="Inventory">
            <p role="status" className="border-b border-border py-8 text-sm text-muted-foreground">
                Inventory is not available yet.
            </p>
        </InventoryShell>
    );
}
