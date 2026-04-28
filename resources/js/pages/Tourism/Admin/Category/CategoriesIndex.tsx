import AppLayout from '@/layouts/App/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

// Shadcn Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Category } from '@/Core/Types/Procurement/procurement';
import tourism from '@/routes/tourism';
import { LayoutGrid, PlusCircle, Trash2 } from 'lucide-react';

interface CategoriesIndexProps {
    categories: { data: Category };
    typeOption: any;
}

export default function CategoriesIndex({ categories, typeOption }: CategoriesIndexProps) {
    const displayData = categories.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    // Passing our interface to useForm ensures strict typing for our payload
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'spot',
        description: '',
    });

    // Explicitly typing the form event
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(tourism.category.store.url(), {
            preserveScroll: true, // Prevents the page from jumping to the top
            onSuccess: () => {
                reset();
                // You can also trigger a Toast notification here manually if you want
            },
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
        });
    };

    // Helper typed to ensure it only accepts valid CategoryTypes
    const getTypeBadge = (type: CategoryType) => {
        const styles: Record<CategoryType, string> = {
            spot: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
            establishment: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
            heritage: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
            event: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
        };

        return (
            <Badge variant="outline" className={`${styles[type]} capitalize`}>
                {type}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Manage Categories" />

            <div className="container mx-auto space-y-8 py-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tourism Categories</h1>
                        <p className="mt-1 text-muted-foreground">Organize your municipality's spots, events, and establishments.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    {/* LEFT: Categories Table */}
                    <Card className="border-muted shadow-sm lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Existing Categories</CardTitle>
                                <CardDescription>A total of {displayData.length} categories found.</CardDescription>
                            </div>
                            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category Name</TableHead>
                                        <TableHead>Classification</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayData.map((category) => (
                                        <TableRow key={category.id} className="group">
                                            <TableCell>
                                                <div className="font-medium text-gray-900">{category.name}</div>
                                                <div className="line-clamp-1 text-xs text-muted-foreground">{category.description}</div>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(category.type)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* RIGHT: Create Form */}
                    <Card className="border-primary/10 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlusCircle className="h-5 w-5 text-primary" />
                                New Category
                            </CardTitle>
                            <CardDescription>Create a classification for your tourism assets.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Fine Dining, Hiking Trails"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
                                </div>

                                {/* Type Select (Shadcn) */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={data.type} onValueChange={(value: CategoryType) => setData('type', value)}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {typeOption.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Briefly describe what belongs in this category..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Saving...' : 'Create Category'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
