import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, ExternalLink } from "lucide-react";

export default function BusinessPermitCard() {
    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-xl border border-border shadow-sm transition-all hover:shadow-md bg-background">
            
            {/* 1. THEMED HEADER (Solid Primary) */}
            <CardHeader className="bg-primary px-6 py-5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 shadow-inner backdrop-blur-sm">
                        <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-widest text-primary-foreground">
                            Business One-Stop Shop
                        </CardTitle>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground/70">
                            Licensing & Permits Division
                        </p>
                    </div>
                </div>
            </CardHeader>

            {/* 2. HERO IMAGE SECTION */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-90 transition-transform duration-700 hover:scale-105"
                />
                
                {/* Gradient Overlay for text readability/transition */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                
                {/* Badge */}
                <div className="absolute bottom-3 left-6">
                    <span className="inline-block rounded-md bg-background/90 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm backdrop-blur-sm border border-border/50">
                        Online Services
                    </span>
                </div>
            </div>

            {/* 3. CONTENT AREA */}
            <CardContent className="flex flex-1 flex-col justify-between p-6">
                <div className="space-y-3">
                    <h3 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight">
                        Streamline Your Business Application
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        Register a new business, renew your existing permit, or update your business details comfortably from your home or office.
                    </p>
                </div>

                <div className="mt-8">
                    <Button 
                        asChild
                        className="w-full h-12 gap-2 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {/* Replace '#' with your actual route/URL */}
                        <a href="https://elgu-gasan-marinduque.e.gov.ph/" target="_blank" rel="noopener noreferrer">
                            Access e-BPLS Portal <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                    <p className="mt-3 text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wide">
                        Redirects to Official Business Portal
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}