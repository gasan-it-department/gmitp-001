import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/App/AppLayout';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ExternalLink, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';

const getTodayLabel = () =>
    new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());

export default function AdminDashboard() {
    const { auth, currentMunicipality } = usePage<SharedData>().props;
    const user = auth.user;
    const municipalityName = currentMunicipality?.name ?? 'Municipality';
    const municipalitySlug = currentMunicipality?.slug ?? '';
    const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Admin';
    const logoUrl = currentMunicipality?.settings?.logo_url || '/assets/harvs_logo.png';

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />

            <main className="min-h-screen bg-background">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
                            <div className="relative p-6 sm:p-8">
                                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-bold tracking-widest text-primary uppercase">
                                        <LayoutDashboard className="h-4 w-4" />
                                        Admin Console
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">{getTodayLabel()}</p>
                                </div>

                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                                        <img src={logoUrl} alt={`${municipalityName} logo`} className="h-full w-full object-contain p-2" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Welcome back</p>
                                        <h1 className="mt-2 text-3xl leading-tight font-black tracking-tight text-foreground sm:text-4xl">
                                            {displayName}
                                        </h1>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                            You are managing the digital services and public information portal for{' '}
                                            <span className="font-bold text-foreground">{municipalityName}</span>.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button asChild className="h-11 rounded-lg font-bold">
                                        <Link href={`/${municipalitySlug}/home`}>
                                            Open Public Site
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    {/* <Button asChild variant="outline" className="h-11 rounded-lg font-bold">
                                        <Link href={`/${municipalitySlug}/admin/municipality/settings`}>Manage Site Settings</Link>
                                    </Button> */}
                                </div>
                            </div>

                            <aside className="border-t border-border bg-muted/30 p-6 sm:p-8 lg:border-t-0 lg:border-l">
                                <div className="flex h-full flex-col justify-between gap-8">
                                    <div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <h2 className="mt-5 text-xl font-black text-foreground">Municipal Operations</h2>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            Keep the portal updated, readable, and ready for residents who need services.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-border bg-background p-4">
                                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Account Access</p>
                                        <div className="mt-3 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-2xl font-black text-foreground">{user?.all_permission?.length ?? 0}</p>
                                                <p className="text-xs text-muted-foreground">permissions enabled</p>
                                            </div>
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}
