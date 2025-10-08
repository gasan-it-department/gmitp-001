import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SecurityTab() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    function handleSave() {
        console.log({ currentPassword, newPassword, confirmNewPassword});
    }

    return (
        <Card className="flex flex-1 flex-col w-full h-full rounded-none shadow-sm">
            <CardHeader className="border-b bg-white px-6 py-4">
                <CardTitle className="text-2xl font-semibold">Security</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Update your password to protect your account.
                </p>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 p-8">
        
                    <div className="md:col-span-2">
                        <div className="grid gap-6">
                            <div>
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Current Password"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="new_password">New Password</Label>
                                <Input
                                    id="new_password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                                <Input
                                    id="confirm_password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            <div className="border-t bg-white px-6 py-4 flex justify-center md:justify-end">
                <Button onClick={handleSave} className="w-full md:w-auto">
                    Update password
                </Button>
            </div>
        </Card>
    );
}