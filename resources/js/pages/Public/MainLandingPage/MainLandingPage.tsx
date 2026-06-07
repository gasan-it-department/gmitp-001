import LandingPageHeroBanner from '@/pages/Public/MainLandingPage/Components/LandingPageHeroBanner';
import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone, Shield } from 'lucide-react';

export default function MainLandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#f8faf9] font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
            {/* Top Bar */}
            <div className="bg-[#163832] px-4 py-2 text-xs text-white sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Opisyal na Portal ng Mamamayan ng Marinduque</span>
                        <span className="sm:hidden">Citizen Portal</span>
                    </div>
                    <div className="hidden items-center gap-4 font-medium sm:flex">
                        <a href="#municipalities" className="transition-colors hover:text-[#f4c95d]">
                            Mga Bayan
                        </a>
                        <a href="#services" className="transition-colors hover:text-[#f4c95d]">
                            Serbisyo
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-[#d9e2df] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png"
                            alt="Marinduque Logo"
                            className="h-10 w-10 object-contain drop-shadow-sm"
                        />
                        <div>
                            <h1 className="text-lg leading-none font-black tracking-tight text-foreground">GMITP</h1>
                            <p className="text-[10px] font-bold tracking-wider text-[#4d675f] uppercase">Municipality Citizen Portal</p>
                        </div>
                    </div>
                    <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold text-[#38524b] md:flex">
                        <a href="#municipalities" className="transition-colors hover:text-[#163832]">
                            Mga Bayan
                        </a>
                        <a href="#services" className="transition-colors hover:text-[#163832]">
                            Digital Services
                        </a>
                        <a href="#contact" className="transition-colors hover:text-[#163832]">
                            Kontak
                        </a>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                <LandingPageHeroBanner />
            </main>

            {/* Footer */}
            <footer id="contact" className="border-t border-[#d9e2df] bg-white text-card-foreground">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <div className="mb-4 flex items-center gap-3">
                                <img
                                    src="https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png"
                                    alt="Marinduque Logo"
                                    className="h-12 w-12 object-contain opacity-80 grayscale"
                                />
                                <div>
                                    <h2 className="text-lg font-bold">GMITP</h2>
                                    <p className="text-xs text-muted-foreground">Municipality Citizen Portal</p>
                                </div>
                            </div>
                            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Simple, ligtas, at bukas na access sa lokal na serbisyo para sa bawat mamamayan ng Marinduque.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-foreground">Mabilis na Links</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Pamahalaang Panlalawigan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Opisina ng Turismo
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Pagtugon sa Sakuna
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Portal ng Trabaho
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Patakaran sa Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Kasunduan sa Serbisyo
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Data Privacy Act
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="transition-colors hover:text-primary">
                                        Kalayaan sa Impormasyon
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-foreground">Kontak</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span>Provincial Capitol Compound, Boac, Marinduque, Philippines</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                                    <span>(042) 332-1002</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                                    <span>info@marinduque.gov.ph</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} Pamahalaang Panlalawigan ng Marinduque. Lahat ng karapatan ay reserbado.
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Bagong Pilipinas</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
