import Utility from '@/pages/Utility/Utility';
import { Link } from '@inertiajs/react';
import { SiFacebook, SiInstagram, SiX, SiYoutube } from 'react-icons/si';

export default function Footer() {
    // Retrieve App Version (configured in vite.config.js)
    const appVersion = Utility().getCurrentWebsiteVersion();

    return (
        <footer className="bg-primary px-6 py-12 text-primary-foreground sm:px-8 border-t-[6px] border-primary-foreground/10">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-12 px-4">
                
                {/* 1. Main Content Columns */}
                <div className="flex flex-col gap-10 md:flex-row md:justify-between">
                    
                    {/* COLUMN 1: SOCIAL MEDIA & CONTACT */}
                    <div className="flex flex-1 flex-col items-start space-y-6">
                        <div className="space-y-2">
                            <span className="text-lg font-black uppercase tracking-widest">Connect With Us</span>
                            <div className="h-1 w-12 bg-primary-foreground/30 rounded-full" />
                        </div>
                        
                        <div className="flex flex-row items-center gap-3">
                            {[
                                { icon: SiFacebook, href: "https://facebook.com", label: "Facebook" },
                                { icon: SiX, href: "https://twitter.com", label: "X (Twitter)" },
                                { icon: SiInstagram, href: "https://instagram.com", label: "Instagram" },
                                { icon: SiYoutube, href: "https://youtube.com", label: "YouTube" },
                            ].map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={item.label}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground transition-all hover:bg-primary-foreground hover:text-primary hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <item.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>

                        <div className="flex flex-col space-y-2 text-sm font-medium text-primary-foreground/70">
                            <p className="leading-relaxed">
                                Municipal Hall, Barangay Dos,<br />
                                Gasan, Marinduque, Philippines 4905
                            </p>
                            <a href="mailto:officeofthemayor.gasan@gmail.com" className="hover:text-white transition-colors hover:underline decoration-1 underline-offset-4">
                                officeofthemayor.gasan@gmail.com
                            </a>
                            <a href="tel:0423421074" className="hover:text-white transition-colors hover:underline decoration-1 underline-offset-4">
                                (042) 342-1074
                            </a>
                        </div>
                    </div>

                    {/* COLUMN 2: NATIONAL AGENCIES */}
                    <div className="flex flex-1 flex-col items-start space-y-6">
                        <div className="space-y-2">
                            <span className="text-lg font-black uppercase tracking-widest">Partners</span>
                            <div className="h-1 w-12 bg-primary-foreground/30 rounded-full" />
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Standard Logos */}
                            {[
                                { src: "/assets/republika_ng_pilipinas.png", alt: "Republic of the Philippines" },
                                { src: "/assets/dilg_logo.png", alt: "DILG" },
                                { src: "/assets/pnp_logo.png", alt: "PNP" },
                            ].map((logo, idx) => (
                                <div key={idx} className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 shadow-md transition-transform hover:scale-105">
                                    <img src={logo.src} alt={logo.alt} className="h-full w-full object-contain" />
                                </div>
                            ))}
                        </div>
                        
                        {/* Bagong Pilipinas (Original Color) */}
                        <div className="mt-2 transition-transform hover:scale-105">
                             <img
                                src="/assets/bagong_pilipinas_logo.png"
                                alt="Bagong Pilipinas Logo"
                                // Removed 'brightness-0 invert' to show original colors
                                className="h-14 w-auto object-contain" 
                            />
                        </div>
                    </div>

                    {/* COLUMN 3: EMERGENCY HOTLINE */}
                    <div className="flex flex-1 flex-col items-start space-y-6">
                        <div className="space-y-2">
                            <span className="text-lg font-black uppercase tracking-widest text-red-300">Emergency</span>
                            <div className="h-1 w-12 bg-red-400/50 rounded-full" />
                        </div>

                        <div className="flex flex-col space-y-5 text-sm w-full">
                            
                            {/* MDRRMO */}
                            <div className="group space-y-1">
                                <span className="block text-xs font-black uppercase tracking-widest text-primary-foreground/60 group-hover:text-primary-foreground transition-colors">MDRRMO</span>
                                <div className="flex flex-col gap-1 font-bold text-lg">
                                    <a href="tel:0423320833" className="hover:text-red-300 transition-colors">(042) 332-0833</a>
                                    <a href="tel:09091099922" className="text-sm font-medium text-primary-foreground/80 hover:text-white">0909-109-9922 (SMART)</a>
                                    <a href="tel:09190046" className="text-sm font-medium text-primary-foreground/80 hover:text-white">0919-004-6 (SMART)</a>
                                </div>
                            </div>

                            <div className="h-px w-full bg-primary-foreground/10" />

                            {/* PNP */}
                            <div className="group space-y-1">
                                <span className="block text-xs font-black uppercase tracking-widest text-primary-foreground/60 group-hover:text-primary-foreground transition-colors">Gasan Police</span>
                                <a href="tel:09123456789" className="block text-lg font-bold hover:text-red-300 transition-colors">0912-345-6789</a>
                            </div>

                            <div className="h-px w-full bg-primary-foreground/10" />

                            {/* BFP */}
                            <div className="group space-y-1">
                                <span className="block text-xs font-black uppercase tracking-widest text-primary-foreground/60 group-hover:text-primary-foreground transition-colors">Fire Protection</span>
                                <a href="tel:09123456789" className="block text-lg font-bold hover:text-red-300 transition-colors">0912-345-6789</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 text-[10px] sm:text-xs font-medium uppercase tracking-wide text-primary-foreground/50 sm:flex-row">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-left">
                        <span>© {new Date().getFullYear()} All Rights Reserved</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Developed by Gasan IT Section</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        
                        {/* APP VERSION DISPLAY */}
                        <div className="rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[9px] font-mono text-primary-foreground/70">
                            Version: {appVersion}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}