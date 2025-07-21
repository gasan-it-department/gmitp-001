import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useNavigation } from '@/hooks/navigation';
import { Link, usePage } from '@inertiajs/react';

export function HeaderNav() {
    const page = usePage();

    const navItems = useNavigation();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {navItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                        {item.children ? (
                            <>
                                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                                <NavigationMenuContent className="p-2">
                                    {item.children.map((child) => (
                                        <NavigationMenuLink key={child.href} asChild className="block rounded px-4 py-2 hover:bg-muted">
                                            <Link href={child.href}>{child.label}</Link>
                                        </NavigationMenuLink>
                                    ))}
                                </NavigationMenuContent>
                            </>
                        ) : (
                            <NavigationMenuLink asChild>
                                <Link href={item.href} className="rounded px-4 py-2 hover:bg-muted">
                                    {item.title}
                                </Link>
                            </NavigationMenuLink>
                        )}
                        {page.url === item.href && (
                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                        )}{' '}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
