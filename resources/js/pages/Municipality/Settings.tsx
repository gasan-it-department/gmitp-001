import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type EnumOption = { value: string; label: string };

interface BannerImage {
    id: number | string;
    name: string;
    url: string;
}

interface SettingsPayload {
    id: string;
    name: string;
    slug: string;
    settings: {
        primary_color_hex: string | null;
        contact_email: string | null;
        trunkline_phone: string | null;
        office_hours: string | null;
        facebook_url: string | null;
    };
    logo_url: string | null;
    banner_urls: BannerImage[];
}

interface Hotline {
    id: string;
    name: string;
    number: string;
    category: EnumOption;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    settings: SettingsPayload;
    hotlines: Hotline[];
    hotline_categories: EnumOption[];
}

interface SettingsFormShape {
    primary_color_hex: string;
    contact_email: string;
    trunkline_phone: string;
    office_hours: string;
    facebook_url: string;
    logo: File | null;
    banners: File[];
    remove_banner_ids: string[];
    _method: 'PUT';
    [key: string]: string | File | File[] | string[] | null | undefined;
}

interface HotlineFormShape {
    name: string;
    number: string;
    category: string;
    is_active: boolean;
    sort_order: number;
    _method?: 'PUT';
    [key: string]: string | number | boolean | undefined;
}

