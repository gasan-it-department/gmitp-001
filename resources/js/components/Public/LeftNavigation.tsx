import { useNavigation } from '@/layouts/Public/Components/navigationItems';
import { account } from '@/routes/';
import transaction from '@/routes/transaction';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { Activity, HomeIcon, Menu } from 'lucide-react';
import { LogInSignUpForm } from '../LoginSignUpForm';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { cn } from "@/lib/utils"; // Ensure you have this utility

type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
};

export function LeftNavigation() {
    // 1. Get URL for active state checking
    const { url } = usePage();
    const navItems = useNavigation();
    const { auth } = usePage<SharedData>().props;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // 2. Helper to normalize paths (remove trailing slashes & query params)
    const normalize = (path: string) => path.split('?')[0].replace(/\/$/, "");
    const currentPath = normalize(url);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 h-12 w-12 hover:bg-muted/50">
                    <Menu className="h-8 w-8 text-foreground" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="flex h-full w-80 flex-col justify-between bg-background text-foreground shadow-2xl"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                <SheetHeader className="border-b border-border px-5 py-6 bg-muted/10">
                    <h2 className="text-xl font-black uppercase tracking-widest text-primary text-left">Menu</h2>
                </SheetHeader>

                <div className="flex flex-1 flex-col overflow-y-auto py-2">
                    {/* User Info Section */}
                    {auth?.user ? (
                        <div className="px-4 py-4">
                            <Link href={account.url({ municipality: currentMunicipality.slug })}>
                                <div className="flex cursor-pointer items-center rounded-2xl border border-border bg-muted/20 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm">
                                    <Avatar className="h-16 w-16 flex-shrink-0">
                                        <AvatarImage
                                            src={
                                                typeof auth.user?.avatarUrl === 'string'
                                                    ? auth.user.avatarUrl
                                                    : 'https://www.gravatar.com/avatar/?d=mp'
                                            }
                                            alt="User avatar"
                                            className="rounded-full"
                                        />
                                    </Avatar>
                                    <div className="ml-4 min-w-0">
                                        <span className="block truncate text-lg font-bold text-foreground">{auth.user?.first_name}</span>
                                        <span className="text-sm font-medium text-muted-foreground">View Profile</span>
                                    </div>
                                </div>
                            </Link>

                            {/* --- TRANSACTIONS LINK --- */}
                            <div className="mt-6 border-b border-border pb-6">
                                <span className="mb-3 block text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">My Activity</span>
                                <SheetClose asChild>
                                    <a
                                        onClick={() => router.visit(transaction.index.url(currentMunicipality.slug))}
                                        className={cn(
                                            "flex items-center gap-4 rounded-xl p-3 transition-all duration-200 cursor-pointer",
                                            // Active Logic for Transactions
                                            currentPath.includes('transaction')
                                                ? "bg-primary/10 text-primary font-black shadow-sm" 
                                                : "text-muted-foreground font-medium hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Activity size={28} className={currentPath.includes('transaction') ? "text-primary" : ""} />
                                        <span className="text-lg">Transactions</span>
                                    </a>
                                </SheetClose>
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 py-6">
                            <LogInSignUpForm />
                        </div>
                    )}

                    {/* Main Navigation */}
                    <div className="px-4">
                        <span className="mb-3 block text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Services</span>

                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const href =
                                    typeof item.route === 'function' ? item.route({ municipality: currentMunicipality.slug }).url : item.route;

                                // --- ACTIVE STATE LOGIC ---
                                const targetPath = normalize(href);
                                const isActive = item.id === 'home' 
                                    ? currentPath === targetPath
                                    : currentPath.startsWith(targetPath);

                                return (
                                    <SheetClose asChild key={item.title}>
                                        <a
                                            onClick={() => router.visit(href)}
                                            className={cn(
                                                "flex items-center gap-4 rounded-xl p-3 transition-all duration-200 cursor-pointer group",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-black shadow-sm" // Active Style
                                                    : "text-muted-foreground font-medium hover:bg-muted hover:text-foreground" // Default Style
                                            )}
                                        >
                                            {/* Icon Logic: Highlight if active */}
                                            {Icon ? (
                                                <Icon 
                                                    size={26} 
                                                    strokeWidth={isActive ? 2.5 : 2} 
                                                    className={cn("transition-transform group-hover:scale-110", isActive ? "text-primary" : "")} 
                                                />
                                            ) : (
                                                <HomeIcon 
                                                    size={26} 
                                                    className={isActive ? "text-primary" : ""}
                                                />
                                            )}
                                            
                                            <span className="text-lg">{item.title}</span>
                                        </a>
                                    </SheetClose>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {currentMunicipality.name}
                </div>
            </SheetContent>
        </Sheet>
    );
}