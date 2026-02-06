import { Link } from '@inertiajs/react';
import { SiFacebook, SiInstagram, SiX, SiYoutube } from 'react-icons/si';

export default function Footer() {
    return (
        // Updated Background: Uses 'bg-primary' (Dark Slate) instead of red gradient
        <footer className="bg-primary px-6 py-10 text-primary-foreground sm:px-8">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-10 px-4">
                {/* 1. Main Content Columns (flex-row on desktop) */}
                <div className="flex flex-col gap-10 md:flex-row md:justify-between">
                    {/* SOCIAL MEDIA & CONTACT */}
                    <div className="flex flex-1 flex-col items-start space-y-4">
                        <span className="text-lg font-bold tracking-wide uppercase">Social Media</span>
                        <div className="flex flex-row items-center gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                // Icons: Use 'bg-primary-foreground' (White) and 'text-primary' (Slate)
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform hover:scale-110"
                            >
                                <SiFacebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform hover:scale-110"
                            >
                                <SiX className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform hover:scale-110"
                            >
                                <SiInstagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform hover:scale-110"
                            >
                                <SiYoutube className="h-5 w-5" />
                            </a>
                        </div>

                        <div className="mt-4 flex flex-col space-y-1 text-sm text-primary-foreground/80">
                            <span>Barangay Dos, Gasan, Marinduque, Philippines 4905</span>
                            <a href="mailto:officeofthemayor.gasan@gmail.com" className="hover:text-white">
                                officeofthemayor.gasan@gmail.com
                            </a>
                            <a href="tel:0423421074" className="hover:text-white">
                                (042) 342-1074
                            </a>
                        </div>
                    </div>

                    {/* NATIONAL AGENCIES */}
                    <div className="flex flex-1 flex-col items-start space-y-4">
                        <span className="text-lg font-bold tracking-wide uppercase">National Agencies</span>

                        <div className="flex flex-row items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 shadow-sm">
                                <img src="/assets/republika_ng_pilipinas.png" alt="Republic of the Philippines" className="h-full w-full object-contain" />
                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-sm">
                                <img src="/assets/dilg_logo.png" alt="DILG" className="h-full w-full object-contain" />
                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 shadow-sm">
                                <img src="/assets/pnp_logo.png" alt="PNP" className="h-full w-full object-contain" />
                            </div>
                        </div>
                        
                        {/* Bagong Pilipinas Logo (Moved here for better grouping) */}
                        <div className="mt-4">
                             <img
                                src="/assets/bagong_pilipinas_logo.png"
                                alt="Bagong Pilipinas Logo"
                                className="h-16 w-16 object-contain brightness-0 invert" // Inverted to white for dark footer
                            />
                        </div>
                    </div>

                    {/* EMERGENCY HOTLINE */}
                    <div className="flex flex-1 flex-col items-start space-y-4">
                        <span className="text-lg font-bold tracking-wide uppercase">Emergency Hotlines</span>
                        <div className="flex flex-col space-y-4 text-sm">
                            <div className="flex flex-col space-y-1">
                                <span className="font-bold text-white">MDRRMO</span>
                                <a href="tel:0423320833" className="text-primary-foreground/80 hover:text-white">(042) 332-0833</a>
                                <a href="tel:09091099922" className="text-primary-foreground/80 hover:text-white">0909-109-9922 (SMART)</a>
                                <a href="tel:09190046" className="text-primary-foreground/80 hover:text-white">0919-004-6 (SMART)</a>
                            </div>

                            <div className="h-px w-full bg-primary-foreground/20" />

                            <div className="flex flex-col space-y-1">
                                <span className="font-bold text-white">Gasan Police Station</span>
                                <a href="tel:09123456789" className="text-primary-foreground/80 hover:text-white">0912-345-6789</a>
                            </div>

                            <div className="h-px w-full bg-primary-foreground/20" />

                            <div className="flex flex-col space-y-1">
                                <span className="font-bold text-white">Bureau of Fire Protection</span>
                                <a href="tel:09123456789" className="text-primary-foreground/80 hover:text-white">0912-345-6789</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-8 flex flex-col items-center justify-between border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/60 sm:flex-row">
                    <span>© 2025 All Rights Reserved | Developed by Gasan IT Section</span>
                    <Link href="/privacy-policy" className="mt-2 underline hover:text-white sm:mt-0">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}