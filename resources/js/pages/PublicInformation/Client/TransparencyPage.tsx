import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { BidsAndAwards } from './Components/BidsAndAwards';

export default function Transparency({ procurements }: any) {
    console.log(procurements);
    return (
        <PublicLayout title="Transparency" description="">
            <main className="container mx-auto max-w-7xl px-4 py-8">
                <div className="space-y-8">
                    {/* <MunicipalityInfo />
                    <Officials />
                    <FinancialDocuments /> */}
                    <BidsAndAwards data={procurements.data} metaData={procurements.meta}/>
                    {/* <CitizensCharter /> */}
                    {/* <ReportsAndAudits />
                    <ProgramsAndProjects />
                    <PublicNotices />
                    <FeedbackSection /> */}
                </div>
            </main>
        </PublicLayout>
    );
}
