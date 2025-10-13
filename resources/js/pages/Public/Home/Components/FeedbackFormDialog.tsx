import { CheckCircle2, Upload, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormData {
    feedbackTarget: 'employee' | 'office';
    targetName: string;
    feedbackMessage: string;
    fullName: string;
    email: string;
    phone: string;
    evidenceFile: File | null;
}

interface FormErrors {
    targetName?: string;
    feedbackMessage?: string;
    fullName?: string;
    email?: string;
    phone?: string;
}

export function FeedbackFormDialog({ open, onOpenChange }: FeedbackDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        feedbackTarget: 'employee',
        targetName: '',
        feedbackMessage: '',
        fullName: '',
        email: '',
        phone: '',
        evidenceFile: null,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [fileName, setFileName] = useState<string>('');

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.targetName.trim()) {
            newErrors.targetName = `${formData.feedbackTarget === 'employee' ? 'Employee name' : 'Office/Department name'} is required`;
        }
        if (!formData.feedbackMessage.trim()) newErrors.feedbackMessage = 'Feedback message is required';
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        console.log('Feedback Form Submission:', {
            ...formData,
            evidenceFile: formData.evidenceFile
                ? {
                      name: formData.evidenceFile.name,
                      size: formData.evidenceFile.size,
                      type: formData.evidenceFile.type,
                  }
                : null,
        });

        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                feedbackTarget: 'employee',
                targetName: '',
                feedbackMessage: '',
                fullName: '',
                email: '',
                phone: '',
                evidenceFile: null,
            });
            setFileName('');
            setErrors({});
            onOpenChange(false);
        }, 3000);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, evidenceFile: file });
            setFileName(file.name);
        }
    };

    const removeFile = () => {
        setFormData({ ...formData, evidenceFile: null });
        setFileName('');
    };

    const handleInputChange = (field: keyof FormData, value: string | File | null) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field as keyof FormErrors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-3xl overflow-y-auto p-6 sm:p-8">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-2xl font-bold text-foreground">Citizen Feedback Form</DialogTitle>
                </DialogHeader>

                {isSubmitted ? (
                    <Alert className="bg-success/10 border-success/20 duration-300 animate-in fade-in-0 zoom-in-95">
                        <CheckCircle2 className="text-success h-5 w-5" />
                        <AlertDescription className="text-success font-medium">
                            ✅ Feedback submitted successfully! Thank you for helping us improve.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-8">
                        {/* Feedback Target */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-foreground">
                                Feedback About <span className="text-destructive">*</span>
                            </Label>
                            <RadioGroup
                                value={formData.feedbackTarget}
                                onValueChange={(value) => handleInputChange('feedbackTarget', value)}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="employee" id="employee" />
                                    <Label htmlFor="employee" className="cursor-pointer font-normal">
                                        Employee
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="office" id="office" />
                                    <Label htmlFor="office" className="cursor-pointer font-normal">
                                        Office/Department
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Target Name */}
                        <div className="space-y-2">
                            <Label htmlFor="targetName" className="font-semibold text-foreground">
                                {formData.feedbackTarget === 'employee' ? 'Employee Name' : 'Office/Department Name'}{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="targetName"
                                value={formData.targetName}
                                onChange={(e) => handleInputChange('targetName', e.target.value)}
                                placeholder={formData.feedbackTarget === 'employee' ? 'Enter employee name' : 'Enter office or department name'}
                                className={errors.targetName ? 'border-destructive' : ''}
                            />
                            {errors.targetName && <p className="text-sm text-destructive">{errors.targetName}</p>}
                        </div>

                        {/* Feedback Message */}
                        <div className="space-y-2">
                            <Label htmlFor="feedbackMessage" className="font-semibold text-foreground">
                                Feedback Message <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="feedbackMessage"
                                value={formData.feedbackMessage}
                                onChange={(e) => handleInputChange('feedbackMessage', e.target.value)}
                                placeholder="Share your compliments, suggestions, or complaints..."
                                rows={5}
                                className={errors.feedbackMessage ? 'border-destructive' : ''}
                            />
                            {errors.feedbackMessage && <p className="text-sm text-destructive">{errors.feedbackMessage}</p>}
                        </div>

                        {/* File Upload */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-foreground">Upload Evidence (Optional)</Label>
                            <p className="text-sm text-muted-foreground">
                                You may upload images, screenshots, or documents to support your feedback.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('evidence')?.click()}
                                    className="sm:w-auto"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Button>
                                {fileName && (
                                    <div className="flex flex-1 items-center gap-2 rounded-md bg-muted px-3 py-2">
                                        <span className="truncate text-sm text-foreground">{fileName}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="h-6 w-6 p-0">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <input id="evidence" type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-5 border-t pt-6">
                            <h3 className="text-lg font-semibold text-foreground">Your Information</h3>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="font-semibold text-foreground">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        placeholder="Enter your full name"
                                        className={errors.fullName ? 'border-destructive' : ''}
                                    />
                                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold text-foreground">
                                        Email Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="your.email@example.com"
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="phone" className="font-semibold text-foreground">
                                        Phone Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="+63 912 345 6789"
                                        className={errors.phone ? 'border-destructive' : ''}
                                    />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
                                Submit Feedback
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
