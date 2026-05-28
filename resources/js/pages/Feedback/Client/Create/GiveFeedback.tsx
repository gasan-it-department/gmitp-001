import { DepartmentOption } from '@/components/Department/DepartmentOption';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import React from 'react';

export default function GiveFeedback() {
    const { data, setData, post, processing, errors } = useForm({
        department_id: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Backend wiring deferred as requested
        console.log('Form data:', data);
    };

    return (
        <AppLayout>
            <Head title="Give Feedback" />

            <div className="container mx-auto max-w-2xl py-8">
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Share Your Feedback</CardTitle>
                        <CardDescription>
                            Your input helps us improve our services. Please fill out the form below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <DepartmentOption
                                    value={data.department_id}
                                    onValueChange={(val) => setData('department_id', val)}
                                    error={errors.department_id}
                                    placeholder="Select Office/Department"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="What is this feedback about?"
                                    className={errors.subject ? 'border-destructive' : ''}
                                />
                                {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Your Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Provide details about your experience or suggestion..."
                                    className={`min-h-[150px] ${errors.message ? 'border-destructive' : ''}`}
                                />
                                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                <Send className="mr-2 h-4 w-4" />
                                {processing ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
