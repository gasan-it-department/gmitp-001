import { Dialog, DialogContent, DialogClose, DialogPortal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
    viewing_url: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ImageViewerDialog({ viewing_url, open, onOpenChange }: Props) {
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });

    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
        setDragging(true);
        if ("touches" in e) {
            dragStart.current = {
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y,
            };
        } else {
            dragStart.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
        }
    };

    const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragging) return;
        if ("touches" in e) {
            setPosition({
                x: e.touches[0].clientX - dragStart.current.x,
                y: e.touches[0].clientY - dragStart.current.y,
            });
        } else {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y,
            });
        }
    };

    const endDrag = () => setDragging(false);

    useEffect(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogContent className="fixed flex items-center justify-center p-4">
                    <div
                        className="relative max-h-[90vw] w-[90vh] max-w-[70vw] h-[70vh] bg-white rounded-lg flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Controls */}
                        <div className="flex items-center justify-between p-3 border-b bg-white">
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                        setZoom(1);
                                        setPosition({ x: 0, y: 0 });
                                    }}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Draggable Image */}
                        <div
                            className="flex-1 overflow-auto cursor-grab bg-white flex items-center justify-center"
                            onMouseDown={startDrag}
                            onMouseMove={onDrag}
                            onMouseUp={endDrag}
                            onMouseLeave={endDrag}
                            onTouchStart={startDrag}
                            onTouchMove={onDrag}
                            onTouchEnd={endDrag}
                        >
                            <div
                                className="inline-block"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                    transformOrigin: "center center",
                                }}
                            >
                                {viewing_url && (
                                    <img
                                        src={viewing_url}
                                        alt="Preview"
                                        draggable={false}
                                        className="block max-w-[90vw] max-h-[90vh] object-contain select-none"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