export default function MunicipalitySettings({ settings, hotlines, hotline_categories }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    // ------------------------------------------------------------------
    // Settings form (logo + banners + text fields)
    // ------------------------------------------------------------------
    const settingsForm = useForm<SettingsFormShape>({
        primary_color_hex: settings.settings.primary_color_hex ?? '',
        contact_email: settings.settings.contact_email ?? '',
        trunkline_phone: settings.settings.trunkline_phone ?? '',
        office_hours: settings.settings.office_hours ?? '',
        facebook_url: settings.settings.facebook_url ?? '',
        logo: null,
        banners: [],
        remove_banner_ids: [],
        _method: 'PUT',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [pendingBannerPreviews, setPendingBannerPreviews] = useState<{ key: string; url: string; file: File }[]>([]);
    const [pendingRemovedBannerIds, setPendingRemovedBannerIds] = useState<Set<string>>(new Set());

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        settingsForm.setData('logo', file);
        setLogoPreview(URL.createObjectURL(file));
        settingsForm.clearErrors('logo');
        e.target.value = '';
    };

    const removeStagedLogo = () => {
        settingsForm.setData('logo', null);
        setLogoPreview(null);
    };

    const handleBannerAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const additions = files.map((file) => ({
            key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            file,
        }));

        setPendingBannerPreviews((prev) => [...prev, ...additions]);
        settingsForm.setData('banners', [...settingsForm.data.banners, ...files]);
        settingsForm.clearErrors('banners');
        e.target.value = '';
    };

    const removeStagedBanner = (key: string) => {
        const target = pendingBannerPreviews.find((p) => p.key === key);
        if (!target) return;

        setPendingBannerPreviews((prev) => prev.filter((p) => p.key !== key));
        settingsForm.setData(
            'banners',
            settingsForm.data.banners.filter((f) => f !== target.file),
        );
    };

    const toggleExistingBannerRemoval = (bannerId: string) => {
        const next = new Set(pendingRemovedBannerIds);
        if (next.has(bannerId)) {
            next.delete(bannerId);
        } else {
            next.add(bannerId);
        }
        setPendingRemovedBannerIds(next);
        settingsForm.setData('remove_banner_ids', Array.from(next));
    };

    const submitSettings = (e: FormEvent) => {
        e.preventDefault();
        settingsForm.post('/api/municipality/settings', {
            headers: { 'X-Municipality-Slug': slug },
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                settingsForm.setData('logo', null);
                settingsForm.setData('banners', []);
                settingsForm.setData('remove_banner_ids', []);
                setLogoPreview(null);
                setPendingBannerPreviews([]);
                setPendingRemovedBannerIds(new Set());
            },
        });
    };

    // ------------------------------------------------------------------
    // Hotlines — inline new-row form + per-row edit/delete
    // ------------------------------------------------------------------
    const defaultCategoryValue = hotline_categories[0]?.value ?? 'other';

    const newHotlineForm = useForm<HotlineFormShape>({
        name: '',
        number: '',
        category: defaultCategoryValue,
        is_active: true,
        sort_order: 0,
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const editHotlineForm = useForm<HotlineFormShape>({
        name: '',
        number: '',
        category: defaultCategoryValue,
        is_active: true,
        sort_order: 0,
        _method: 'PUT',
    });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const submitNewHotline = (e: FormEvent) => {
        e.preventDefault();
        newHotlineForm.post('/api/municipality/hotlines', {
            headers: { 'X-Municipality-Slug': slug },
            preserveScroll: true,
            onSuccess: () => {
                newHotlineForm.reset();
                newHotlineForm.setData('category', defaultCategoryValue);
                newHotlineForm.setData('is_active', true);
            },
        });
    };

    const beginEdit = (hotline: Hotline) => {
        editHotlineForm.clearErrors();
        editHotlineForm.setData('name', hotline.name);
        editHotlineForm.setData('number', hotline.number);
        editHotlineForm.setData('category', hotline.category.value);
        editHotlineForm.setData('is_active', hotline.is_active);
        editHotlineForm.setData('sort_order', hotline.sort_order);
        setEditingId(hotline.id);
    };

    const cancelEdit = () => {
        setEditingId(null);
        editHotlineForm.clearErrors();
    };

    const submitEdit = (e: FormEvent, hotlineId: string) => {
        e.preventDefault();
        editHotlineForm.post(`/api/municipality/hotlines/${hotlineId}`, {
            headers: { 'X-Municipality-Slug': slug },
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (hotlineId: string) => {
        if (!confirm('Delete this hotline? This action cannot be undone.')) return;
        setDeletingId(hotlineId);
        router.delete(`/api/municipality/hotlines/${hotlineId}`, {
            headers: { 'X-Municipality-Slug': slug },
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    // ------------------------------------------------------------------

    const existingBanners = settings.banner_urls;
    const hasLogo = Boolean(settings.logo_url) || Boolean(logoPreview);

    return (
        <AppLayout>
            <Head title="Municipality Settings" />

            <div className="m-6 max-w-5xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Municipality Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your municipality's branding, contact info, and emergency hotlines.
                    </p>
                </div>

                {/* Branding & contact ------------------------------------------------- */}
                <form onSubmit={submitSettings} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logo</CardTitle>
                            <CardDescription>Displayed in the site header and on public landing pages.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg border bg-slate-50">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="logo preview" className="h-full w-full object-cover" />
                                    ) : settings.logo_url ? (
                                        <img src={settings.logo_url} alt="current logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                            No logo
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                        <label htmlFor="logo-upload">
                                            <Button type="button" variant="outline" asChild>
                                                <span>
                                                    <ImagePlus className="mr-2 h-4 w-4" />
                                                    {hasLogo ? 'Change Logo' : 'Upload Logo'}
                                                </span>
                                            </Button>
                                        </label>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                        {logoPreview && (
                                            <Button type="button" variant="ghost" size="sm" onClick={removeStagedLogo}>
                                                <X className="mr-1 h-4 w-4" /> Cancel
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Max 10MB.</p>
                                    {settingsForm.errors.logo && (
                                        <p className="text-sm text-destructive">{settingsForm.errors.logo}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Banners</CardTitle>
                            <CardDescription>Hero images shown on the public landing page carousel. Up to 10.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {existingBanners.length === 0 && pendingBannerPreviews.length === 0 && (
                                <p className="text-sm text-muted-foreground">No banners uploaded yet.</p>
                            )}

                            {existingBanners.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">Current banners</p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {existingBanners.map((banner) => {
                                            const willRemove = pendingRemovedBannerIds.has(String(banner.id));
                                            return (
                                                <div key={banner.id} className="relative overflow-hidden rounded-lg border bg-slate-50">
                                                    <img
                                                        src={banner.url}
                                                        alt={banner.name}
                                                        className={`h-28 w-full object-cover transition-opacity ${
                                                            willRemove ? 'opacity-30' : ''
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExistingBannerRemoval(String(banner.id))}
                                                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                                                        aria-label={willRemove ? 'Keep banner' : 'Remove banner'}
                                                    >
                                                        {willRemove ? <Plus className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                    </button>
                                                    {willRemove && (
                                                        <span className="absolute bottom-1 left-1 rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
                                                            Will remove
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {pendingBannerPreviews.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">New banners to upload</p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {pendingBannerPreviews.map((p) => (
                                            <div key={p.key} className="relative overflow-hidden rounded-lg border bg-slate-50">
                                                <img src={p.url} alt="pending banner" className="h-28 w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeStagedBanner(p.key)}
                                                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                                                    aria-label="Cancel upload"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="banner-upload">
                                    <Button type="button" variant="outline" asChild>
                                        <span>
                                            <ImagePlus className="mr-2 h-4 w-4" /> Add Banners
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="banner-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={handleBannerAdd}
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    JPEG, PNG, or WebP. Max 10MB each. Up to 10 banners per save.
                                </p>
                                {settingsForm.errors.banners && (
                                    <p className="mt-1 text-sm text-destructive">{settingsForm.errors.banners}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact & branding</CardTitle>
                            <CardDescription>Public contact details and theme color for the citizen-facing site.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="primary_color_hex">Primary color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="primary_color_hex"
                                            value={settingsForm.data.primary_color_hex}
                                            onChange={(e) => {
                                                settingsForm.setData('primary_color_hex', e.target.value);
                                                settingsForm.clearErrors('primary_color_hex');
                                            }}
                                            placeholder="#1A2B3C"
                                            maxLength={9}
                                        />
                                        {settingsForm.data.primary_color_hex && (
                                            <span
                                                className="inline-block h-9 w-9 shrink-0 rounded-md border"
                                                style={{
                                                    backgroundColor: settingsForm.data.primary_color_hex.startsWith('#')
                                                        ? settingsForm.data.primary_color_hex
                                                        : `#${settingsForm.data.primary_color_hex}`,
                                                }}
                                            />
                                        )}
                                    </div>
                                    {settingsForm.errors.primary_color_hex && (
                                        <p className="mt-1 text-sm text-destructive">{settingsForm.errors.primary_color_hex}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="contact_email">Contact email</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={settingsForm.data.contact_email}
                                        onChange={(e) => {
                                            settingsForm.setData('contact_email', e.target.value);
                                            settingsForm.clearErrors('contact_email');
                                        }}
                                        placeholder="mayor@municipality.gov.ph"
                                        maxLength={255}
                                    />
                                    {settingsForm.errors.contact_email && (
                                        <p className="mt-1 text-sm text-destructive">{settingsForm.errors.contact_email}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="trunkline_phone">Trunkline phone</Label>
                                    <Input
                                        id="trunkline_phone"
                                        value={settingsForm.data.trunkline_phone}
                                        onChange={(e) => {
                                            settingsForm.setData('trunkline_phone', e.target.value);
                                            settingsForm.clearErrors('trunkline_phone');
                                        }}
                                        placeholder="(02) 8000-0000"
                                        maxLength={255}
                                    />
                                    {settingsForm.errors.trunkline_phone && (
                                        <p className="mt-1 text-sm text-destructive">{settingsForm.errors.trunkline_phone}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="office_hours">Office hours</Label>
                                    <Input
                                        id="office_hours"
                                        value={settingsForm.data.office_hours}
                                        onChange={(e) => {
                                            settingsForm.setData('office_hours', e.target.value);
                                            settingsForm.clearErrors('office_hours');
                                        }}
                                        placeholder="Mon–Fri, 8:00 AM – 5:00 PM"
                                        maxLength={255}
                                    />
                                    {settingsForm.errors.office_hours && (
                                        <p className="mt-1 text-sm text-destructive">{settingsForm.errors.office_hours}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="facebook_url">Facebook page URL</Label>
                                    <Input
                                        id="facebook_url"
                                        type="url"
                                        value={settingsForm.data.facebook_url}
                                        onChange={(e) => {
                                            settingsForm.setData('facebook_url', e.target.value);
                                            settingsForm.clearErrors('facebook_url');
                                        }}
                                        placeholder="https://facebook.com/yourmunicipality"
                                        maxLength={255}
                                    />
                                    {settingsForm.errors.facebook_url && (
                                        <p className="mt-1 text-sm text-destructive">{settingsForm.errors.facebook_url}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        {settingsForm.progress && (
                            <div className="flex flex-1 items-center">
                                <div className="h-1 w-full overflow-hidden rounded bg-slate-200">
                                    <div
                                        className="h-full bg-blue-500 transition-all"
                                        style={{ width: `${settingsForm.progress.percentage ?? 0}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <Button type="submit" disabled={settingsForm.processing}>
                            {settingsForm.processing ? 'Saving…' : 'Save Settings'}
                        </Button>
                    </div>
                </form>

                {/* Hotlines ----------------------------------------------------------- */}
                <Card>
                    <CardHeader>
                        <CardTitle>Emergency hotlines</CardTitle>
                        <CardDescription>Numbers shown on the public Settings/Contact page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add new */}
                        <form onSubmit={submitNewHotline} className="rounded-lg border bg-slate-50/50 p-4">
                            <p className="mb-3 text-sm font-medium">Add a hotline</p>
                            <div className="grid gap-3 sm:grid-cols-12">
                                <div className="sm:col-span-3">
                                    <Label htmlFor="new-name">Name</Label>
                                    <Input
                                        id="new-name"
                                        value={newHotlineForm.data.name}
                                        onChange={(e) => {
                                            newHotlineForm.setData('name', e.target.value);
                                            newHotlineForm.clearErrors('name');
                                        }}
                                        placeholder="e.g., District Hospital"
                                    />
                                    {newHotlineForm.errors.name && (
                                        <p className="mt-1 text-xs text-destructive">{newHotlineForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-3">
                                    <Label htmlFor="new-number">Number</Label>
                                    <Input
                                        id="new-number"
                                        value={newHotlineForm.data.number}
                                        onChange={(e) => {
                                            newHotlineForm.setData('number', e.target.value);
                                            newHotlineForm.clearErrors('number');
                                        }}
                                        placeholder="e.g., 911"
                                    />
                                    {newHotlineForm.errors.number && (
                                        <p className="mt-1 text-xs text-destructive">{newHotlineForm.errors.number}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="new-category">Category</Label>
                                    <select
                                        id="new-category"
                                        value={newHotlineForm.data.category}
                                        onChange={(e) => {
                                            newHotlineForm.setData('category', e.target.value);
                                            newHotlineForm.clearErrors('category');
                                        }}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        {hotline_categories.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    {newHotlineForm.errors.category && (
                                        <p className="mt-1 text-xs text-destructive">{newHotlineForm.errors.category}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-1">
                                    <Label htmlFor="new-sort">Sort</Label>
                                    <Input
                                        id="new-sort"
                                        type="number"
                                        min={0}
                                        value={newHotlineForm.data.sort_order}
                                        onChange={(e) => {
                                            newHotlineForm.setData('sort_order', Number(e.target.value));
                                            newHotlineForm.clearErrors('sort_order');
                                        }}
                                    />
                                </div>
                                <div className="flex items-end sm:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="new-active"
                                            checked={newHotlineForm.data.is_active}
                                            onCheckedChange={(checked) => newHotlineForm.setData('is_active', checked)}
                                        />
                                        <Label htmlFor="new-active" className="text-sm font-normal">
                                            Active
                                        </Label>
                                    </div>
                                </div>
                                <div className="flex items-end sm:col-span-1">
                                    <Button type="submit" disabled={newHotlineForm.processing} className="w-full">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* List */}
                        <div className="rounded-lg border bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Number</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-20">Sort</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hotlines.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                                No hotlines yet. Use the form above to add one.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {hotlines.map((hotline) =>
                                        editingId === hotline.id ? (
                                            <TableRow key={hotline.id} className="bg-slate-50">
                                                <TableCell colSpan={6}>
                                                    <form onSubmit={(e) => submitEdit(e, hotline.id)} className="grid gap-3 sm:grid-cols-12">
                                                        <div className="sm:col-span-3">
                                                            <Input
                                                                value={editHotlineForm.data.name}
                                                                onChange={(e) => {
                                                                    editHotlineForm.setData('name', e.target.value);
                                                                    editHotlineForm.clearErrors('name');
                                                                }}
                                                                placeholder="Name"
                                                            />
                                                            {editHotlineForm.errors.name && (
                                                                <p className="mt-1 text-xs text-destructive">{editHotlineForm.errors.name}</p>
                                                            )}
                                                        </div>
                                                        <div className="sm:col-span-3">
                                                            <Input
                                                                value={editHotlineForm.data.number}
                                                                onChange={(e) => {
                                                                    editHotlineForm.setData('number', e.target.value);
                                                                    editHotlineForm.clearErrors('number');
                                                                }}
                                                                placeholder="Number"
                                                            />
                                                            {editHotlineForm.errors.number && (
                                                                <p className="mt-1 text-xs text-destructive">{editHotlineForm.errors.number}</p>
                                                            )}
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <select
                                                                value={editHotlineForm.data.category}
                                                                onChange={(e) => editHotlineForm.setData('category', e.target.value)}
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                            >
                                                                {hotline_categories.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="sm:col-span-1">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={editHotlineForm.data.sort_order}
                                                                onChange={(e) =>
                                                                    editHotlineForm.setData('sort_order', Number(e.target.value))
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex items-center sm:col-span-1">
                                                            <Switch
                                                                checked={editHotlineForm.data.is_active}
                                                                onCheckedChange={(checked) => editHotlineForm.setData('is_active', checked)}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1 sm:col-span-2">
                                                            <Button type="submit" size="sm" disabled={editHotlineForm.processing}>
                                                                Save
                                                            </Button>
                                                            <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <TableRow key={hotline.id}>
                                                <TableCell className="font-medium">{hotline.name}</TableCell>
                                                <TableCell className="font-mono text-sm">{hotline.number}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                                                        {hotline.category.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {hotline.is_active ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">{hotline.sort_order}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => beginEdit(hotline)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(hotline.id)}
                                                            disabled={deletingId === hotline.id}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
