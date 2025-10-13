import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { BidsAndAwards } from './Components/BidsAndAwards';
import { CitizensCharter } from './Components/CitizenCharter';
import { FeedbackSection } from './Components/FeedbackSection';
import { FinancialDocuments } from './Components/FinancialDocuments';
import { MunicipalityInfo } from './Components/MunicipalityInfo';
import { Officials } from './Components/Officials';
import { ProgramsAndProjects } from './Components/ProgramsAndProjects';
import { PublicNotices } from './Components/PublicNotices';
import { ReportsAndAudits } from './Components/ReportsAndAudits';

export default function Transparency() {
    return (
        <PublicLayout title="Transparency" description="">
            <main className="container mx-auto max-w-7xl px-4 py-8">
                <div className="space-y-8">
                    <MunicipalityInfo />
                    <Officials />
                    <FinancialDocuments />
                    <BidsAndAwards />
                    <CitizensCharter />
                    <ReportsAndAudits />
                    <ProgramsAndProjects />
                    <PublicNotices />
                    <FeedbackSection />
                </div>
            </main>
        </PublicLayout>
    );
}
