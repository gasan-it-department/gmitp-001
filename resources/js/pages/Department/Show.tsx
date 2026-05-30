import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import AppLayout from '@/layouts/App/AppLayout';
import { DepartmentDetail } from '@/Core/Types/Department/department';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Pencil } from 'lucide-react';

interface Props {
    department: DepartmentDetail;
}

export default function DepartmentShow({ department }: Props) {
    const { currentMunicipality } = useMunicipality();
    const slug = currentMunicipality.slug;

    return (
        <AppLayout>
            <Head title={`${department.name} — Department`} />

            <div className="m-6 max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={`/${slug}/department`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Departments
                        </Button>
                    </Link>
                    <Link href={`/${slug}/department/edit/${department.id}`}>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start gap-6">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
                            {department.logo_url ? (
                                <img src={department.logo_url} alt={`${department.name} logo`} className="h-full w-full object-cover" />
                            ) : (
                                <Building2 className="h-10 w-10 text-slate-400" />
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-2xl">{department.name}</CardTitle>
                                {department.is_active ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                        Inactive
                                    </Badge>
                                )}
                            </div>
                            <p className="font-mono text-sm font-semibold text-slate-500">{department.code}</p>
                            {department.created_at && (
                                <p className="text-xs text-muted-foreground">Created {department.created_at}</p>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h2>
                        {department.description ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{department.description}</p>
                        ) : (
                            <p className="text-sm italic text-slate-400">No description provided.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
