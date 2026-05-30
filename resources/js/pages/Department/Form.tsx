import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import AppLayout from '@/layouts/App/AppLayout';
import { DepartmentDetail } from '@/Core/Types/Department/department';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, ImagePlus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    department: DepartmentDetail | null;
}

interface FormShape {
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    logo: File | null;
    _method?: 'PATCH';
    [key: string]: string | boolean | File | null | undefined;
}

export default function DepartmentForm({ department }: Props) {
    const { currentMunicipality } = useMunicipality();
    const slug = currentMunicipality.slug;
    const isEdit = department !== null;

    const initialForm: FormShape = {
        name: department?.name ?? '',
        code: department?.code ?? '',
        description: department?.description ?? '',
        is_active: department?.is_active ?? true,
        logo: null,
    };

    if (isEdit) {
        initialForm._method = 'PATCH';
    }

    const { data, setData, post, processing, errors, clearErrors, progress } = useForm<FormShape>(initialForm);

    const [logoPreview, setLogoPreview] = useState<string | null>(department?.logo_url ?? null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
            clearErrors('logo');
        }
    };

    const handleRemoveLogo = () => {
        setData('logo', null);
        setLogoPreview(department?.logo_url ?? null);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const url = isEdit ? `/api/department/update/${department!.id}` : '/api/department/store';

        post(url, {
            headers: { 'X-Municipality-Slug': slug },
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={isEdit ? `Edit ${department!.name}` : 'New Department'} />

            <div className="m-6 max-w-3xl space-y-6">
                <Link href={`/${slug}/department`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Departments
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? `Edit Department` : 'Create Department'}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Logo upload */}
                            <div>
                                <Label className="mb-2 block">Department Logo</Label>
                                <div className="flex items-start gap-4">
                                    <label
                                        htmlFor="logo-upload"
                                        className="group relative flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-slate-50 hover:bg-slate-100"
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <Building2 className="h-8 w-8" />
                                                <span className="mt-1 text-xs">No logo</span>
                                            </div>
                                        )}
                                    </label>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="logo-upload">
                                            <Button type="button" variant="outline" asChild>
                                                <span>
                                                    <ImagePlus className="mr-2 h-4 w-4" /> Choose Image
                                                </span>
                                            </Button>
                                        </label>
                                        {data.logo && (
                                            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo}>
                                                <X className="mr-1 h-4 w-4" /> Cancel selection
                                            </Button>
                                        )}
                                        <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Max 5MB.</p>
                                    </div>
                                </div>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                                {errors.logo && <p className="mt-1 text-sm text-destructive">{errors.logo}</p>}
                                {progress && (
                                    <div className="mt-2 h-1 w-full overflow-hidden rounded bg-slate-200">
                                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress.percentage ?? 0}%` }} />
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name">
                                    Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData('name', e.target.value);
                                        clearErrors('name');
                                    }}
                                    placeholder="e.g., Municipal Engineering Office"
                                />
                                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                            </div>

                            {/* Code */}
                            <div>
                                <Label htmlFor="code">
                                    Code <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => {
                                        setData('code', e.target.value.toUpperCase());
                                        clearErrors('code');
                                    }}
                                    placeholder="e.g., MEO"
                                    maxLength={20}
                                    className="font-mono uppercase"
                                />
                                {errors.code && <p className="mt-1 text-sm text-destructive">{errors.code}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => {
                                        setData('description', e.target.value);
                                        clearErrors('description');
                                    }}
                                    rows={5}
                                    placeholder="What does this office do?"
                                />
                                {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="is_active" className="text-base">
                                        Active
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Inactive departments are hidden from public-facing dropdowns.</p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href={`/${slug}/department`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Department'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
