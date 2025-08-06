import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface FormState {
    message: string;
    files: File[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRequestDialog({ isOpen, onClose }: Props) {
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [complainantName, setComplainantName] = useState("");
    const [purposeOfTransaction, setPurposeOfTransaction] = useState("");
    const [transactedWith, setTransactedWith] = useState("");
    const [recommendation, setRecommendation] = useState("");
    const [timeIn, setTimeIn] = useState("12:00");
    const [timeOut, setTimeOut] = useState("12:00");
    let totalFileSize = 0.0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="
      w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
                sm:max-w-[700px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6">
                <DialogHeader>
                    <DialogTitle className="p-5">Action Center Request Form</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-6" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <span className="text-[12px] text-gray-700">Please let use know how we have served you. This form may be used for compliment, suggestion and/or complaint.<br />
                        (Nais naming malaman kung paano po namin kayo pinag lingkuran. Maaaring gamitin ang porma na ito para sa papuri, mungkahi, at/o reklamo.)</span>

                    <span className="text-[18px] font-bold">CLIENT'S INFORMATION</span>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name/Pangalan:
                            </label>
                            <Input
                                id="name"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Age/Edad:
                            </label>
                            <Input
                                id="name"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact number:
                            </label>
                            <Input
                                id="name"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address:
                            </label>
                            <Input
                                id="name"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assistance needed:
                        </label>
                        <Input
                            id="name"
                            value={complainantName}
                            onChange={(e) => setComplainantName(e.target.value)}
                            placeholder=" "
                            className="placeholder-transparent w-full" disabled

                        />
                    </div>

                    <span className="text-[18px] font-bold">PATIENT'S INFORMATION</span>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name/Pangalan:
                            </label>
                            <Input
                                id="name"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Age/Edad:
                            </label>
                            <Input
                                id="name"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address:
                        </label>
                        <Input
                            id="name"
                            value={complainantName}
                            onChange={(e) => setComplainantName(e.target.value)}
                            placeholder=" "
                            className="placeholder-transparent w-full"
                        />
                    </div>

                    <div className="mt-5 mb-5 flex gap-2">
                        <Button
                            variant="outline"
                            className="w-full basis-1/2"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="w-full basis-1/2"
                            onClick={() => {

                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}