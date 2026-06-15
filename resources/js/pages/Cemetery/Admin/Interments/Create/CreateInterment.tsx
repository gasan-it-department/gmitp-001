import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link } from '@inertiajs/react';
import { ClipboardCheck, UserPlus } from 'lucide-react';

interface Props {
    municipality: { slug: string };
}

export default function CreateInterment({ municipality }: Props) {
    return (
        <AppLayout>
            <div className="mx-auto max-w-3xl p-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">Start an Interment</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Interment starts from a verified, municipality-owned decedent profile. The registry checks required documents and displays the Assign to Plot action only when the record is ready.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href={cemetery.admin.decedents.list.page.url(municipality.slug)}>
                            <Button><ClipboardCheck size={16} className="mr-2" />Open Decedent Registry</Button>
                        </Link>
                        <Link href={cemetery.admin.decedents.create.page.url(municipality.slug)}>
                            <Button variant="outline"><UserPlus size={16} className="mr-2" />Register Decedent</Button>
                        </Link>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
