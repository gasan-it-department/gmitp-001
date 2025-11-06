import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { useNavigation } from '@/config/navigation/navigationItems';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

// type ListItemProps = {
//     title: string;
//     href: string;
//     children: React.ReactNode;
// };

// function ListItem({ title, href, children }: ListItemProps) {
//     return (
//         <li>
//             <NavigationMenuLink asChild>
//                 <Link href={href} className="block rounded p-3 hover:bg-muted">
//                     <div className="font-semibold">{title}</div>
//                     <div className="text-sm text-gray-500">{children}</div>
//                 </Link>
//             </NavigationMenuLink>
//         </li>
//     );
// }

export function HeaderNav() {
    const page = usePage();
    const navItems = useNavigation();
    const { auth } = usePage<SharedData>().props;

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

                {/* <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {components.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem> */}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
