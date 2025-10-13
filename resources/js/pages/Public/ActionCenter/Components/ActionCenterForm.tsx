'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText, HandHeart, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FormData {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    contactNumber: string;
    birthdate: string;
    assistanceType: string;
    description: string;
}

export function ActionCenterForm() {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        contactNumber: '',
        birthdate: '',
        assistanceType: '',
        description: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^\d+$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Contact number must contain only numbers';
        }
        if (!formData.birthdate) {
            newErrors.birthdate = 'Birthdate is required';
        }
        if (!formData.assistanceType) {
            newErrors.assistanceType = 'Please select a type of assistance';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Close dialog
            setOpen(false);

            toast.success('Request Submitted Successfully', {
                description: 'Your assistance request has been submitted successfully. Thank you for reaching out to the Municipal Action Center.',
                duration: 5000,
            });

            // Reset form
            setFormData({
                firstName: '',
                middleName: '',
                lastName: '',
                suffix: '',
                contactNumber: '',
                birthdate: '',
                assistanceType: '',
                description: '',
            });
            setErrors({});
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:bg-accent/90">
                    <HandHeart className="h-5 w-5" />
                    Request Assistance
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-balance">
                        <HandHeart className="h-6 w-6 text-primary" />
                        Request for Assistance
                    </DialogTitle>
                    <DialogDescription className="text-base leading-relaxed">
                        Please fill out the form below to request assistance from the Municipal Action Center.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <User className="h-4 w-4" />
                            Beneficiary Information
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-foreground">
                                    First Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={errors.firstName ? 'border-destructive' : ''}
                                    placeholder="Enter first name"
                                />
                                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="middleName" className="text-foreground">
                                    Middle Name
                                </Label>
                                <Input
                                    id="middleName"
                                    value={formData.middleName}
                                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                                    placeholder="Enter middle name (optional)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-foreground">
                                    Last Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={errors.lastName ? 'border-destructive' : ''}
                                    placeholder="Enter last name"
                                />
                                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="suffix" className="text-foreground">
                                    Suffix
                                </Label>
                                <Input
                                    id="suffix"
                                    value={formData.suffix}
                                    onChange={(e) => handleInputChange('suffix', e.target.value)}
                                    placeholder="Jr., Sr., III (optional)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactNumber" className="text-foreground">
                                    Contact Number <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="contactNumber"
                                    type="tel"
                                    value={formData.contactNumber}
                                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                    className={errors.contactNumber ? 'border-destructive' : ''}
                                    placeholder="Enter contact number"
                                />
                                {errors.contactNumber && <p className="text-sm text-destructive">{errors.contactNumber}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthdate" className="flex items-center gap-1 text-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Birthdate <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={formData.birthdate}
                                    onChange={(e) => handleInputChange('birthdate', e.target.value)}
                                    className={errors.birthdate ? 'border-destructive' : ''}
                                />
                                {errors.birthdate && <p className="text-sm text-destructive">{errors.birthdate}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="birthdate" className="flex items-center gap-1 text-foreground">
                                Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="birthdate"
                                type="text"
                                value={formData.birthdate}
                                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                                className={errors.birthdate ? 'border-destructive' : ''}
                            />
                            {errors.birthdate && <p className="text-sm text-destructive">{errors.birthdate}</p>}
                        </div>
                    </div>

                    {/* Assistance Details Section */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <FileText className="h-4 w-4" />
                            Assistance Details
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="assistanceType" className="text-foreground">
                                Type of Assistance <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.assistanceType} onValueChange={(value) => handleInputChange('assistanceType', value)}>
                                <SelectTrigger id="assistanceType" className={errors.assistanceType ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select type of assistance" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="food">Food Assistance</SelectItem>
                                    <SelectItem value="medical">Medical Assistance</SelectItem>
                                    <SelectItem value="financial">Financial Assistance</SelectItem>
                                    <SelectItem value="burial">Burial Assistance</SelectItem>
                                    <SelectItem value="transportation">Transportation Assistance</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.assistanceType && <p className="text-sm text-destructive">{errors.assistanceType}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-foreground">
                                Description / Reason for Assistance <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
                                placeholder="Please describe your situation and why you need assistance..."
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 sm:flex-row">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-accent bg-gradient-to-r from-red-500 to-orange-500 text-white hover:bg-accent/90 sm:flex-none"
                        >
                            Submit Request
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
