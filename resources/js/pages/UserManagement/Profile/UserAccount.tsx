import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicLayout from '@/layouts/Public/PublicLayout';
import ProfileTab from './Components/ProfileTab';
import SecurityTab from './Components/SecurityTab';

export default function UserAccount() {
    return (
        <PublicLayout title="Account Settings" description="Manage your profile and security settings.">
            {/* Clean, spacious wrapper without heavy background tint */}
            <div className="min-h-screen w-full bg-background pt-8 pb-20 md:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
                    {/* Minimalist Page Header */}
                    <div className="mb-8 md:mb-10">
                        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Account Settings</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Manage your profile details and security preferences.</p>
                    </div>

                    <Tabs defaultValue="account" className="w-full">
                        {/* Refined sticky header: smooth blur, faint border, aligned properly. Sticks below header (top-16) */}
                        <div className="sticky top-16 z-20 -mx-4 bg-background/80 px-4 backdrop-blur-xl sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
                            <TabsList className="mb-8 grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1 text-muted-foreground sm:inline-flex sm:w-auto">
                                <TabsTrigger
                                    value="account"
                                    className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium whitespace-nowrap ring-offset-background transition-all hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium whitespace-nowrap ring-offset-background transition-all hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    Security
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Added a subtle fade-in animation for smoother tab switching */}
                        <div className="mt-2">
                            <TabsContent value="account" className="m-0 duration-500 animate-in fade-in-50 focus-visible:outline-none">
                                <ProfileTab />
                            </TabsContent>

                            <TabsContent value="security" className="m-0 duration-500 animate-in fade-in-50 focus-visible:outline-none">
                                <SecurityTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </PublicLayout>
    );
}
