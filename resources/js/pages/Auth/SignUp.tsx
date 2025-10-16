import type React from 'react';
import InputError from '@/components/Input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from '@/lib/axios';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import ClassicDialog from '../Utility/ClassicDialog';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [classicDialogTitle, setClassicDialogTitle] = useState("");
    const [classicDialogMessage, setClassicDialogMessage] = useState("");
    const [isDialogShowing, setIsDialogShowing] = useState(false);

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const userData = {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                user_name: userName,
                phone: phone,
                password: password,
                password_confirmation: passwordConfirmation,
            };

            const response = await axios.post('/store-account', userData);
            // if (response.data.redirect_to) {
            //     window.location.href = response.data.redirect_to;
            // }

            setErrors({});
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setErrors(error.response.data.errors || {});
            } else {
                setClassicDialogTitle("Something went wrong");
                setClassicDialogMessage(error);
                setIsDialogShowing(true);
                console.error('Registration failed:', error);
            }

            setErrors(error.response.data.errors || {});
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev: any) => !prev);
    };

    return (
        <div className="p-1">
            <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-3">
                            <Label htmlFor="first_name" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                First Name
                            </Label>
                            <Input
                                id="first_name"
                                type="text"
                                name="first_name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            {errors.first_name && <InputError message={errors.first_name[0]} />}
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="middle_name" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                Middle Name <span className="text-gray-500">(Optional)</span>
                            </Label>
                            <Input
                                id="middle_name"
                                type="text"
                                name="middle_name"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                            />
                            {errors.middle_name && <InputError message={errors.middle_name[0]} />}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-3">
                            <Label htmlFor="last_name" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                Last Name
                            </Label>
                            <Input
                                id="last_name"
                                type="text"
                                name="last_name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                            {errors.last_name && <InputError message={errors.last_name[0]} />}
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="phone" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                Phone
                            </Label>

                            <Input
                                id="phone"
                                type="text"
                                name="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0900-000-0000"
                                required
                            />

                            {errors.phone && <InputError message={errors.phone[0]} />}
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="user_name" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                            Username
                        </Label>
                        <Input id="user_name" type="text" name="user_name" value={userName} onChange={(e) => setUsername(e.target.value)} required />{' '}
                        {errors.user_name && <InputError message={errors.user_name[0]} />}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="password" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                            >
                                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && <InputError message={errors.password[0]} />}
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="password_confirmation" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                            Confirm Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                        />
                        {errors.password_confirmation && <InputError message={errors.password_confirmation[0]} />}
                    </div>

                    <Button type="submit" className="mt-2 w-full bg-gradient-to-r from-red-500 to-orange-500" tabIndex={5}>
                        Create account
                    </Button>
                </div>
            </form>

            <ClassicDialog
                title={classicDialogTitle}
                message={classicDialogMessage}
                positiveButtonText='Close'
                onPositiveClick={() => {
                    setIsDialogShowing(false);
                }}
                hideNegativeButton={true}
                open={isDialogShowing} />
        </div>
    );
}
