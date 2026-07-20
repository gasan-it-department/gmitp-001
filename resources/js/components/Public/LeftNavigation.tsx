import type { UserSocialAccount } from '@/Core/Types/User/user';
import { useNavigation } from '@/layouts/Public/Components/navigationItems';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/admin';
import profile from '@/routes/profile';
import supportTicket from '@/routes/supportTicket';
import transaction from '@/routes/transaction';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Activity, HomeIcon, LayoutDashboard, Menu, MessageCircleQuestion } from 'lucide-react';
import { LogInSignUpForm } from '../LoginSignUpForm';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

type SocialAccountsValue = UserSocialAccount[] | { data?: UserSocialAccount[] };

export function LeftNavigation() {
    const {
        url,
        props: { auth, currentMunicipality },
    } = usePage<SharedData>();
    const navItems = useNavigation();

    const socialAccountsValue = auth.user?.social_accounts as SocialAccountsValue | undefined;
    const socialAccounts = Array.isArray(socialAccountsValue) ? socialAccountsValue : (socialAccountsValue?.data ?? []);
    const socialAccountWithAvatar =
        socialAccounts.find((account) => account.provider_name === 'google' && account.avatar_url) ||
        socialAccounts.find((account) => account.avatar_url);
    const profilePic = socialAccountWithAvatar?.avatar_url;

    const normalize = (path: string) => path.split('?')[0].replace(/\/$/, '');
    const currentPath = normalize(url);
    const isTransactionsActive = currentPath.includes('transaction');
    const adminMunicipalSlug = auth.user?.municipality?.slug;
    const adminDashboardHref = adminMunicipalSlug ? dashboard.url({ municipality: adminMunicipalSlug }) : null;
    const isAdminPanelActive = adminDashboardHref ? currentPath === normalize(adminDashboardHref) : false;
    const supportHref = supportTicket.create.url(currentMunicipality.slug);
    const supportBasePath = normalize(supportHref).replace(/\/create$/, '');
    const isSupportActive = currentPath.startsWith(supportBasePath);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation menu"
                    className="mr-1 h-11 w-11 rounded-xl text-foreground transition-colors hover:bg-muted/70"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="!w-[min(88vw,22rem)] !max-w-none gap-0 border-r border-border/70 bg-background p-0 text-foreground shadow-[16px_0_48px_-24px_rgba(15,23,42,0.35)] [&>button]:top-5 [&>button]:right-5 [&>button]:rounded-lg [&>button]:p-1.5 [&>button]:text-muted-foreground [&>button]:opacity-100 [&>button:hover]:bg-muted [&>button:hover]:text-foreground"
            >
                <SheetHeader className="flex h-20 shrink-0 flex-row items-center border-b border-border/70 bg-background px-5 py-0">
                    <SheetTitle className="text-left text-sm font-bold tracking-[0.18em] text-foreground uppercase">Menu</SheetTitle>
                    <SheetDescription className="sr-only">Navigate municipal services and account pages.</SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col overflow-y-auto">
                    {auth?.user ? (
                        <div className="border-b border-border/70 px-5 py-5">
                            <Link
                                href={profile.show.url({ municipality: currentMunicipality.slug })}
                                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3 transition-colors outline-none hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <Avatar className="h-12 w-12 shrink-0 border border-border/60 bg-background shadow-sm">
                                    <AvatarImage
                                        src={profilePic}
                                        alt="User avatar"
                                        className="rounded-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                    <AvatarFallback className="rounded-full text-sm font-semibold text-muted-foreground uppercase">
                                        {auth.user?.first_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-foreground">{auth.user?.first_name}</span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                                        View Profile
                                    </span>
                                </div>
                            </Link>

                            <div className="mt-6">
                                <span className="mb-2 block px-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                                    My Activity
                                </span>
                                <SheetClose asChild>
                                    <Link
                                        href={transaction.index.url(currentMunicipality.slug)}
                                        className={cn(
                                            'group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                            isTransactionsActive
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                                isTransactionsActive
                                                    ? 'bg-primary-foreground/15 text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground',
                                            )}
                                        >
                                            <Activity size={20} strokeWidth={2} />
                                        </span>
                                        <span>Transactions</span>
                                    </Link>
                                </SheetClose>
                            </div>

                            {auth.roles?.isAdmin && adminDashboardHref && (
                                <div className="mt-6">
                                    <span className="mb-2 block px-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                                        Administration
                                    </span>
                                    <SheetClose asChild>
                                        <Link
                                            href={adminDashboardHref}
                                            className={cn(
                                                'group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                                isAdminPanelActive
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                                    isAdminPanelActive
                                                        ? 'bg-primary-foreground/15 text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground',
                                                )}
                                            >
                                                <LayoutDashboard size={20} strokeWidth={2} />
                                            </span>
                                            <span>Admin Panel</span>
                                        </Link>
                                    </SheetClose>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border-b border-border/70 px-5 py-5">
                            <LogInSignUpForm />
                        </div>
                    )}

                    <div className="px-5 py-6">
                        <span className="mb-2 block px-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                            Services
                        </span>

                        <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const href =
                                    typeof item.route === 'function' ? item.route({ municipality: currentMunicipality.slug }).url : item.route;
                                const targetPath = normalize(href);
                                const isActive = item.id === 'home' ? currentPath === targetPath : currentPath.startsWith(targetPath);

                                return (
                                    <SheetClose asChild key={item.title}>
                                        <Link
                                            href={href}
                                            className={cn(
                                                'group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                                    isActive
                                                        ? 'bg-primary-foreground/15 text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground',
                                                )}
                                            >
                                                {Icon ? <Icon size={20} strokeWidth={isActive ? 2.25 : 2} /> : <HomeIcon size={20} />}
                                            </span>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SheetClose>
                                );
                            })}
                        </nav>
                    </div>

                    {auth?.user && (
                        <div className="border-t border-border/70 px-5 py-6">
                            <span className="mb-2 block px-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                                Support
                            </span>
                            <nav aria-label="Support navigation">
                                <SheetClose asChild>
                                    <Link
                                        href={supportHref}
                                        className={cn(
                                            'group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                            isSupportActive
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                                isSupportActive
                                                    ? 'bg-primary-foreground/15 text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground',
                                            )}
                                        >
                                            <MessageCircleQuestion size={20} strokeWidth={2} />
                                        </span>
                                        <span>Help &amp; Support</span>
                                    </Link>
                                </SheetClose>
                            </nav>
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-border/70 bg-muted/20 px-5 py-4 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    © {new Date().getFullYear()} {currentMunicipality.name}
                </div>
            </SheetContent>
        </Sheet>
    );
}
