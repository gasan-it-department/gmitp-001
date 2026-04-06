import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import department from '@/routes/department';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Label } from '../ui/label';

interface Department {
    id: string;
    label: string;
}

interface Props {
    value?: string;
    onValueChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    className?: string;
}

export const DepartmentOption = ({ value, onValueChange, error, placeholder, className }: Props) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        fetch(department.list.url())
            .then((res) => res.json())
            .then((json) => {
                setDepartments(json.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching departments:', err);
                setLoading(false);
            });
    }, []);
    console.log;
    return (
        <div className={`flex flex-col gap-1.5 ${clsx(className)}`}>
            <Label className="text-sm font-medium text-gray-700">{placeholder || 'Department'}</Label>
            <Select value={value} onValueChange={onValueChange} disabled={loading}>
                <SelectTrigger className={`w-full ${error ? 'border-destructive' : ''}`}>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading offices...</span>
                        </div>
                    ) : (
                        <SelectValue placeholder={placeholder || 'Select a Department'} />
                    )}
                </SelectTrigger>

                <SelectContent>
                    {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                            {dept.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {error && <p className="animate-pulse text-sm text-destructive">{error}</p>}
        </div>
    );
};
