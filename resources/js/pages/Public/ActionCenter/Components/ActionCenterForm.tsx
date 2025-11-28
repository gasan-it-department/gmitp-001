'use client';

import type React from 'react';

import { AssistanceOptions } from '@/components/ActionCenter/AssistanceOptionsDropdown';
import { FormInput } from '@/components/FormInputField';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HandHeart } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
    const [status, setStatus] = useState('');
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
    const methods = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: any) => {
        console.log('Form submitted:', data);
    };
    function handleAddressChange(address: any | null): void {
        throw new Error('Function not implemented.');
    }
    const [address, setAddress] = useState(null);
    return (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:bg-accent/90">
                    <HandHeart className="h-5 w-5" />
                    Request Assistance
                </Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-balance">
                        <HandHeart className="h-6 w-6 text-primary" />
                        Request for Assistance
                    </DialogTitle>
                    <DialogDescription className="text-base leading-relaxed">
                        Please fill out the form below to request assistance from the Municipal Action Center.
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <div className="mb-15">
                            <div className="mx-auto grid max-w-md grid-cols-1 gap-5 lg:grid-cols-2">
                                <FormInput name="first_name" label="First name" type="text" required autoComplete="off" />
                                <FormInput name="last_name" label="Last name" required autoComplete="off" />
                                <FormInput name="middle_name" label="Middle name" required autoComplete="off" />
                                <FormInput name="suffix" label="Suffix" required autoComplete="off" />
                                <FormInput name="contact_number" label="Contact number" required autoComplete="off" />
                                <AssistanceOptions onChange={setStatus} />
                            </div>
                            <div>{/* <AddressDropdown onAddressChange={setAddress} /> */}</div>
                        </div>
                        <div className="flex gap-5">
                            <Button onClick={() => setOpen(false)} className="w-full border border-gray-300 bg-white text-gray-700">
                                Cancel
                            </Button>
                            <Button type="submit" className="w-full">
                                Submit
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
