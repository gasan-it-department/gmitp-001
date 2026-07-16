import { PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { History, ShieldAlert } from 'lucide-react';
import { EmptyState, formatDateTime } from '../Helpers';

export function ActivityCard({ plot }: { plot: PlotProfileType }) {
    return (
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <History size={18} className="text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
            </div>
            {plot.audit_timeline.length === 0 ? (
                <EmptyState icon={<ShieldAlert size={20} />} text="No activity has been logged for this plot yet." />
            ) : (
                <div className="space-y-4">
                    {plot.audit_timeline.map((item) => (
                        <div key={item.id} className="border-l-2 border-slate-200 pl-4">
                            <div className="text-sm font-semibold text-slate-900">{item.event ?? item.description}</div>
                            <div className="text-xs text-slate-500">
                                {formatDateTime(item.created_at)} by {item.causer ?? 'System'}
                            </div>
                            {typeof item.properties?.reason === 'string' && <p className="mt-1 text-sm text-slate-600">{item.properties.reason}</p>}
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
}
