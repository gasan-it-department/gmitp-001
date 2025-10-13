import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Eye, Target, Workflow } from 'lucide-react';

export function MunicipalityInfo() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Building2 className="h-5 w-5 text-primary" />
                    About Our Municipality
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="mandate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="mandate">Mandate</TabsTrigger>
                        <TabsTrigger value="mission">Mission</TabsTrigger>
                        <TabsTrigger value="vision">Vision</TabsTrigger>
                        <TabsTrigger value="org-chart">Org Chart</TabsTrigger>
                    </TabsList>

                    <TabsContent value="mandate" className="mt-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <Target className="mt-1 h-5 w-5 flex-shrink-0 text-secondary" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">Our Mandate</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    To provide basic services and facilities, promote the general welfare, and ensure the delivery of quality
                                    governance to all constituents in accordance with the Local Government Code of 1991 (Republic Act No. 7160).
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="mission" className="mt-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <Target className="mt-1 h-5 w-5 flex-shrink-0 text-secondary" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">Our Mission</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    To deliver efficient, transparent, and responsive public services that improve the quality of life of our
                                    constituents through sustainable development, good governance, and active community participation.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="vision" className="mt-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <Eye className="mt-1 h-5 w-5 flex-shrink-0 text-secondary" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">Our Vision</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    A progressive, peaceful, and prosperous municipality where every citizen enjoys a high quality of life,
                                    sustainable livelihood opportunities, and access to excellent public services.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="org-chart" className="mt-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <Workflow className="mt-1 h-5 w-5 flex-shrink-0 text-secondary" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">Organizational Structure</h3>
                                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                    Our municipality operates through various departments and offices coordinated under the Office of the Municipal
                                    Mayor.
                                </p>
                                <img
                                    src="/organizational-chart-municipality-structure.jpg"
                                    alt="Organizational Chart"
                                    className="w-full rounded-lg border border-border"
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
