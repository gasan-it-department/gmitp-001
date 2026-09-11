import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/Core/Types/User/UserTypes';
import superAdmin from '@/routes/superAdmin';
import { Link, router, usePage } from '@inertiajs/react';
import { UserRound } from 'lucide-react';

const roles: Record<string, string> = { admin: 'Municipal Admin', super_admin: 'Super Admin', client: 'Citizen' };

export const UsersTable = ({ users, group }: { users: User[]; group: 'administrators' | 'citizens' }) => {
    const { url } = usePage();
    return (
        <Table className="min-w-[640px]">
            <TableHeader className="bg-muted/50">
                <TableRow>
                    {['User', 'Role', 'Municipality', 'Phone'].map((title) => (
                        <TableHead key={title} className="px-5 py-4">
                            {title}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="py-16 text-center">
                            <p className="font-medium">No {group} found</p>
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                        </TableCell>
                    </TableRow>
                )}
                {users.map((user) => {
                    const name = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ') || 'Unnamed user';
                    const initials = ((user.first_name?.charAt(0) ?? '') + (user.last_name?.charAt(0) ?? '')).toUpperCase();
                    const accounts = user.social_accounts ?? [];
                    const avatar =
                        accounts.find((a) => a.provider_name === 'google' && a.avatar_url)?.avatar_url ??
                        accounts.find((a) => a.avatar_url)?.avatar_url;
                    const href = superAdmin.show.user.url(user.id) + '?return_to=' + encodeURIComponent(url);
                    return (
                        <TableRow
                            key={user.id}
                            className="cursor-pointer transition-colors focus-within:bg-orange-50/50 hover:bg-orange-50/50"
                            onClick={(event) => {
                                if ((event.target as HTMLElement).closest('a, button') || window.getSelection()?.toString()) return;
                                if (event.ctrlKey || event.metaKey) window.open(href, '_blank', 'noopener');
                                else router.visit(href);
                            }}
                        >
                            <TableCell className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-11 border">
                                        <AvatarImage src={avatar} alt="" className="object-cover" />
                                        <AvatarFallback className="bg-orange-100 text-sm font-semibold text-orange-700">
                                            {initials || <UserRound className="size-5" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Link
                                        href={href}
                                        className="rounded font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                                    >
                                        {name}
                                    </Link>
                                </div>
                            </TableCell>
                            <TableCell className="px-5">
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role) => (
                                        <span key={role} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                            {roles[role] ?? role}
                                        </span>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="px-5 text-muted-foreground">{user.municipality?.name || 'Unassigned'}</TableCell>
                            <TableCell className="px-5 text-muted-foreground">{user.phone || '—'}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
