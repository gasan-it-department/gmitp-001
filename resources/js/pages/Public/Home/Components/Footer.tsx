import { Link } from "@inertiajs/react";
import {
    SiFacebook,
    SiX,
    SiInstagram,
    SiYoutube,
} from "react-icons/si";

export default function Footer() {

    return (
        <footer className="bg-gradient-to-r from-red-600 via-red-500 to-orange-400 p-6 sm:p-8">
            <div className="mx-auto max-w-screen-xl px-4 flex flex-col gap-8 text-white">

                {/* 1. Main Content Columns (flex-row on desktop) */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* SOCIAL MEDIA */}
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[25px] font-bold mt-8 mb-3">
                            SOCIAL MEDIA
                        </span>
                        <div className="flex flex-row items-center gap-6">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full"
                            >
                                <SiFacebook className="w-6 h-6 text-red-600" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full"
                            >
                                <SiX className="w-6 h-6 text-red-600" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full"
                            >
                                <SiInstagram className="w-6 h-6 text-red-600" />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full"
                            >
                                <SiYoutube className="w-6 h-6 text-red-600" />
                            </a>
                        </div>

                        <span className="mt-5">Barangay Dos, Gasan, Marinduque, Philippines 4905 <br />
                            officeofthemayor.gasan@gmail.com<br />
                            (042) 342-1074</span>
                    </div>

                    {/* NATIONAL AGENCIES */}
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[25px] font-bold mt-8 mb-3">
                            NATIONAL AGENCIES
                        </span>

                        <div className="flex flex-row items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                                <img
                                    src="assets/republika_ng_pilipinas.png"
                                    alt="Agency Icon"
                                    className="w-16 h-11 object-contain"
                                />
                            </div>

                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                                <img
                                    src="assets/dilg_logo.png"
                                    alt="Agency Icon"
                                    className="w-16 h-16 object-contain"
                                />
                            </div>

                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                                <img
                                    src="assets/pnp_logo.png"
                                    alt="Agency Icon"
                                    className="w-16 h-11 object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* EMERGENCY HOTLINE */}
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[25px] font-bold mt-8 mb-3">
                            EMERGENCY HOTLINE
                        </span>
                        <div className="flex flex-col md:flex-col">
                            <span className="text-[14px] font-bold">MDRRMO</span>
                            <a href="tel:0423320833" className="text-[13px] pt-0.5 pb-0.5 text-white">
                                (042) 332-0833
                            </a>
                            <a href="tel:09091099922" className="text-[13px] pt-0.5 pb-0.5 text-white">
                                09091099922 - SMART
                            </a>
                            <a href="tel:09190046" className="text-[13px] pt-0.5 pb-0.5 text-white">
                                09190046 - SMART
                            </a>

                            <hr className="border-red-200 mt-3 mb-3" />

                            <span className="text-[14px] font-bold">Gasan Police Station</span>
                            <a href="tel:09123456789" className="text-[13px] pt-0.5 pb-0.5 text-white">
                                0912-345-6789
                            </a>

                            <hr className="border-red-200 mt-3 mb-3" />

                            <span className="text-[14px] font-bold">Bureau of Fire Protection</span>
                            <a href="tel:09123456789" className="text-[13px] pt-0.5 pb-0.5 text-white">
                                0912-345-6789
                            </a>
                        </div>
                    </div>

                    {/* 2. New Centered Logo Section */}
                    <div className="flex justify-center mt-10">
                        <img
                            src="assets/bagong_pilipinas_logo.png"
                            alt="Bagong Pilipinas Logo"
                            height={55}
                            width={55}
                            className="w-16 h-16" // Added utility classes for consistent sizing
                        />
                    </div>
                </div>
            </div>

            {/* 3. Footer Bottom Text */}
            <div className="mt-15" /> {/* The original spacing div */}

            <span className="flex flex-1 justify-center text-white text-[12px]">© 2025 All Rights Reserved | Developed by Gasan IT Section</span>
            <div className="flex flex-row">
                <Link href="/privacy-policy" className="flex flex-1 justify-center text-white text-[12px] underline">Privacy Policy</Link>
            </div>
        </footer>
    );
}
