import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';

interface FormState {
    message: string;
    files: File[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ComplaintPopupForm({ isOpen, onClose }: Props) {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [complainantName, setComplainantName] = useState('');
    const [purposeOfTransaction, setPurposeOfTransaction] = useState('');
    const [transactedWith, setTransactedWith] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [timeIn, setTimeIn] = useState('12:00');
    const [timeOut, setTimeOut] = useState('12:00');
    let totalFileSize = 0.0;

    const [files, setFiles] = useState<FormState>({
        message: '',
        files: [],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const updatedFiles = [...files.files];

        selectedFiles.forEach((file) => {
            let fileSize = 0;
            fileSize += file.size;
            totalFileSize = fileSize / (1024 * 1024);
            console.log(`New file size: ${totalFileSize}`);

            if (!updatedFiles.some((f) => f.name === file.name && f.size === file.size)) {
                updatedFiles.push(file);
            }
        });

        setFiles({ ...files, files: updatedFiles });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="scrollbar-hide m-0 h-screen w-full max-w-none overflow-y-auto rounded-none p-4 sm:m-auto sm:h-auto sm:max-w-[700px] sm:rounded-lg lg:h-5/6"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-center text-[21px]">Client Feedback Form</DialogTitle>
                </DialogHeader>
                <form
                    className="flex flex-col gap-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <span className="text-[12px] text-gray-700">
                        Please let use know how we have served you. This form may be used for compliment, suggestion and/or complaint.
                        <br />
                        (Nais naming malaman kung paano po namin kayo pinag lingkuran. Maaaring gamitin ang porma na ito para sa papuri, mungkahi,
                        at/o reklamo.)
                    </span>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Name/Pangalan:</label>
                        <Input
                            id="name"
                            value={complainantName}
                            onChange={(e) => setComplainantName(e.target.value)}
                            placeholder=" "
                            className="w-full placeholder-transparent"
                        />
                    </div>

                    <div>
                        <Label className="mb-1 block text-sm font-medium text-gray-700">Date/Petsa:</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-empty={!date}
                                    className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground sm:w-1/2"
                                >
                                    <CalendarIcon />
                                    {date ? moment(date).format('MMMM D, YYYY') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <Label className="mb-1 block text-sm font-medium text-gray-700">Time In / Oras ng Pagdating:</Label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                type="time"
                                step="1"
                                value={timeIn}
                                onChange={(e) => setTimeIn(e.target.value)}
                                defaultValue="11:00:00"
                                className="w-full appearance-none bg-background sm:w-1/2 [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="mb-1 block text-sm font-medium text-gray-700">Time Out / Oras ng Pag-alis:</Label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                type="time"
                                step="1"
                                value={timeOut}
                                onChange={(e) => setTimeOut(e.target.value)}
                                defaultValue="12:00:00"
                                className="w-full appearance-none bg-background sm:w-1/2 [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Purpose of Transaction / Layunin o pakay ng transaksyon:
                        </label>
                        <Input
                            id="purpose"
                            value={purposeOfTransaction}
                            onChange={(e) => setPurposeOfTransaction(e.target.value)}
                            placeholder=" "
                            className="w-full placeholder-transparent"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Person or Department transacted with / Taong nakipagtransaksyon:
                        </label>
                        <Input
                            id="person"
                            value={transactedWith}
                            onChange={(e) => setTransactedWith(e.target.value)}
                            placeholder=" "
                            className="w-full placeholder-transparent"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Recommendation / Suggestion / Desired Action from Office:
                        </label>
                        <Textarea
                            id="recommendation"
                            value={recommendation}
                            onChange={(e) => setRecommendation(e.target.value)}
                            placeholder=" "
                            className="w-full placeholder-transparent"
                            rows={4} // Optional: controls height
                        />
                    </div>

                    <div>
                        <label className="block font-bold">Upload Photos or Videos</label>
                        <span className="mt-1 mb-2 block text-xs">Upload pictures and/or videos as your evidence. Max 50MB</span>

                        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                        <label
                            htmlFor="file-upload"
                            className="inline-block w-fit cursor-pointer rounded border border-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-100"
                        >
                            Choose Files
                        </label>

                        <ul className="mt-2 max-h-32 list-inside list-disc overflow-y-auto text-sm text-gray-700">
                            {files.files.length === 0 ? (
                                <li>No files selected</li>
                            ) : (
                                files.files.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between">
                                        <span className="truncate">
                                            {file.name.length > 25 ? file.name.slice(0, 25) + '...' : file.name}{' '}
                                            <span className="text-xs text-gray-500">
                                                (
                                                {file.size >= 1048576
                                                    ? `${(file.size / 1048576).toFixed(2)} MB`
                                                    : `${(file.size / 1024).toFixed(2)} KB`}
                                                )
                                            </span>
                                        </span>

                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                const newFiles = [...files.files];
                                                newFiles.splice(index, 1);
                                                setFiles({ ...files, files: newFiles });
                                                totalFileSize -= file.size;
                                                console.log(``);
                                            }}
                                            className="ml-2 px-2 py-1 text-xs text-red-500 hover:text-red-700"
                                            aria-label="Remove file"
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                ))
                            )}
                        </ul>

                        <div className="mt-5 mb-5 flex flex-row gap-2 sm:justify-end">
                            <Button variant="outline" className="basis-1/2 sm:w-auto sm:basis-auto" onClick={onClose}>
                                Cancel
                            </Button>

                            <Button
                                className="basis-1/2 sm:w-auto sm:basis-auto"
                                onClick={() => {
                                    let totalFileSize = 0;
                                    files.files.forEach((file) => {
                                        totalFileSize += file.size;
                                    });
                                    const totalSizeInMB = totalFileSize / (1024 * 1024);
                                    console.log(`Total file size: ${totalSizeInMB}`);
                                    if (totalSizeInMB > 50) {
                                        console.log('The total file size is greater than 50Mb. Please reduce files.');
                                        return;
                                    }
                                    console.log('Submitting Form');
                                    console.log(`Name: ${complainantName}`);
                                    console.log(`Date: ${moment(date).format('MMMM D, yyyy')}`);
                                    console.log(`Time in: ${timeIn}`);
                                    console.log(`Time out: ${timeOut}`);
                                    console.log(`Purpose: ${purposeOfTransaction}`);
                                    console.log(`Transacted with: ${transactedWith}`);
                                    console.log(`Recommendation: ${recommendation}`);
                                    console.log(`Files count: ${files.files.length}`);
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
