import {
  SiFacebook,
  SiX,
  SiInstagram,
  SiYoutube,
} from "react-icons/si";

export default function HomeFooter() {
    return (
        <footer className="bg-gradient-to-r from-red-600 via-red-500 to-orange-400 p-6 sm:p-8">
            <div className="mx-auto max-w-screen-xl px-4 flex flex-col md:flex-row gap-8 text-white">

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
                            className="p-2 bg-white rounded-full hover:bg-red-500 transition"
                        >
                            <SiFacebook className="w-6 h-6 text-red-600 hover:text-white" />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white rounded-full hover:bg-red-500 transition"
                        >
                            <SiX className="w-6 h-6 text-red-600 hover:text-white" />
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white rounded-full hover:bg-red-500 transition"
                        >
                            <SiInstagram className="w-6 h-6 text-red-600 hover:text-white" />
                        </a>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white rounded-full hover:bg-red-500 transition"
                        >
                            <SiYoutube className="w-6 h-6 text-red-600 hover:text-white" />
                        </a>
                    </div>

                    <span className="mt-5">Barangay Dos, Gasan, Marinduque, Philippines 4905 <br/>
                    Officeofthemayor.gasan@gmail.com<br/>
                    0912-345-6789</span>
                </div>

                {/* NATIONAL AGENCIES */}
                <div className="flex flex-col items-start flex-1">
                    <span className="text-[25px] font-bold mt-8 mb-3">
                        NATIONAL AGENCIES
                    </span>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <img
                            src="assets/dilg_logo.png"
                            alt="Agency Icon"
                            className="w-20 h-16 object-contain bg-white rounded-lg p-1"
                        />
                        <img
                            src="assets/pnp_logo.png"
                            alt="Agency Icon"
                            className="w-20 h-16 object-contain bg-white rounded-lg p-1"
                        />
                    </div>
                </div>

                {/* EMERGENCY HOTLINE */}
                <div className="flex flex-col items-start flex-1">
                    <span className="text-[25px] font-bold mt-8 mb-3">
                        EMERGENCY HOTLINE
                    </span>
                    <div className="flex flex-col md:flex-col">
                        <span className="text-[14px] font-bold">MDRRMO</span>
                        <span className="text-[13px] pt-0.5 pb-0.5">0912-345-6789</span>
                        <span className="text-[13px] pt-0.5 pb-0.5">0912-345-6789</span>

                        <hr className="border-red-200 mt-3 mb-3" />

                        <span className="text-[14px] font-bold">Gasan Police Station</span>
                        <span className="text-[13px] pt-0.5 pb-0.5">0912-345-6789</span>

                        <hr className="border-red-200 mt-3 mb-3" />

                        <span className="text-[14px] font-bold">Bureau of Fire Protection</span>
                        <span className="text-[13px] pt-0.5 pb-0.5">0912-345-6789</span>
                    </div>
                </div>
            </div>

            <div className="mt-15" />

            <span className="flex flex-1 justify-center text-white text-[12px]">© 2025 All Rights Reserved | Developed by Gasan IT Section</span>
        </footer>

    );
}
