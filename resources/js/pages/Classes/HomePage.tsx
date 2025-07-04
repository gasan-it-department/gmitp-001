
import { Link } from '@inertiajs/react';
import { useState, useEffect } from "react";
import MainPage from "../MainPage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
    return (
        <>
            <div>
                <img
                    src="/assets/banner1.png"
                    alt='Banner1'
                    className='w-full h-auto'
                />
            </div>
            {/* <div>
                <img
                    src="/assets/banner1.png"
                    alt='Banner1'
                    className='w-full h-auto'
                />
            </div> */}
            <main className="p-5">
                <aside className="mb-4">
                    <img
                        src="/assets/bp_logo.png"
                        alt="Bagong Pilipinas"
                        className="w-25 h-auto mb-2"
                    />
                    <p className="font-bold text-lg">Municipality of Gasan</p>
                </aside>

                <div className="mb-4">
                    <Link href={route('privacyPolicy')} className="hover:underline font-semibold text-sm">
                        Privacy Policy
                    </Link>
                </div>

                <nav>
                    <h6 className="text-sm font-bold mb-2">Follow on Social Media</h6>
                    <div className="flex gap-3 justify-evenly lg:justify-start">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <svg className="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M9 8H6v4h3v12h5V12h3.642l.358-4H14V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                            </svg>
                        </a>

                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <svg className="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195C17.383 2.846 16.102 2.248 14.686 2.248c-3.179 0-5.515 2.966-4.797 6.045C5.798 8.088 2.17 6.128-.259 3.149c-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616C-.04 11.388 1.595 13.522 3.963 13.997c-.693.188-1.452.232-2.224.084 1.291 1.956 3.109 3.379 5.265 3.419-2.07 1.623-4.678 2.348-7.29 2.04C3.893 22.956 6.482 23.771 9.262 23.771c9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            </svg>
                        </a>

                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                            <svg className="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16v-8l8 4-8 4z" />
                            </svg>
                        </a>

                    </div>
                </nav>

                <footer className="mt-10 text-center text-xs text-gray-500">
                    &copy; 2025 | All rights reserved
                </footer>
            </main>
        </>
    )
}

HomePage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;
