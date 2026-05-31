import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DepartmentListItem } from '@/Core/Types/Department/department';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
    departments: { data: DepartmentListItem[] };
}

export default function DepartmentIndex({ departments }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const list = departments?.data ?? [];

    const handleToggle = (dept: DepartmentListItem) => {
        setTogglingId(dept.id);

        router.patch(
            `/api/department/toggle-status/${dept.id}`,
            {},
            {
                headers: { 'X-Municipality-Slug': slug },
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Departments" />

            <div className="m-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground">Manage the LGU's offices and their profiles.</p>
                    </div>

                    <Link href={`/${slug}/department/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                                        No departments yet. Click "Add Department" to create one.
                                    </TableCell>
                                </TableRow>
                            )}

                            {list.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell className="font-mono text-xs font-semibold">{dept.code}</TableCell>
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell>
                                        {dept.is_active ? (
                                            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/${slug}/department/show/${dept.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/${slug}/department/edit/${dept.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant={dept.is_active ? 'outline' : 'default'}
                                                onClick={() => handleToggle(dept)}
                                                disabled={togglingId === dept.id}
                                            >
                                                {dept.is_active ? (
                                                    <>
                                                        <PowerOff className="mr-1 h-4 w-4" /> Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="mr-1 h-4 w-4" /> Activate
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
