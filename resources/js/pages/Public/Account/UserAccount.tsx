import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ProfileTab from './Components/ProfileTab';
import SecurityTab from './Components/SecurityTab';

export default function UserAccount() {
    return (
        <PublicLayout title="User Account" description="">
            <div className="flex min-h-screen w-full flex-col bg-gray-50">
                <Tabs defaultValue="account" className="p-5">
                    <div className="w-full overflow-x-auto">
                        <TabsList className="mb-5 flex min-w-max">
                            <TabsTrigger value="account" className="p-5 text-[16px]">
                                Account
                            </TabsTrigger>
                            <TabsTrigger value="security" className="p-5 text-[16px]">
                                Security
                            </TabsTrigger>
                            {/* <TabsTrigger value="transactions" className="p-5 text-[16px]">
                Transactions
              </TabsTrigger> */}
                        </TabsList>
                    </div>

                    <TabsContent value="account">
                        <ProfileTab />
                    </TabsContent>

                    <TabsContent value="security">
                        <SecurityTab />
                    </TabsContent>

                    {/* <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent> */}
                </Tabs>
            </div>
        </PublicLayout>
    );
}
