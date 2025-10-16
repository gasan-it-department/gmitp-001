import SuperAdminLayout from '@/layouts/App/AppLayout';
import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Lock, Mail, Phone, Upload, User, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

type UserType = 'admin' | 'client' | '';

interface FormData {
    userType: UserType;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    avatar: File | null;
    adminPermissions: string[];
    clientGroup: string;
}

interface FormErrors {
    [key: string]: string;
}

const adminPermissions = ['User Management', 'Action Center', 'Tourism', 'Reports', 'Transparency'];

const clientGroups = ['Premium Clients', 'Standard Clients', 'Trial Clients', 'Enterprise Clients'];

export default function CreateUserPage() {
    const [formData, setFormData] = useState<FormData>({
        userType: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        avatar: null,
        adminPermissions: [],
        clientGroup: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'username':
                if (!value.trim()) {
                    newErrors.username = 'Username is required';
                } else if (value.length < 3) {
                    newErrors.username = 'Username must be at least 3 characters';
                } else {
                    delete newErrors.username;
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!emailRegex.test(value)) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                } else if (value.length < 8) {
                    newErrors.password = 'Password must be at least 8 characters';
                } else {
                    delete newErrors.password;
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Please confirm your password';
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
        }

        setErrors(newErrors);
    };

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePermissionChange = (permission: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            adminPermissions: checked ? [...prev.adminPermissions, permission] : prev.adminPermissions.filter((p) => p !== permission),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = ['userType', 'username', 'email', 'password', 'confirmPassword'];
        const newErrors: FormErrors = {};

        requiredFields.forEach((field) => {
            if (!formData[field as keyof FormData]) {
                newErrors[field] = 'This field is required';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Here you would typically send the data to your API
        console.log('Form submitted:', formData);
        alert('User created successfully!');
    };

    return (
        <SuperAdminLayout>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            User Information
                        </CardTitle>
                        <CardDescription>Fill in the details below to create a new user account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* User Type Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="userType">User Type *</Label>
                                <Select value={formData.userType} onValueChange={(value: UserType) => handleInputChange('userType', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select the role for the new user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Admin
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="client">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Client
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.userType && <p className="text-sm text-red-500">{errors.userType}</p>}
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username *</Label>
                                    <div className="relative">
                                        <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Enter username"
                                            className="pl-10"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                        />
                                    </div>
                                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <div className="relative">
                                        <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter email address"
                                            className="pl-10"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter phone number"
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="avatar">Avatar</Label>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={avatarPreview || '/placeholder.svg'} />
                                            <AvatarFallback>
                                                <User className="h-8 w-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('avatar')?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Image
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <div className="relative">
                                        <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter password"
                                            className="pr-10 pl-10"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <div className="relative">
                                        <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm password"
                                            className="pr-10 pl-10"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            {/* Conditional Fields Based on User Type */}
                            {formData.userType === 'admin' && (
                                <div className="space-y-4">
                                    <div className="border-t pt-6">
                                        <h3 className="mb-4 text-lg font-medium text-gray-900">Admin Permissions</h3>
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                            {adminPermissions.map((permission) => (
                                                <div key={permission} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={permission}
                                                        checked={formData.adminPermissions.includes(permission)}
                                                        onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                                                    />
                                                    <Label htmlFor={permission} className="text-sm">
                                                        {permission}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.userType === 'client' && (
                                <div className="space-y-4">
                                    <div className="border-t pt-6">
                                        <h3 className="mb-4 text-lg font-medium text-gray-900">Client Settings</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="clientGroup">Client Group</Label>
                                            <Select value={formData.clientGroup} onValueChange={(value) => handleInputChange('clientGroup', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select client group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientGroups.map((group) => (
                                                        <SelectItem key={group} value={group}>
                                                            {group}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row">
                                <Button
                                    type="submit"
                                    className="hoverRed rounded-lg bg-gradient-to-r py-2 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                                >
                                    Create User
                                </Button>
                                <Button type="button" variant="outline" className="bg-transparent px-8 py-2" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
