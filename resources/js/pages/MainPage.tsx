import { Button } from "@/components/ui/button"

{/* <img class="w-16 md:w-32 lg:w-48" src="..." /> */ }

var title = "Municipality of Gasan";

export default function MainPage({ children }: { children: React.ReactNode }) {

    return (
        <div className=' w-full h-screen'>
            <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md">
                <div className="mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4 w-full">
                        <a className="block lg:hidden">
                            <img src="/assets/menu_icon.png"
                                alt="Menu Bar"
                                className="w-5 h-5"
                            />
                        </a>
                        <div className="text-xl font-bold flex-grow" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>Municipality of Gasan</div>
                        <a className="hidden sm:block">
                            <Button variant="outline">Log In</Button>
                        </a>
                    </div>

                </div>
            </header>

            <main>
                {children}
            </main>

        </div>
    );
}