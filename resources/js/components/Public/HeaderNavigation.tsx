import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { NavigationItem, useNavigation } from '@/layouts/Public/Components/navigationItems';
import { Link, usePage } from '@inertiajs/react';
import { cn } from "@/lib/utils";

type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
};

export function HeaderNav() {
    // 1. Get current URL to check for active state
    const { url } = usePage();
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const navItems = useNavigation();

    // 2. Helper to normalize paths (strip trailing slashes and query params)
    const normalize = (path: string) => path.split('?')[0].replace(/\/$/, "");

    return (
        <NavigationMenu className="flex h-full items-stretch">
            <NavigationMenuList className="flex h-full items-stretch space-x-1">
                {navItems.map((item: NavigationItem) => {
                    // Resolve the target href
                    const href = typeof item.route === 'function' 
                        ? item.route({ municipality: currentMunicipality.slug }).url 
                        : item.route;

                    // --- ACTIVE STATE LOGIC ---
                    const currentPath = normalize(url);
                    const targetPath = normalize(href);
                    
                    // Logic:
                    // - If Home: The paths must match EXACTLY (e.g. "/gasan" === "/gasan")
                    // - Others: The current path just needs to START with the target
                    const isActive = item.id === 'home' 
                        ? currentPath === targetPath
                        : currentPath.startsWith(targetPath);

                    return (
                        <NavigationMenuItem key={item.id} className="relative flex h-full items-center">
                            <NavigationMenuLink asChild>
                                {/* Wrapper must be h-full so the absolute underline sits at the header bottom */}
                                <div className="h-full flex items-center relative px-1">
                                    <Link 
                                        href={href} 
                                        className={cn(
                                            "group flex items-center gap-2 px-4 transition-all duration-300 h-full relative",
                                            isActive 
                                                ? "text-primary font-black" 
                                                : "text-muted-foreground font-bold hover:text-primary"
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon className={cn(
                                                "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                            )} />
                                        )}
                                        
                                        <span className="uppercase tracking-[0.12em] text-[11px] sm:text-xs">
                                            {item.title}
                                        </span>

                                        {/* THE UNDERLINE */}
                                        {isActive && (
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 h-[4px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary),0.5)] z-[100] animate-in fade-in slide-in-from-bottom-2 duration-300" 
                                            />
                                        )}
                                    </Link>
                                </div>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    );
                })}
            </NavigationMenuList>
        </NavigationMenu>
    );
}