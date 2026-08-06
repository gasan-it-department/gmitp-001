import { PermissionCatalog, PermissionModule } from '@/Core/Types/User/UserTypes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Building2, ClipboardList, FileText, Landmark, MapPin, Megaphone, MessageSquare, Settings, ShieldAlert, Ticket, Users } from 'lucide-react';
import { ElementType } from 'react';

const MODULE_STYLES: Record<string, { icon: ElementType; accent: string }> = {
    action_center: { icon: ShieldAlert, accent: 'text-red-600 bg-red-50 border-red-100' },
    bulletin_board: { icon: Megaphone, accent: 'text-orange-600 bg-orange-50 border-orange-100' },
    cemetery: { icon: Building2, accent: 'text-stone-700 bg-stone-50 border-stone-200' },
    community_report: { icon: ClipboardList, accent: 'text-amber-600 bg-amber-50 border-amber-100' },
    department: { icon: Landmark, accent: 'text-cyan-700 bg-cyan-50 border-cyan-100' },
    feedback: { icon: MessageSquare, accent: 'text-violet-600 bg-violet-50 border-violet-100' },
    government: { icon: Landmark, accent: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
    municipality_settings: { icon: Settings, accent: 'text-slate-700 bg-slate-50 border-slate-200' },
    public_information: { icon: FileText, accent: 'text-sky-700 bg-sky-50 border-sky-100' },
    support_ticket: { icon: Ticket, accent: 'text-rose-600 bg-rose-50 border-rose-100' },
    tourism: { icon: MapPin, accent: 'text-teal-700 bg-teal-50 border-teal-100' },
    users: { icon: Users, accent: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
    wedding: { icon: FileText, accent: 'text-pink-700 bg-pink-50 border-pink-100' },
};

interface Props {
    permissionCatalog: PermissionCatalog;
    selectedValues: string[];
    onChange: (values: string[]) => void;
}

const getAccessPermission = (module: PermissionModule) => module.permissions.find((permission) => permission.is_access);

const uniqueValues = (values: string[]) => Array.from(new Set(values));

export const PermissionSelector = ({ permissionCatalog, selectedValues, onChange }: Props) => {
    const selectedSet = new Set(selectedValues);
    const selectedModuleCount = permissionCatalog.modules.filter((module) => {
        const accessPermission = getAccessPermission(module);

        return accessPermission ? selectedSet.has(accessPermission.value) : false;
    }).length;

    const selectModule = (module: PermissionModule, enabled: boolean) => {
        const accessPermission = getAccessPermission(module);

        if (!accessPermission) {
            return;
        }

        if (enabled) {
            onChange(uniqueValues([...selectedValues, accessPermission.value]));
            return;
        }

        const modulePermissionValues = module.permissions.map((permission) => permission.value);
        onChange(selectedValues.filter((value) => !modulePermissionValues.includes(value)));
    };

    const removePermissionAndDependents = (module: PermissionModule, permissionValue: string) => {
        const valuesToRemove = new Set([permissionValue]);

        let changed = true;
        while (changed) {
            changed = false;

            module.permissions.forEach((permission) => {
                if (permission.dependencies.some((dependency) => valuesToRemove.has(dependency)) && !valuesToRemove.has(permission.value)) {
                    valuesToRemove.add(permission.value);
                    changed = true;
                }
            });
        }

        onChange(selectedValues.filter((value) => !valuesToRemove.has(value)));
    };

    const togglePermission = (module: PermissionModule, permissionValue: string, enabled: boolean) => {
        const accessPermission = getAccessPermission(module);

        if (!accessPermission) {
            return;
        }

        if (permissionValue === accessPermission.value) {
            selectModule(module, enabled);
            return;
        }

        if (enabled) {
            const selectedPermission = module.permissions.find((permission) => permission.value === permissionValue);
            onChange(uniqueValues([...selectedValues, accessPermission.value, ...(selectedPermission?.dependencies ?? []), permissionValue]));
            return;
        }

        removePermissionAndDependents(module, permissionValue);
    };

    return (
        <div>
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                Module Access & Permissions
            </h4>
            <p className="mb-6 ml-8 text-sm text-gray-500">Grant module access first, then choose any detailed permissions for that module.</p>

            <Accordion type="multiple" className="space-y-3">
                {permissionCatalog.modules.map((module) => {
                    const accessPermission = getAccessPermission(module);
                    const isModuleEnabled = accessPermission ? selectedSet.has(accessPermission.value) : false;
                    const childPermissions = module.permissions.filter((permission) => !permission.is_access);
                    const selectedChildrenCount = childPermissions.filter((permission) => selectedSet.has(permission.value)).length;
                    const style = MODULE_STYLES[module.value] ?? MODULE_STYLES.department;
                    const Icon = style.icon;

                    return (
                        <AccordionItem key={module.value} value={module.value} className="rounded-lg border bg-white px-4">
                            <div className="flex items-center gap-4 py-4">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${style.accent}`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <AccordionTrigger className="min-w-0 flex-1 py-0 text-left hover:no-underline">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-gray-900">{module.label}</span>
                                            {childPermissions.length > 0 && (
                                                <Badge variant="secondary" className="font-normal">
                                                    {selectedChildrenCount}/{childPermissions.length} details
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {isModuleEnabled ? 'Module access granted' : 'Module access not granted'}
                                        </p>
                                    </div>
                                </AccordionTrigger>

                                {accessPermission && (
                                    <Switch
                                        checked={isModuleEnabled}
                                        onCheckedChange={(checked) => selectModule(module, checked)}
                                        aria-label={`Toggle ${module.label} access`}
                                    />
                                )}
                            </div>

                            {childPermissions.length > 0 && (
                                <AccordionContent className="border-t pt-3 pb-4">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {childPermissions.map((permission) => {
                                            const isChecked = selectedSet.has(permission.value);

                                            return (
                                                <label
                                                    key={permission.value}
                                                    className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => togglePermission(module, permission.value, checked === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-medium text-gray-800">{permission.label}</span>
                                                        <span className="block text-xs break-all text-gray-500">{permission.value}</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            )}
                        </AccordionItem>
                    );
                })}
            </Accordion>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                    <span className="font-bold">{selectedModuleCount}</span> modules selected,{' '}
                    <span className="font-bold">{selectedValues.length}</span> total permissions granted.
                </p>
            </div>
        </div>
    );
};
