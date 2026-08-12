'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { useForm } from '@inertiajs/react';
import { Calendar, HeartHandshake, MessageCircle, Upload } from 'lucide-react';

export default function WeddingPage() {
    const { data, setData, post, processing, reset } = useForm({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        mobile_number: '',
        preferred_dates: ['', '', ''],
        message: '',
        file: null as File | null,
    });

    const handleDateChange = (index: number, value: string) => {
        const updatedDates = [...data.preferred_dates];
        updatedDates[index] = value;
        setData('preferred_dates', updatedDates);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('wedding.inquiries.store'), {
            onSuccess: () => {
                alert(`Inquiry submitted by ${data.firstName} for preferred dates:\n\n${data.preferred_dates.filter(Boolean).join(', ')}`);
                reset();
            },
        });
    };

    return (
        <PublicLayout
            title="Civil Wedding Inquiries"
            description="Find information about civil wedding inquiries, scheduling, and municipal requirements."
        >
            <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-rose-50 via-pink-50 to-amber-100 px-4 py-10 dark:from-rose-950 dark:via-pink-900 dark:to-gray-900">
                {/* Header / Hero */}
                <div className="mb-10 max-w-2xl text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-400 p-4 text-white shadow-lg">
                            <HeartHandshake className="h-10 w-10" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-4xl font-semibold text-rose-800 dark:text-rose-100">Civil Wedding Inquiries</h1>
                    <p className="text-rose-700/80 dark:text-rose-300">
                        Have questions about the civil wedding process? Send us your inquiry below and our Municipal Civil Registrar will assist you.
                    </p>
                </div>

                {/* Inquiry Form */}
                <Card className="w-full max-w-2xl rounded-3xl border border-rose-200/50 bg-white/70 shadow-lg backdrop-blur-sm dark:border-rose-800/40 dark:bg-gray-900/40">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl font-semibold text-rose-800 dark:text-rose-100">Inquiry Form</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Partner Names */}
                            {/* Contact Person Name */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-rose-700 dark:text-rose-200">Contact Person Details</h3>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <div>
                                            <Label htmlFor="first_name">First Name</Label>
                                            <span className="text-destructive">*</span>
                                        </div>

                                        <Input
                                            id="first_name"
                                            placeholder="First name"
                                            value={data.firstName}
                                            onChange={(e) => setData('firstName', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                                        <Input
                                            id="middle_name"
                                            placeholder="Middle name"
                                            value={data.middleName}
                                            onChange={(e) => setData('middleName', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <div>
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <span className="text-destructive">*</span>
                                        </div>
                                        <Input
                                            id="last_name"
                                            placeholder="Last name"
                                            value={data.lastName}
                                            onChange={(e) => setData('lastName', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <span className="text-destructive">*</span>
                                    </div>

                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <div>
                                        <Label htmlFor="mobile_number">Contact Number</Label>
                                        <span className="text-destructive">*</span>
                                    </div>

                                    <Input
                                        id="mobile_number"
                                        type="text"
                                        placeholder="09XXXXXXXXX"
                                        value={data.mobile_number}
                                        onChange={(e) => setData('mobile_number', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Preferred Dates (max 3) */}
                            <div>
                                <Label>Preferred Dates (up to 3)</Label>
                                <div className="space-y-3">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Calendar className="text-rose-500" size={20} />
                                            <Input
                                                type="date"
                                                value={data.preferred_dates[i]}
                                                onChange={(e) => handleDateChange(i, e.target.value)}
                                                required={i === 0}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-1 text-xs text-rose-500">Please provide at least one date and up to three possible dates.</p>
                            </div>

                            {/* Inquiry Message */}
                            <div>
                                <div>
                                    <Label htmlFor="message">Inquiry Message</Label>
                                    <span className="text-destructive">*</span>
                                </div>

                                <Textarea
                                    id="message"
                                    placeholder="Write your question or request here..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Optional File Upload */}
                            <div>
                                <Label htmlFor="file">Attach Supporting Document (Optional)</Label>
                                <div className="flex items-center gap-3">
                                    <Upload className="text-rose-500" size={20} />
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".pdf,.jpg,.png"
                                        onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 px-8 py-3 font-medium text-white shadow-md transition-all duration-300 hover:from-rose-600 hover:to-amber-500 hover:shadow-lg"
                                >
                                    <MessageCircle size={18} />
                                    {processing ? 'Sending...' : 'Send Inquiry'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
