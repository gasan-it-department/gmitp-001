import LandingPageHeroBanner from '@/pages/Public/MainLandingPage/Components/LandingPageHeroBanner';
import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone, Shield } from 'lucide-react';

export default function MainLandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
            {/* Top Bar - Government Standard */}
            <div className="bg-primary px-4 py-1.5 text-xs text-primary-foreground sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Opisyal na Portal ng Pamahalaan ng Gasan</span>
                        <span className="sm:hidden">Gov.PH Portal</span>
                    </div>
                    <div className="flex items-center gap-4 font-medium">
                        {/* <Link href="#" className="hover:underline">
                            Transparency Seal
                        </Link>
                        <Link href="#" className="hidden hover:underline sm:inline">
                            Makipag-ugnayan
                        </Link> */}
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png"
                            alt="Marinduque Logo"
                            className="h-10 w-10 object-contain drop-shadow-sm"
                        />
                        <div>
                            <h1 className="text-lg leading-none font-black tracking-tight text-foreground">GMITP</h1>
                            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Unified Services Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                <LandingPageHeroBanner />
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card text-card-foreground">
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
                                    <h2 className="text-lg font-bold">E-MARINDUQUE</h2>
                                    <p className="text-xs text-muted-foreground">Unified Services Portal</p>
                                </div>
                            </div>
                            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Pagbibigay ng ligtas, mabilis, at transparent na serbisyo ng pamahalaan para sa mga mamamayan ng Marinduque.
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
                            © {new Date().getFullYear()} Pamahalaang Panlalawigan ng Marinduque. Lahat ng karapatan ay rezebado.
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
