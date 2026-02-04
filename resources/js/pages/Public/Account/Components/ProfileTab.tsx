import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useForm } from 'react-hook-form';
import { 
    Camera, 
    Trash2, 
    Save, 
    LogOut, 
    User, 
    ImageIcon,
    Minus,
    Plus,
    UserCog
} from 'lucide-react';

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
            setValue('first_name', auth.user.first_name || 'Sample First Name');
            setValue('middle_name', auth.user.middle_name || 'Sample Middle Name');
            setValue('last_name', auth.user.last_name || 'Sample Last Name');
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
        <div className="min-h-screen bg-slate-50/30">
            <div className="relative mx-auto max-w-5xl p-8">
                
                {/* --- PAGE HEADER --- */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center rounded-lg bg-orange-100 p-1.5 text-orange-600 shadow-sm border border-orange-200">
                                <UserCog className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                                Settings
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Profile</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
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
                        className="hidden md:flex text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 font-bold"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* --- MAIN CARD --- */}
                <Card className="overflow-hidden border-slate-200 shadow-xl rounded-2xl bg-white relative z-10">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
                            
                            {/* LEFT COLUMN: AVATAR & SIDEBAR */}
                            <div className="md:col-span-4 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center">
                                
                                {/* Avatar Uploader */}
                                <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                                    <div className="relative h-40 w-40 rounded-full ring-4 ring-white shadow-xl overflow-hidden transition-all group-hover:ring-orange-200 group-hover:shadow-2xl">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={userAvatarURL || ''} alt="avatar" className="object-cover" />
                                            <AvatarFallback className="bg-slate-200 text-slate-400">
                                                <User className="h-16 w-16" />
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Camera className="h-8 w-8 text-white mb-1" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change</span>
                                        </div>
                                    </div>

                                    {/* Edit Badge */}
                                    <div className="absolute bottom-2 right-2 h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center border-4 border-white shadow-sm text-white group-hover:bg-orange-500 transition-colors">
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
                                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5 h-8 font-bold mb-6"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove Picture
                                    </Button>
                                )}

                                <div className="w-full space-y-4">
                                    <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-sm">
                                        <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Administrator Details</h4>
                                        <p className="text-sm text-slate-600 font-medium">
                                            Account ID: <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-1">{auth.user?.id || '---'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FORM DATA */}
                            <div className="md:col-span-8 p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">First Name</Label>
                                        <Input id="first_name" {...register('first_name')} className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 font-bold text-slate-700" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="middle_name" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Middle Name</Label>
                                        <Input id="middle_name" {...register('middle_name')} className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 font-bold text-slate-700" />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="last_name" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Last Name</Label>
                                        <Input id="last_name" {...register('last_name')} className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 font-bold text-slate-700" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="user_name" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Username</Label>
                                        <Input id="user_name" disabled {...register('user_name')} className="h-11 bg-slate-50 text-slate-400 font-mono border-slate-200 shadow-none cursor-not-allowed" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mobile Number</Label>
                                        <Input id="phone" {...register('phone')} placeholder="09XXXXXXXXX" className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 font-bold text-slate-700" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
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
                                        className="md:hidden text-red-600 font-bold"
                                    >
                                        Logout
                                    </Button>

                                    <Button 
                                        type="submit" 
                                        className="h-11 min-w-[140px] bg-slate-900 text-white hover:bg-orange-600 shadow-lg shadow-slate-900/20 transition-all active:scale-95 font-bold rounded-xl"
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
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
                    <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <ImageIcon className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-slate-900">Adjust Photo</DialogTitle>
                        </div>
                    </DialogHeader>
                    
                    <div className="p-6 bg-slate-50">
                        <div className="relative h-80 w-full overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-900 shadow-inner">
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
                            <Minus className="h-4 w-4 text-slate-400" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900 hover:accent-orange-600 transition-all"
                            />
                            <Plus className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-white border-t border-slate-100">
                        <Button variant="ghost" onClick={() => setIsCropDialogOpen(false)} className="font-bold text-slate-500">
                            Cancel
                        </Button>
                        <Button onClick={handleCropSave} className="bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl px-6">
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