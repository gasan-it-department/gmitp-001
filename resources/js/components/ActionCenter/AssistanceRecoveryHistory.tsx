export type RecoveryEvent = {
    approved_amount: string;
    approved_at: string;
    approved_by_name?: string | null;
    cancelled_at: string;
    cancelled_by_name?: string | null;
    reopened_at: string;
    reopened_by_name?: string;
    reason?: string;
};

export default function AssistanceRecoveryHistory({ events = [] }: { events?: RecoveryEvent[] }) {
    if (!events.length) return null;
    return (
        <section aria-label="Request recovery history" className="min-w-0 space-y-3 rounded-md border p-4">
            <h2 className="text-sm font-semibold">Request recovery history</h2>
            {events.map((event, index) => (
                <div key={index} className="space-y-1 border-t pt-3 text-sm [overflow-wrap:anywhere]">
                    <p className="font-medium">Reopened for review{event.reopened_by_name && ` by ${event.reopened_by_name}`}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.reopened_at).toLocaleString()}</p>
                    <p>Previous approved amount: PHP {Number(event.approved_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted-foreground">
                        Approved {new Date(event.approved_at).toLocaleString()} {event.approved_by_name && `by ${event.approved_by_name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Cancelled {new Date(event.cancelled_at).toLocaleString()} {event.cancelled_by_name && `by ${event.cancelled_by_name}`}
                    </p>
                    <p>{event.reason}</p>
                </div>
            ))}
        </section>
    );
}
