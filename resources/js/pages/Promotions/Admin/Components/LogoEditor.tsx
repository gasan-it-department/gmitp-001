import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface LogoEditorProps {
    logo: string | null;
    setLogo: (logo: string | null) => void;
}

export default function LogoEditor({ logo, setLogo }: LogoEditorProps) {
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handlePickLogo = () => {
        logoInputRef.current?.click();
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            // CALL API TO UPLOAD THE LOGO
            // Use this to update the UI
            // if (response.success) {
            //     const file = e.target.files[0];
            //     const reader = new FileReader();
            //     reader.onload = (event) => {
            //         setLogo(event.target?.result as string);
            //     };
            //     reader.readAsDataURL(file);
            //     e.target.value = "";
            // }
            
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo(event.target?.result as string);
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        }
    };

    const handleRemoveLogo = () => {
        // CALL API TO DELETE LOGO HERE
        // Use this to clear out the logo
        // if(Response.success){
        //     setLogo(null)
        // }
        setLogo(null)
    }

    return (
        <div className="space-y-6">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={logoInputRef}
                onChange={handleLogoChange}
            />

            <Card className="p-8 shadow-md dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Logo Preview Circle */}
                    <div className="flex-shrink-0">
                        <div className="w-40 h-40 rounded-full border-4 border-white dark:border-neutral-700 shadow-xl overflow-hidden bg-gray-100 dark:bg-neutral-900 flex items-center justify-center relative group">
                            {logo ? (
                                <>
                                    <img
                                        src={logo}
                                        alt="Site Logo"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={handlePickLogo}>
                                        <span className="text-white font-medium text-sm">Change Logo</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                    <span className="text-sm font-medium">No Logo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Municipal Logo</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed max-w-md">
                                Upload your organization's official seal or logo. This image will be displayed in the website header and footer.
                                <br />
                                <span className="text-xs opacity-80">Recommended format: <b>PNG</b> with transparent background (500x500px).</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <Button onClick={handlePickLogo} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <Upload className="w-4 h-4" />
                                {logo ? "Replace Logo" : "Upload Logo"}
                            </Button>
                            {logo && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleRemoveLogo()}
                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}