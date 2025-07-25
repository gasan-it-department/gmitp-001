import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { useNavigation } from '@/config/navigation/navigationItems';
import { Link, usePage } from '@inertiajs/react';

export function HeaderNav() {
    const page = usePage();

    const navItems = useNavigation();

    return (
        <NavigationMenu className="flex h-full items-stretch">
            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {navItems.map((item) => (
                    <NavigationMenuItem key={item.title} className="relative flex h-full items-center">
                        <NavigationMenuLink asChild>
                            <div>
                                <Link href={item.href} className="text-md flex items-center gap-1 rounded font-semibold text-gray-600 hover:bg-muted">
                                    {item.icon && <item.icon />}
                                    {item.title}
                                </Link>
                            </div>
                        </NavigationMenuLink>
                        {page.url === item.href && (
                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                        )}{' '}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
