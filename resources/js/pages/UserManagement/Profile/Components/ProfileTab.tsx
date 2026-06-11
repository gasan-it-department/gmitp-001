import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import { UserSocialAccount } from '@/Core/Types/User/user';
import api from '@/lib/axios';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import profile from '@/routes/profile';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useGoogleLogin } from '@react-oauth/google';
import { Camera, CheckCircle2, ImageIcon, Link2, LogOut, Minus, Plus, Save, ShieldCheck, Trash2, User, UserCog } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ProfileFormData = {
    first_name: string;
    middle_name: string;
    last_name: string;
    phone: string;
};

export default function ProfileTab() {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Social accounts — kept in local state so linking updates the UI instantly
    const [socialAccounts, setSocialAccounts] = useState<UserSocialAccount[]>(auth.user?.social_accounts ?? []);
    const [isSocialLoading, setIsSocialLoading] = useState(false);

    const googleAccount = socialAccounts.find((a) => a.provider_name === 'google');

    // Cropper states
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [userAvatarURL, setUserAvatarURL] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // Dialogs
    const [classicDialog, setClassicDialog] = useState({
        title: '',
        message: '',
        isOpen: false,
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonVisible: false,
        currentAction: '',
    });

    // React Hook Form
    const { register, handleSubmit, setValue } = useForm<ProfileFormData>({
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            phone: '',
        },
    });

    useEffect(() => {
        if (auth.user) {
            setValue('first_name', auth.user.first_name || '');
            setValue('middle_name', auth.user.middle_name || '');
            setValue('last_name', auth.user.last_name || '');
            setValue('phone', auth.user.phone || '');

            // Seed avatar from linked Google account if no custom photo is set
            const google = auth.user.social_accounts?.find((a) => a.provider_name === 'google');
            setUserAvatarURL(google?.avatar_url ?? null);
        }
    }, [auth.user, setValue]);

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImage = useCallback(async () => {
        if (!selectedImage || !croppedAreaPixels) return null;
        const image = await createImage(selectedImage);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const { width, height, x, y } = croppedAreaPixels;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        return new Promise<string>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(URL.createObjectURL(blob));
            }, 'image/png');
        });
    }, [selectedImage, croppedAreaPixels]);

    async function handleCropSave() {
        const croppedImgUrl = await getCroppedImage();
        if (croppedImgUrl) {
            setUserAvatarURL(croppedImgUrl);
            // TODO: Upload logic here
        }
        setIsCropDialogOpen(false);
        setZoom(1);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSelectedImage(url);
        setIsCropDialogOpen(true);
        e.target.value = '';
    }

    const onSubmit = async (data: ProfileFormData) => {
        console.log({ ...data, avatarPreview: userAvatarURL });
        // TODO: Backend Update Logic
    };

    const handleLogout = async () => {
        try {
            await AuthApi.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleLinkGoogle = async (accessToken: string) => {
        setIsSocialLoading(true);
        try {
            const response = await api.post(profile.social.link.url(), {
                provider: 'google',
                access_token: accessToken,
            });

            // Update local state so the UI reflects the new link instantly
            setSocialAccounts(response.data.social_accounts);

            // Also seed the avatar from the newly linked account
            const google = response.data.social_accounts?.find((a: UserSocialAccount) => a.provider_name === 'google');
            if (google?.avatar_url) setUserAvatarURL(google.avatar_url);

            toast.success('Google account linked successfully.');
        } catch (error: any) {
            toast.error('Failed to link Google account.', {
                description: error.response?.data?.message || 'Please try again.',
            });
        } finally {
            setIsSocialLoading(false);
        }
    };

    const linkWithGoogle = useGoogleLogin({
        onSuccess: (tokenResponse) => handleLinkGoogle(tokenResponse.access_token),
        onError: () => toast.error('Google authentication failed.'),
    });

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-2 text-primary">
                    <UserCog className="h-5 w-5" />
                    <h2 className="font-heading text-xl font-bold tracking-tight">Personal Information</h2>
                </div>
                <p className="text-sm text-muted-foreground">Update your profile details and how others see you on the platform.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="overflow-hidden rounded-2xl border-border p-4 shadow-sm md:p-8">
                    <div className="flex flex-col gap-8 md:flex-row md:gap-12">
                        {/* Avatar Section */}
                        <div className="flex shrink-0 flex-col items-center gap-4">
                            <div className="group relative cursor-default">
                                <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg ring-4 ring-muted md:h-36 md:w-36">
                                    <Avatar className="h-full w-full">
                                        <AvatarImage src={userAvatarURL || ''} alt="avatar" className="object-cover" />
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            <User className="h-12 w-12 md:h-16 md:w-16" />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled />

                            {userAvatarURL && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10 cursor-not-allowed opacity-50"
                                >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Remove Photo
                                </Button>
                            )}
                        </div>

                        {/* Form Fields Section */}
                        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="first_name" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    First Name
                                </Label>
                                <Input
                                    id="first_name"
                                    {...register('first_name')}
                                    disabled
                                    className="h-11 rounded-xl font-medium bg-muted/40 cursor-not-allowed"
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="middle_name" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Middle Name
                                </Label>
                                <Input
                                    id="middle_name"
                                    {...register('middle_name')}
                                    disabled
                                    className="h-11 rounded-xl font-medium bg-muted/40 cursor-not-allowed"
                                    placeholder="Enter middle name"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="last_name" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Last Name
                                </Label>
                                <Input
                                    id="last_name"
                                    {...register('last_name')}
                                    disabled
                                    className="h-11 rounded-xl font-medium bg-muted/40 cursor-not-allowed"
                                    placeholder="Enter last name"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="phone" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Mobile Number
                                </Label>
                                <Input
                                    id="phone"
                                    {...register('phone')}
                                    disabled
                                    className="h-11 cursor-not-allowed rounded-xl bg-muted/50 font-medium"
                                    placeholder="09XXXXXXXXX"
                                />
                                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <ShieldCheck className="h-3 w-3" />
                                    Verified and linked to your account.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
                        <div className="flex flex-col-reverse w-full gap-3 sm:flex-row sm:w-auto">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    setClassicDialog({
                                        title: 'Confirm Logout',
                                        message: 'Are you sure you want to logout?',
                                        negativeButtonText: 'Stay',
                                        positiveButtonText: 'Logout',
                                        isNegativeButtonVisible: true,
                                        currentAction: 'logout',
                                        isOpen: true,
                                    })
                                }
                                className="h-11 w-full rounded-xl px-6 font-bold text-destructive hover:bg-destructive/10 sm:w-auto"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>

                            <Button
                                type="submit"
                                disabled
                                className="h-11 w-full rounded-xl bg-primary px-8 font-bold text-primary-foreground shadow-md hover:bg-primary/90 sm:w-auto min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Changes
                                <Save className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>

            {/* Connected Accounts */}
            <Card className="overflow-hidden rounded-2xl border-border p-4 shadow-sm md:p-8">
                <div className="mb-5 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    <div>
                        <h3 className="font-heading text-base font-bold tracking-tight">Connected Accounts</h3>
                        <p className="text-xs text-muted-foreground">Link your Google account to enable social sign-in and auto-fill your email.</p>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Google colour logo */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background shadow-sm">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Google</p>
                            {googleAccount ? (
                                <p className="text-xs text-muted-foreground">
                                    {auth.user.email ? auth.user.email : `Linked on ${googleAccount.linked_at}`}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">Not connected</p>
                            )}
                        </div>
                    </div>

                    {googleAccount ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Connected
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSocialLoading}
                            onClick={() => linkWithGoogle()}
                            className="h-9 rounded-xl px-4 text-xs font-bold"
                        >
                            {isSocialLoading ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Linking...
                                </span>
                            ) : (
                                'Link Account'
                            )}
                        </Button>
                    )}
                </div>
            </Card>

            {/* --- CROP DIALOG --- */}
            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="w-[95vw] overflow-hidden rounded-2xl border-0 p-0 shadow-2xl sm:max-w-lg">
                    <DialogHeader className="border-b border-border bg-background px-4 py-3 md:px-6 md:py-4">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-secondary p-2 text-primary">
                                <ImageIcon className="h-5 w-5" />
                            </div>
                            <DialogTitle className="font-heading text-lg font-bold text-foreground md:text-xl">Adjust Photo</DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="bg-muted/30 p-4 md:p-6">
                        <div className="relative h-64 w-full overflow-hidden rounded-xl border-2 border-border bg-black shadow-inner md:h-80">
                            <Cropper
                                image={selectedImage!}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                showGrid={false}
                            />
                        </div>

                        {/* Zoom Controls */}
                        <div className="mt-6 flex items-center gap-4 px-2">
                            <Minus className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                // Accent uses primary color now
                                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary transition-all hover:accent-primary/80"
                            />
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>

                    <DialogFooter className="flex-row justify-end gap-2 border-t border-border bg-background px-4 py-3 md:px-6 md:py-4">
                        <Button variant="ghost" onClick={() => setIsCropDialogOpen(false)} className="h-10 font-bold text-muted-foreground">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCropSave}
                            className="h-10 rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90"
                        >
                            Apply Photo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- CONFIRMATION DIALOG --- */}
            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={!classicDialog.isNegativeButtonVisible}
                negativeButtonText={classicDialog.negativeButtonText}
                positiveButtonText={classicDialog.positiveButtonText}
                open={classicDialog.isOpen}
                onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isOpen: false }))}
                onPositiveClick={() => {
                    setClassicDialog((prev) => ({ ...prev, isOpen: false }));
                    if (classicDialog.currentAction === 'logout') handleLogout();
                    if (classicDialog.currentAction === 'remove-avatar') setUserAvatarURL(null);
                }}
            />
        </div>
    );
}

/* Helper for cropper image creation */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}
