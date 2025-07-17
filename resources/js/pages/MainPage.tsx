//compponets
import Modal from '@/components/custom/Modal';
import { Button } from '@/components/ui/button';

//
import { useState } from 'react';

{
    /* <img class="w-16 md:w-32 lg:w-48" src="..." /> */
}

var title = 'Municipality of Gasan';

export default function MainPage({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="h-screen w-full">
            <header className="sticky top-0 z-50 bg-white text-gray-900 shadow-md dark:bg-gray-900 dark:text-white">
                <div className="mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex w-full items-center gap-4">
                        <a className="block lg:hidden">
                            <img src="/assets/menu_icon.png" alt="Menu Bar" className="h-5 w-5" />
                        </a>
                        <div className="flex-grow text-xl font-bold" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                            Municipality of Gasan
                        </div>
                        <a className="hidden sm:block">
                            <Button onClick={() => setIsOpen(true)} variant="outline">
                                Log In
                            </Button>
                        </a>
                    </div>
                </div>
            </header>

            <main>{children}</main>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}
