import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { actionCenter } from '@/routes';
import { router } from '@inertiajs/react';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export default function ActionCenterUi() {
    const { currentMunicipality } = useMunicipality();

    return (
        <Card className="m-3 flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-7">
            <CardContent className="flex h-full flex-col justify-between p-0">
                {/* Header */}
                <div className="flex items-start gap-4">
                    {/* Icon Box: Uses 'secondary' background for subtle contrast */}
                    <div className="flex items-center justify-center rounded-lg bg-secondary p-3 text-secondary-foreground">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>

                    <div>
                        {/* Title: Uses 'foreground' (primary text color) */}
                        <h2 className="text-xl font-bold text-foreground">Action Center</h2>
                        
                        {/* Description: Uses 'muted-foreground' (subtle text color) */}
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            Get the support you need — access assistance programs for food, financial aid, burial services, and more.
                        </p>
                    </div>
                </div>

                {/* Footer Button */}
                <div className="mt-6 flex justify-end">
                    <Button
                        // Button: Uses 'primary' background and 'primary-foreground' text
                        // We also use 'hover:bg-primary/90' for a standard hover effect
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
                        onClick={() => router.visit(actionCenter.url(currentMunicipality.slug))}
                    >
                        Open Action Center
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}