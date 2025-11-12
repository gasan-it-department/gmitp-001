import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { NavigationItem, useNavigation } from '@/config/navigation/navigationItems';
import { Link, usePage } from '@inertiajs/react';

type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
};

export function HeaderNav() {
    // Step 1: assert unknown, Step 2: assert your type
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const navItems = useNavigation();

    return (
        <NavigationMenu className="flex h-full items-stretch">
            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {navItems.map((item: NavigationItem) => {
                    const href = typeof item.route === 'function' ? item.route({ municipality: currentMunicipality.slug }).url : item.route;

                    return (
                        <NavigationMenuItem key={item.title} className="relative flex h-full items-center">
                            <NavigationMenuLink asChild>
                                <div>
                                    <Link href={href} className="text-md flex items-center gap-1 rounded font-semibold text-gray-600 hover:bg-muted">
                                        {item.icon && <item.icon />}
                                        {item.title}
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
