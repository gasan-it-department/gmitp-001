import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ProfileTab from './Components/ProfileTab';
import SecurityTab from './Components/SecurityTab';

export default function UserAccount() {
    return (
        <PublicLayout title="Account Settings" description="Manage your profile and security settings">
            <div className="min-h-screen w-full bg-background/50 pb-20 md:pb-10">
                <div className="max-w-5xl mx-auto">
                    <Tabs defaultValue="account" className="w-full">
                        {/* Sticky Tabs Header for Mobile */}
                        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border mb-6 md:static md:bg-transparent md:border-none md:mb-8">
                            <div className="px-4 md:px-0">
                                <TabsList className="h-14 md:h-12 w-full justify-start gap-6 bg-transparent p-0 border-none rounded-none overflow-x-auto no-scrollbar">
                                    <TabsTrigger 
                                        value="account" 
                                        className="h-full px-1 py-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-sm font-bold uppercase tracking-wider transition-all"
                                    >
                                        Account
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="security" 
                                        className="h-full px-1 py-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-sm font-bold uppercase tracking-wider transition-all"
                                    >
                                        Security
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="px-4 md:px-0">
                            <TabsContent value="account" className="mt-0 outline-none">
                                <ProfileTab />
                            </TabsContent>

                            <TabsContent value="security" className="mt-0 outline-none">
                                <SecurityTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </PublicLayout>
    );
}
