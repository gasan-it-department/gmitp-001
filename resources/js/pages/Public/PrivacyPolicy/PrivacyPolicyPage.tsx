import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';

export default function PrivacyPolicyPage() {
    return (
        <PublicLayout title="Privacy Policy" description="">
            <h3 className="flex p-5 font-bold">PRIVACY POLICY</h3>
            <h3 className="flex pl-5 pr-5 font-bold">1. OVERVIEW</h3>
            <h5 className='flex pl-5 pr-5'>The Municipality of Gasan (“we,” “our,” or “the Municipality”) values your right to privacy and is committed to ensuring that any information you provide through our official website (gasan.gov.ph) is handled with transparency and care. This Privacy Policy outlines how we collect, use, protect, and disclose your information when you interact with our online services.</h5>
            <div className='mt-3 mb-3' />
            <h3 className="flex pl-5 pr-5 font-bold">2. Information We Collect</h3>
            <h3 className='flex flex-col pl-5 pr-5'>
                When visiting our website, you may choose to provide personal information such as your name, email address, contact number, or any other identifying detail, particularly when:
                <br />
                • Submitting forms (e.g., feedback, inquiries, service requests)<br />
                • Engaging in online government transactions<br />
                • Contacting a specific municipal office.<br /><br />
                In addition to voluntary submissions, we may collect non-personal technical data such as:
                <br />
                • IP address<br />
                • Device and browser type<br />
                • Date and time of access<br />
                • Referring website<br />
                • Pages visited on our site.<br /><br />
                This data helps us understand user behavior and improve our services.
            </h3>

            <h3 className="flex pl-5 pr-5 font-bold">3. Use of Information</h3>
            <h3 className='flex flex-col pl-5 pr-5'>
                Collected data may be used to:
                <br />
                • Respond to your queries or service requests<br />
                • Provide access to specific government services<br />
                • Maintain the functionality and security of the website<br />
                • Generate statistical insights to enhance user experience.<br /><br />
                We do not sell, rent, or share your personal information to third parties, unless legally required or authorized under relevant government regulations.
            </h3>

            <h3 className="flex pl-5 pr-5 font-bold">4. Use of Cookies</h3>
            <h3 className='flex flex-col pl-5 pr-5'>
                Our site may use cookies or similar technologies to enhance user experience. You may choose to disable cookies through your browser settings; however, this may limit certain features of the website.
            </h3>

            <h3 className="flex pl-5 pr-5 font-bold">5. External Websites</h3>
            <h3 className='flex flex-col pl-5 pr-5'>
                Links to third-party websites may be available on our site for your convenience. These sites operate independently, and we encourage you to review their privacy policies before providing any personal information. The Municipality is not responsible for the content or practices of external sites.
            </h3>

            <h3 className="flex pl-5 pr-5 font-bold">6. Data Security</h3>
            <h3 className='flex flex-col pl-5 pr-5'>
                We implement reasonable administrative and technical safeguards to protect your personal information from unauthorized access, loss, or misuse. However, no system is entirely immune to risks, and users should exercise caution when submitting sensitive data online.
            </h3>

            <h3 className="flex pl-5 pr-5 font-bold">7. Access and Correction</h3>
            <h3 className='flex flex-col pl-5 pr-5'>
                You may request to access, update, or correct your personal data by contacting the Municipal IT Office. We will take reasonable steps to respond promptly to such requests in compliance with data privacy laws.
            </h3>

            <h3 className="flex pl-5 pr-5 font-bold">8. Contact Us</h3>
            <h3 className='flex flex-col pl-5 pr-5'>
                You may request to access, update, or correct your personal data by contacting the Municipal IT Office. We will take reasonable steps to respond promptly to such requests in compliance with data privacy laws.
            </h3>

            <div className='mt-8 mb-8'/>
        </PublicLayout>
    );
}
