import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    Camera,
    ImageIcon,
    LogOut,
    Minus,
    Plus,
    Save,
    Trash2,
    User,
    UserCog
} from 'lucide-react';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { useForm } from 'react-hook-form';

type ProfileFormData = {
    first_name: string;
    middle_name: string;
    last_name: string;
    user_name: string;
    phone: string;
};

export default function ProfileTab() {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            user_name: '',
            phone: '',
        },
    });

    useEffect(() => {
        if (auth.user) {
            setValue('first_name', auth.user.first_name || '');
            setValue('middle_name', auth.user.middle_name || '');
            setValue('last_name', auth.user.last_name || '');
            setValue('user_name', auth.user.user_name || '');
            setValue('phone', auth.user.phone || '');
            setUserAvatarURL(null);
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

    return (
        // Theme Update: 'bg-muted/30'
        <div className="min-h-screen bg-muted/30">
            <div className="relative mx-auto max-w-5xl px-2 py-4 md:p-8">
                
                {/* --- PAGE HEADER --- */}
                <div className="mb-4 md:mb-8 px-2 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {/* Icon Badge: 'bg-secondary', 'text-primary' */}
                            <span className="inline-flex items-center justify-center rounded-lg bg-secondary p-1.5 text-primary shadow-sm border border-border">
                                <UserCog className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Settings
                            </span>
                        </div>
                        {/* Title: 'text-foreground' */}
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                            My <span className="text-primary">Profile</span>
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1 md:mt-2 text-sm md:text-base">
                            Update your personal details and manage account security.
                        </p>
                    </div>

                    {/* Desktop Logout Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setClassicDialog({
                            title: 'Confirm Logout',
                            message: 'Are you sure you want to logout securely?',
                            negativeButtonText: 'Stay',
                            positiveButtonText: 'Logout',
                            isNegativeButtonVisible: true,
                            currentAction: 'logout',
                            isOpen: true,
                        })}
                        // Destructive Theme
                        className="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 font-bold"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* --- MAIN CARD --- */}
                {/* Theme Update: 'bg-card', 'border-border' */}
                <Card className="overflow-hidden border border-border shadow-sm rounded-2xl bg-card relative z-10">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
                            
                            {/* LEFT COLUMN: AVATAR & SIDEBAR */}
                            {/* Theme Update: 'bg-muted/30', 'border-border' */}
                            <div className="md:col-span-4 bg-muted/30 border-r border-border p-4 md:p-8 flex flex-col items-center">
                                
                                {/* Avatar Uploader */}
                                <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                                    {/* Ring: 'ring-background', hover: 'ring-primary/50' */}
                                    <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full ring-4 ring-background shadow-xl overflow-hidden transition-all group-hover:ring-primary/50 group-hover:shadow-2xl">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={userAvatarURL || ''} alt="avatar" className="object-cover" />
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                <User className="h-14 w-14 md:h-16 md:w-16" />
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Camera className="h-8 w-8 text-white mb-1" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change</span>
                                        </div>
                                    </div>

                                    {/* Edit Badge: 'bg-primary' */}
                                    <div className="absolute bottom-2 right-2 h-10 w-10 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-sm text-primary-foreground group-hover:bg-primary/80 transition-colors">
                                        <Camera className="h-4 w-4" />
                                    </div>
                                </div>

                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />

                                {/* Remove Avatar Action */}
                                {userAvatarURL && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setClassicDialog({
                                                title: 'Remove Picture',
                                                message: 'Are you sure you want to revert to the default avatar?',
                                                negativeButtonText: 'Cancel',
                                                positiveButtonText: 'Remove',
                                                isNegativeButtonVisible: true,
                                                currentAction: 'remove-avatar',
                                                isOpen: true,
                                            });
                                        }}
                                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8 font-bold mb-6"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove Picture
                                    </Button>
                                )}

                                <div className="w-full space-y-4">
                                    <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm">
                                        <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Administrator Details</h4>
                                        <p className="text-sm text-muted-foreground font-medium break-all">
                                            Account ID: <span className="font-mono text-foreground bg-secondary px-1.5 py-0.5 rounded ml-1">{auth.user?.id || '---'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FORM DATA */}
                            <div className="md:col-span-8 p-4 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                                    
                                    <div className="space-y-1.5 md:space-y-2">
                                        <Label htmlFor="first_name" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">First Name</Label>
                                        <Input id="first_name" {...register('first_name')} className="h-10 md:h-11 bg-background border-input focus-visible:ring-ring font-bold text-foreground text-sm md:text-base" />
                                    </div>

                                    <div className="space-y-1.5 md:space-y-2">
                                        <Label htmlFor="middle_name" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Middle Name</Label>
                                        <Input id="middle_name" {...register('middle_name')} className="h-10 md:h-11 bg-background border-input focus-visible:ring-ring font-bold text-foreground text-sm md:text-base" />
                                    </div>

                                    <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                                        <Label htmlFor="last_name" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Last Name</Label>
                                        <Input id="last_name" {...register('last_name')} className="h-10 md:h-11 bg-background border-input focus-visible:ring-ring font-bold text-foreground text-sm md:text-base" />
                                    </div>

                                    <div className="space-y-1.5 md:space-y-2">
                                        <Label htmlFor="user_name" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Username</Label>
                                        <Input id="user_name" disabled {...register('user_name')} className="h-10 md:h-11 bg-muted text-muted-foreground font-mono border-input shadow-none cursor-not-allowed text-sm md:text-base" />
                                    </div>

                                    <div className="space-y-1.5 md:space-y-2">
                                        <Label htmlFor="phone" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Mobile Number</Label>
                                        <Input id="phone" {...register('phone')} placeholder="09XXXXXXXXX" disabled={true} className="h-10 md:h-11 bg-background border-input focus-visible:ring-ring font-bold text-foreground text-sm md:text-base" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 md:gap-4 pt-6 border-t border-border">
                                    {/* Mobile Logout */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setClassicDialog({
                                            title: 'Confirm Logout',
                                            message: 'Are you sure you want to logout securely?',
                                            negativeButtonText: 'Stay',
                                            positiveButtonText: 'Logout',
                                            isNegativeButtonVisible: true,
                                            currentAction: 'logout',
                                            isOpen: true,
                                        })}
                                        className="md:hidden text-destructive font-bold h-10 md:h-11"
                                    >
                                        Logout
                                    </Button>

                                    <Button 
                                        type="submit" 
                                        // Primary Button Theme
                                        className="h-10 md:h-11 w-full md:w-auto min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95 font-bold rounded-xl text-sm md:text-base"
                                    >
                                        Save Changes
                                        <Save className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>

            {/* --- CROP DIALOG --- */}
            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl rounded-2xl w-[95vw]">
                    <DialogHeader className="px-4 py-3 md:px-6 md:py-4 border-b border-border bg-background">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-secondary rounded-lg text-primary">
                                <ImageIcon className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-lg md:text-xl font-bold text-foreground">Adjust Photo</DialogTitle>
                        </div>
                    </DialogHeader>
                    
                    <div className="p-4 md:p-6 bg-muted/30">
                        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl border-2 border-border bg-black shadow-inner">
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
                                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary hover:accent-primary/80 transition-all"
                            />
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>

                    <DialogFooter className="px-4 py-3 md:px-6 md:py-4 bg-background border-t border-border flex-row gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setIsCropDialogOpen(false)} className="font-bold text-muted-foreground h-10">
                            Cancel
                        </Button>
                        <Button onClick={handleCropSave} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-4 h-10">
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
                onNegativeClick={() => setClassicDialog(prev => ({ ...prev, isOpen: false }))}
                onPositiveClick={() => {
                    setClassicDialog(prev => ({ ...prev, isOpen: false }));
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