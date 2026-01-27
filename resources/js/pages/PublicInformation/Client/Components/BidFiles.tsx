import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { FileText, Download, Eye, Files } from "lucide-react";

interface AwardFile {
    id: number;
    name: string;
    type: string;
    view_url: string;
    download_url: string;
}

interface BidFilesProps {
    isOpen: boolean;
    onClose: () => void;
    files: AwardFile[];
    projectName: string;
}

export default function BidFiles({ isOpen, onClose, files, projectName }: BidFilesProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                {/* Header with Gradient and Project Name */}
                <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                    <div className="space-y-1 items-start justify-items-start">
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                            <FileText className="h-5 w-5" />
                            Bid Documents
                        </DialogTitle>
                        {/* Project Name Subtitle */}
                        <p className="text-orange-100 text-sm font-medium line-clamp-1">
                            Project: {projectName}
                        </p>
                    </div>
                </DialogHeader>
                <DialogDescription />

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {files.length > 0 ? (
                        <ul className="space-y-3">
                            {files.map((file, index) => {

                                return (
                                    <li
                                        key={index}
                                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-orange-50/30"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="rounded-md bg-white p-2 shadow-sm">
                                                <FileText className="h-4 w-4 text-orange-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="truncate text-sm font-medium text-gray-700 text-[14px] p-1">
                                                    {file.name}
                                                </span>
                                                <span className="truncate text-gray-700 text-[10px] p-1">
                                                    {file.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                <a href={file.view_url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>

                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-green-600 hover:bg-green-50">
                                                <a href={file.download_url} download={file.name}>
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="mb-4 rounded-full bg-gray-100 p-4">
                                <Files className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No documents found for this bid.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end bg-gray-50 px-6 py-4">
                    <Button variant="outline" className="px-8" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}