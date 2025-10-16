import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import React, { useEffect } from "react";
import { useState } from "react";
import ClassicDialog from "@/pages/Utility/ClassicDialog";
import axios from "@/lib/axios";

export default function ProfileTab() {
    const [userFirstName, setUserFirstName] = useState("");
    const [userMiddleName, setUserMiddleName] = useState("");
    const [userLastName, setUserLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [userMobileNumber, setUserMobileNumber] = useState("");
    const [userAvatarURL, setUserAvatarURL] = useState<string | null>(null);
    const { auth } = usePage<SharedData>().props;
    const [classicDialogTitle, setClassicDialogTitle] = useState("");
    const [classicDialogMessage, setClassicDialogMessage] = useState("");
    const [classicDialogOpen, setClassicDialogOpen] = useState(false);
    const [clcassicDialogPositiveButtonText, setClassicDialogPositiveButtonText] = useState("Cancel");
    const [classicDialogNegativeButtonText, setClassicDialogNegativeButtonText] = useState("Ok")
    const [currentAction, setCurrentAction] = useState<"remove-avatar" | "logout" | null>(null);

    useEffect(() => {
        setUserFirstName("Sample First Name");
        setUserMiddleName("Sample Middle Name");
        setUserLastName("Sample Last Name");
        setUserName(auth.user?.user_name || "");
        setUserMobileNumber(auth.user?.phone || "");
        setUserAvatarURL(auth.user?.avatar || null);
    }, [auth.user]);


    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setUserAvatarURL(url);
    }

    function handleSave() {
        console.log({ userFirstName, userMiddleName, userLastName, userName, userMobileNumber, avatarPreview: userAvatarURL });
    }

    const handleLogout = async () => {
        try {
            const response = await axios.post('/logout');
            window.location.href = response.data.redirect;
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Card className="flex flex-1 flex-col w-full h-full rounded-none shadow-sm">
            <CardHeader className="border-b bg-white px-6 py-4">
                <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Update your personal information.
                </p>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 p-8">
                    <div className="flex flex-col items-center gap-4 md:items-start md:col-span-1">
                        <div className="relative flex flex-col items-center">
                            <Avatar className="h-32 w-32 ring-2 ring-gray-200">
                                <AvatarImage
                                    src={userAvatarURL || "https://www.gravatar.com/avatar/?d=mp"}
                                    alt="avatar"
                                />
                            </Avatar>

                            <div className="flex fleex-row gap-2 mt-6">
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

                                <Button className="h-7 text-[12px]"
                                    onClick={() => {
                                        setClassicDialogTitle("Remove Avatar");
                                        setClassicDialogMessage("Are you sure you want to remove your avatar?");
                                        setClassicDialogPositiveButtonText("Remove");
                                        setClassicDialogNegativeButtonText("Cancel");
                                        setCurrentAction("remove-avatar");
                                        setClassicDialogOpen(true);
                                    }}>
                                    Remove
                                </Button>

                            </div>
                        </div>
                        <p className="text-center md:text-left text-[10px] text-muted-foreground">
                            Recommended: 240×240 • JPG/PNG
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <div className="grid gap-6">
                            <div>
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={userFirstName}
                                    onChange={(e) => setUserFirstName(e.target.value)}
                                    placeholder="First Name"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="middle_name">Last Name</Label>
                                <Input
                                    id="middle_name"
                                    value={userMiddleName}
                                    onChange={(e) => setUserMiddleName(e.target.value)}
                                    placeholder="Middle Name"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="last_name">Middle Name</Label>
                                <Input
                                    id="last_name"
                                    value={userLastName}
                                    onChange={(e) => setUserLastName(e.target.value)}
                                    placeholder="Last Name"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="user_name">Username</Label>
                                <Input
                                    disabled
                                    id="user_name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Username"
                                    className="mt-1 bg-gray-100"
                                />
                            </div>

                            <div>
                                <Label htmlFor="mobile_number">Mobile Number</Label>
                                <Input
                                    id="mobile_number"
                                    value={userMobileNumber}
                                    onChange={(e) => setUserMobileNumber(e.target.value)}
                                    placeholder="09XXXXXXXXX"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <ClassicDialog
                    title={classicDialogTitle}
                    message={classicDialogMessage}
                    hideNegativeButton={false}
                    negativeButtonText={classicDialogNegativeButtonText}
                    positiveButtonText={clcassicDialogPositiveButtonText}
                    onNegativeClick={() => {
                        setClassicDialogOpen(false);
                    }}

                    onPositiveClick={() => {
                        setClassicDialogOpen(false);
                        switch (currentAction) {
                            case "logout":
                                handleLogout();
                                break;
                            case "remove-avatar":
                                setUserAvatarURL(null);
                                break;
                        }
                    }}

                    open={classicDialogOpen} />
            </CardContent>

            <div className="border-t bg-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-end gap-2 w-full">
                <Button onClick={handleSave} className="w-full md:w-auto">
                    Save changes
                </Button>

                <Button
                    onClick={() => {
                        setClassicDialogTitle("Confirm Logout");
                        setClassicDialogMessage("Are you sure you want to logout?");
                        setClassicDialogPositiveButtonText("Logout");
                        setClassicDialogNegativeButtonText("Cancel");
                        setCurrentAction("logout");
                        setClassicDialogOpen(true);
                    }}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white"
                >
                    Logout
                </Button>
            </div>
        </Card>
    );
}