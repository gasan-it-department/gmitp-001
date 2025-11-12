import { Link } from '@inertiajs/react';
import { SiFacebook, SiInstagram, SiX, SiYoutube } from 'react-icons/si';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-red-600 via-red-500 to-orange-400 p-6 sm:p-8">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 text-white">
                {/* 1. Main Content Columns (flex-row on desktop) */}
                <div className="flex flex-col gap-8 md:flex-row">
                    {/* SOCIAL MEDIA */}
                    <div className="flex flex-1 flex-col items-start">
                        <span className="mt-8 mb-3 text-[25px] font-bold">SOCIAL MEDIA</span>
                        <div className="flex flex-row items-center gap-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-full bg-white p-2">
                                <SiFacebook className="h-6 w-6 text-red-600" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-full bg-white p-2">
                                <SiX className="h-6 w-6 text-red-600" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-full bg-white p-2">
                                <SiInstagram className="h-6 w-6 text-red-600" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="rounded-full bg-white p-2">
                                <SiYoutube className="h-6 w-6 text-red-600" />
                            </a>
                        </div>

                        <span className="mt-5">
                            Barangay Dos, Gasan, Marinduque, Philippines 4905 <br />
                            officeofthemayor.gasan@gmail.com
                            <br />
                            (042) 342-1074
                        </span>
                    </div>

                    {/* NATIONAL AGENCIES */}
                    <div className="flex flex-1 flex-col items-start">
                        <span className="mt-8 mb-3 text-[25px] font-bold">NATIONAL AGENCIES</span>

                        <div className="flex flex-row items-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                                <img src="/assets/republika_ng_pilipinas.png" alt="Agency Icon" className="h-11 w-16 object-contain" />
                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                                <img src="/assets/dilg_logo.png" alt="Agency Icon" className="h-16 w-16 object-contain" />
                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                                <img src="/assets/pnp_logo.png" alt="Agency Icon" className="h-11 w-16 object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* EMERGENCY HOTLINE */}
                    <div className="flex flex-1 flex-col items-start">
                        <span className="mt-8 mb-3 text-[25px] font-bold">EMERGENCY HOTLINE</span>
                        <div className="flex flex-col md:flex-col">
                            <span className="text-[14px] font-bold">MDRRMO</span>
                            <a href="tel:0423320833" className="pt-0.5 pb-0.5 text-[13px] text-white">
                                (042) 332-0833
                            </a>
                            <a href="tel:09091099922" className="pt-0.5 pb-0.5 text-[13px] text-white">
                                09091099922 - SMART
                            </a>
                            <a href="tel:09190046" className="pt-0.5 pb-0.5 text-[13px] text-white">
                                09190046 - SMART
                            </a>

                            <hr className="mt-3 mb-3 border-red-200" />

                            <span className="text-[14px] font-bold">Gasan Police Station</span>
                            <a href="tel:09123456789" className="pt-0.5 pb-0.5 text-[13px] text-white">
                                0912-345-6789
                            </a>

                            <hr className="mt-3 mb-3 border-red-200" />

                            <span className="text-[14px] font-bold">Bureau of Fire Protection</span>
                            <a href="tel:09123456789" className="pt-0.5 pb-0.5 text-[13px] text-white">
                                0912-345-6789
                            </a>
                        </div>
                    </div>

                    {/* 2. New Centered Logo Section */}
                    <div className="mt-10 flex justify-center">
                        <img
                            src="/assets/bagong_pilipinas_logo.png"
                            alt="Bagong Pilipinas Logo"
                            height={55}
                            width={55}
                            className="h-16 w-16" // Added utility classes for consistent sizing
                        />
                    </div>
                </div>
            </div>
            {/* 3. Footer Bottom Text */}
            <div className="mt-15" /> {/* The original spacing div */}
            <span className="flex flex-1 justify-center text-[12px] text-white">© 2025 All Rights Reserved | Developed by Gasan IT Section</span>
            <div className="flex flex-row">
                <Link href="/privacy-policy" className="flex flex-1 justify-center text-[12px] text-white underline">
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
}
