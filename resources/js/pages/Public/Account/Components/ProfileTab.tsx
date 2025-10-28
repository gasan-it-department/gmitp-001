import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import ClassicDialog from "@/pages/Utility/ClassicDialog";
import axios from "@/lib/axios";
import Cropper from "react-easy-crop";

type ProfileFormData = {
    first_name: string;
    middle_name: string;
    last_name: string;
    user_name: string;
    phone: string;
};

export default function ProfileTab() {
    const { auth } = usePage<SharedData>().props;

    // Cropper states
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [userAvatarURL, setUserAvatarURL] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // Dialogs
    const [classicDialog, setClassicDialog] = useState({
        title: "No title",
        message: "No message",
        isOpen: false,
        positiveButtonText: "Ok",
        negativeButtonText: "Cancel",
        isNegativeButtonVisible: false,
        currentAction: ""
    });

    // React Hook Form
    const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>({
        defaultValues: {
            first_name: "",
            middle_name: "",
            last_name: "",
            user_name: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (auth.user) {
            setValue("first_name", auth.user.first_name || "Sample First Name");
            setValue("middle_name", auth.user.middle_name || "Sample Middle Name");
            setValue("last_name", auth.user.last_name || "Sample Last Name");
            setValue("user_name", auth.user.user_name || "");
            setValue("phone", auth.user.phone || "");
            setUserAvatarURL(auth.user.avatar || null);
        }
    }, [auth.user, setValue]);

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);

        // UPLOAD IMAGE TO DATABASE FOR URL

        // THEN SAVE THE UPLOADED IMAGE URL TO THIS.
        setUserAvatarURL(null);
    }, []);

    const getCroppedImage = useCallback(async () => {
        if (!selectedImage || !croppedAreaPixels) return null;
        const image = await createImage(selectedImage);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const { width, height, x, y } = croppedAreaPixels;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        return new Promise<string>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(URL.createObjectURL(blob));
            }, "image/png");
        });
    }, [selectedImage, croppedAreaPixels]);

    async function handleCropSave() {
        const croppedImgUrl = await getCroppedImage();
        if (croppedImgUrl) {
            setUserAvatarURL(croppedImgUrl);
        }
        setIsCropDialogOpen(false);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSelectedImage(url);
        setIsCropDialogOpen(true);
    }

    const onSubmit = async (data: ProfileFormData) => {
        console.log({
            ...data,
            avatarPreview: userAvatarURL,
        });

        // UPDATE USER PROFILE DATA / SEND TO BACKEND.
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post("/logout");
            window.location.href = response.data.redirect;
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <Card className="flex flex-1 flex-col w-full h-full rounded-none shadow-sm">
            <CardHeader className="border-b bg-white px-6 py-4">
                <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
                <p className="text-sm text-muted-foreground">Update your personal information.</p>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 p-8">
                        {/* AVATAR SECTION */}
                        <div className="flex flex-col items-center gap-4 md:items-start md:col-span-1">
                            <div className="relative flex flex-col items-center">
                                <Avatar className="h-32 w-32 ring-2 ring-gray-200">
                                    <AvatarImage
                                        src={userAvatarURL || "https://www.gravatar.com/avatar/?d=mp"}
                                        alt="avatar"
                                    />
                                </Avatar>

                                <div className="flex flex-row gap-2 mt-6">
                                    <Button className="h-7 text-[12px] flex items-center justify-center">
                                        <label className="flex cursor-pointer items-center justify-center w-full h-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            Upload
                                        </label>
                                    </Button>

                                    <Button
                                        className="h-7 text-[12px]"
                                        onClick={() => {
                                            setClassicDialog((prev) => ({
                                                ...prev,
                                                title: "Remove Avatar",
                                                message: "Are you sure you want to remove your avatar?",
                                                negativeButtonText: "Cancel",
                                                positiveButtonText: "Remove",
                                                isNegativeButtonVisible: true,
                                                currentAction: "remove-avatar",
                                                isOpen: true
                                            }));
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                            <p className="text-center md:text-left text-[10px] text-muted-foreground">
                                Recommended: 240×240 • JPG/PNG
                            </p>
                        </div>

                        {/* FORM SECTION */}
                        <div className="md:col-span-2">
                            <div className="grid gap-6">
                                <div>
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" {...register("first_name")} className="mt-1" />
                                </div>

                                <div>
                                    <Label htmlFor="middle_name">Middle Name</Label>
                                    <Input id="middle_name" {...register("middle_name")} className="mt-1" />
                                </div>

                                <div>
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" {...register("last_name")} className="mt-1" />
                                </div>

                                <div>
                                    <Label htmlFor="user_name">Username</Label>
                                    <Input
                                        id="user_name"
                                        disabled
                                        {...register("user_name")}
                                        className="mt-1 bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Mobile Number</Label>
                                    <Input id="phone" {...register("phone")} placeholder="09XXXXXXXXX" className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Dialog */}
                    <ClassicDialog
                        title={classicDialog.title}
                        message={classicDialog.message}
                        hideNegativeButton={!classicDialog.isNegativeButtonVisible}
                        negativeButtonText={classicDialog.negativeButtonText}
                        positiveButtonText={classicDialog.positiveButtonText}
                        onNegativeClick={() => setClassicDialog((prev) => ({
                            ...prev,
                            isOpen: false
                        }))}
                        onPositiveClick={() => {
                            setClassicDialog((prev) => ({
                                ...prev,
                                isOpen: false
                            }))

                            switch (classicDialog.currentAction) {
                                case "logout":
                                    handleLogout();
                                    break;
                                case "remove-avatar":
                                    setUserAvatarURL(null);
                                    break;
                            }
                        }}
                        open={classicDialog.isOpen}
                    />

                    {/* Cropper Dialog */}
                    {isCropDialogOpen && (
                        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-4 w-[90%] max-w-md flex flex-col items-center gap-4">
                                <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                                    <Cropper
                                        image={selectedImage!}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                    />
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCropSave}>Apply</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="border-t bg-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-end gap-2 w-full">
                        <Button
                            type="submit"
                            className="w-full md:w-auto"
                            onClick={() => {

                            }}
                        >
                            Save changes
                        </Button>

                        <Button
                            type="button"
                            onClick={() => {
                                setClassicDialog((prev) => ({
                                    ...prev,
                                    title: "Confirm Logout",
                                    message: "Are you sure you want to logout?",
                                    negativeButtonText: "Cancel",
                                    positiveButtonText: "Logout",
                                    isNegativeButtonVisible: true,
                                    currentAction: "logout",
                                    isOpen: true
                                }));
                            }}
                            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white"
                        >
                            Logout
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* Helper for cropper image creation */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });
}
