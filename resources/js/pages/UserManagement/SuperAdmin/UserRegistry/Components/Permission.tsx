import { Permission } from '@/Core/Types/User/UserTypes';
import { Building2, CheckCircle2, ClipboardList, MapPin, Megaphone, Newspaper, Settings, ShieldAlert, Users } from 'lucide-react';

const MODULE_STYLES: Record<string, { icon: React.ElementType; colorTheme: string }> = {
    'action_center.access': { icon: ShieldAlert, colorTheme: 'red' },
    'bulletin_board.access': { icon: Megaphone, colorTheme: 'orange' },
    'tourism.access': { icon: MapPin, colorTheme: 'teal' },
    'community_report.access': { icon: ClipboardList, colorTheme: 'amber' },
    'municipality_settings.access': { icon: Settings, colorTheme: 'slate' },
    'public_information.access': { icon: Newspaper, colorTheme: 'sky' },
    'users.access': { icon: Users, colorTheme: 'indigo' },
    default: { icon: Building2, colorTheme: 'gray' },
};

const getCardStyles = (value: string, theme: string, isSelected: boolean) => {
    const baseStyles = 'relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group text-left h-full';
    if (isSelected) {
        return `${baseStyles} border-${theme}-500 bg-${theme}-50/50 ring-1 ring-${theme}-500`;
    } else {
        return `${baseStyles} border-gray-200 hover:border-${theme}-300 hover:bg-gray-50`;
    }
};

interface Props {
    allPermissions: Permission[];
    selectedValues: string[];
    onToggle: (values: string) => void;
}

export const PermissionSelector = ({ allPermissions, selectedValues, onToggle }: Props) => {
    return (
        <div>
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                Module Access & Permissions
            </h4>
            <p className="mb-6 ml-8 text-sm text-gray-500">Click to activate the modules this admin can manage.</p>

            {/* THE GRID OF COLORFUL CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {allPermissions.map((option) => {
                    // LOGIC: Check if this specific card's ID exists in the 'selectedValues' array
                    const isSelected = selectedValues.includes(option.value);

                    // LOGIC: Lookup the icon/color, or use default if missing
                    const uiStyle = MODULE_STYLES[option.value] || MODULE_STYLES.default;
                    const Icon = uiStyle.icon;
                    const theme = uiStyle.colorTheme;

                    return (
                        <button
                            type="button" // Important: prevents submitting the form
                            key={option.value}
                            onClick={() => onToggle(option.value)}
                            className={getCardStyles(option.value, theme, isSelected)}
                        >
                            {/* Icon Box */}
                            <div
                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${isSelected ? `bg-${theme}-100 text-${theme}-600` : `bg-gray-100 text-gray-400 group-hover:bg-${theme}-50 group-hover:text-${theme}-500`}`}
                            >
                                <Icon size={24} strokeWidth={isSelected ? 2 : 1.5} />
                            </div>

                            {/* Text Content */}
                            <div className="flex-1">
                                <p
                                    className={`text-sm font-bold transition-colors duration-200 ${isSelected ? `text-${theme}-900` : 'text-gray-700'}`}
                                >
                                    {option.label}
                                </p>
                                <p className={`mt-1 text-xs transition-colors duration-200 ${isSelected ? `text-${theme}-700` : 'text-gray-400'}`}>
                                    Click to {isSelected ? 'revoke' : 'grant'} access
                                </p>
                            </div>

                            {/* Selected Checkmark Indicator */}
                            {isSelected && (
                                <div className={`absolute top-3 right-3 text-${theme}-600`}>
                                    <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            {/* End Grid */}

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                    <span className="font-bold">{selectedValues.length}</span> modules selected.
                </p>
            </div>
        </div>
    );
};
