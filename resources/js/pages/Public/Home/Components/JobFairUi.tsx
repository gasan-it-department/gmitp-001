import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, BellRing } from "lucide-react";
import { toast } from "sonner"; 

export default function JobFairUi() {
    
    const handleNotify = () => {
        toast("Notification Enabled", {
            description: "We will notify you once the Job Fair schedule is released.",
        });
    };

    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-xl border border-border shadow-sm transition-all hover:shadow-md bg-background">
            
            {/* 1. THEMED HEADER (Solid Primary) */}
            <CardHeader className="bg-primary px-6 py-5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 shadow-inner backdrop-blur-sm">
                        <Briefcase className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-widest text-primary-foreground">
                            Job Opportunities
                        </CardTitle>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground/70">
                            Public Employment Service Office
                        </p>
                    </div>
                </div>
            </CardHeader>

            {/* 2. TEASER CONTENT AREA */}
            <CardContent className="flex flex-1 flex-col p-0 relative">
                
                {/* Full Height Background Image with Blur */}
                <div className="relative h-full min-h-[300px] w-full overflow-hidden bg-muted">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    />
                    
                    {/* Dark Overlay for text contrast */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

                    {/* 3. COMING SOON OVERLAY CONTENT */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        {/* Status Badge */}
                        <span className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md">
                            Coming Soon
                        </span>
                        
                        {/* Title */}
                        <h3 className="text-2xl font-black uppercase leading-tight text-white drop-shadow-xl sm:text-3xl">
                            Job Fair
                            {/* <span className="block text-primary-foreground/70 text-lg mt-1 tracking-wider">COMING SOON!</span> */}
                        </h3>

                        {/* Description */}
                        <p className="mt-4 max-w-xs text-sm font-medium text-gray-200 leading-relaxed">
                            We are currently preparing for our upcoming Job Fair event. Stay tuned for updates on schedules, participating companies, and how to register!
                        </p>

                        {/* Action Button
                        <div className="mt-8">
                            <Button 
                                onClick={handleNotify}
                                variant="outline"
                                className="h-10 gap-2 border-white/30 bg-white/10 text-white font-bold uppercase tracking-widest backdrop-blur-sm hover:bg-white hover:text-primary transition-all active:scale-95"
                            >
                                <BellRing className="h-4 w-4" /> Notify Me
                            </Button>
                        </div> */}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}