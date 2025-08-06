import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import moment from "moment";

interface FormState {
  message: string;
  files: File[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComplaintPopupForm({ isOpen, onClose }: Props) {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [complainantName, setComplainantName] = useState("");
  const [purposeOfTransaction, setPurposeOfTransaction] = useState("");
  const [transactedWith, setTransactedWith] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [timeIn, setTimeIn] = useState("12:00");
  const [timeOut, setTimeOut] = useState("12:00");
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
      totalFileSize = (fileSize / (1024 * 1024));
      console.log(`New file size: ${totalFileSize}`);

      if (!updatedFiles.some((f) => f.name === file.name && f.size === file.size)) {
        updatedFiles.push(file);
      }
    });

    setFiles({ ...files, files: updatedFiles });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="
      w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
                sm:max-w-[500px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6">
        <DialogHeader>
          <DialogTitle className="p-5">Client Feedback Form</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={(e) => {
          e.preventDefault();
        }}>
          <span className="text-[12px] text-gray-700">Please let use know how we have served you. This form may be used for compliment, suggestion and/or complaint.<br />
            (Nais naming malaman kung paano po namin kayo pinag lingkuran. Maaaring gamitin ang porma na ito para sa papuri, mungkahi, at/o reklamo.)</span>
          <div>
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

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Date/Petsa:
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!date}
                  className="data-[empty=true]:text-muted-foreground w-full sm:w-1/2 justify-start text-left font-normal"
                >
                  <CalendarIcon />
                  {date ? moment(date).format("MMMM D, YYYY") : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time In */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Time In / Oras ng Pagdating:
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="time"
                step="1"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                defaultValue="11:00:00"
                className="w-full sm:w-1/2 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>

          {/* Time Out */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Time Out / Oras ng Pag-alis:
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">


              <Input
                type="time"
                step="1"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                defaultValue="12:00:00"
                className="w-full sm:w-1/2 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose of Transaction / Layunin o pakay ng transaksyon:
            </label>
            <Input
              id="purpose"
              value={purposeOfTransaction}
              onChange={(e) => setPurposeOfTransaction(e.target.value)}
              placeholder=" "
              className="placeholder-transparent w-full"
            />
          </div>

          {/* Person/Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Person or Department transacted with / Taong nakipagtransaksyon:
            </label>
            <Input
              id="person"
              value={transactedWith}
              onChange={(e) => setTransactedWith(e.target.value)}
              placeholder=" "
              className="placeholder-transparent w-full"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendation / Suggestion / Desired Action from Office:
            </label>
            <Input
              id="recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder=" "
              className="placeholder-transparent w-full"
            />
          </div>

          {/* Upload Files */}
          <div>
            <label className="block font-bold">Upload Photos or Videos</label>
            <span className="block text-xs mt-1 mb-2">
              Upload pictures and/or videos as your evidence. Max 50MB
            </span>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block cursor-pointer px-4 py-2 text-sm text-black rounded border border-gray-300 hover:bg-gray-100 transition w-fit"
            >
              Choose Files
            </label>

            <ul className="list-disc list-inside text-sm text-gray-700 max-h-32 overflow-y-auto mt-2">
              {files.files.length === 0 ? (
                <li>No files selected</li>
              ) : (
                files.files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="truncate">
                      {file.name.length > 25 ? file.name.slice(0, 25) + "..." : file.name}
                      {" "}
                      <span className="text-gray-500 text-xs">
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
                      className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1"
                      aria-label="Remove file"
                    >
                      Remove
                    </Button>

                  </li>
                ))
              )}
            </ul>

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
                  let totalFileSize = 0;
                  files.files.forEach(file => {
                    totalFileSize += file.size;
                  });
                  const totalSizeInMB = (totalFileSize / (1024 * 1024));
                  console.log(`Total file size: ${totalSizeInMB}`);
                  if (totalSizeInMB > 50) {
                    console.log("The total file size is greater than 50Mb. Please reduce files.");
                    return;
                  }
                  console.log("Submitting Form");
                  console.log(`Name: ${complainantName}`);
                  console.log(`Date: ${moment(date).format("MMMM D, yyyy")}`);
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
