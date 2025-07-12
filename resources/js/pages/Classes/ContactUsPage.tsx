import MainPage from "../MainPage";
import { Card } from "@/components/ui/card";

export default function ContactUsPage() {
    const contacts = [
        { departmentName: "Office of the Mayor", email: 'officeofthemayor@gmail.com', mobileNumber: "+63 9123456789", description: "This is the contact description\n Opens Moday - Friday 8:00 AM - 5:00 PM" },
        { departmentName: "Office of the Vice Mayor", email: 'lremipsumdolor@gmail.com', mobileNumber: "+63 9123456789", description: "N/A"},
    ];
    return (
        <div className="p-8">
            <a className="font-bold text-[20px]">
                CONTACT US
            </a>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {contacts.map((contact, index) => (
                    <Card key={index} className="m-5 p-2 w-auto">
                        <div className="flex flex-col items-start">
                            <a className="font-bold text-center w-full p-3">
                                {contact.departmentName}
                            </a>

                            <div className="mt-2 mb-2" />

                            <a className="p-1 text-center text-[13px]">
                                Email address:
                            </a>

                            <a className="text-center text-gray-600 p-2">
                                {contact.email}
                            </a>

                            <div className="mt-2 mb-2" />

                            <a className="p-1 text-center text-[13px]">
                                Mobile Number:
                            </a>

                            <a className="text-center text-gray-600 p-2">
                                {contact.mobileNumber}
                            </a>

                            <div className="mt-2 mb-2" />

                            <div className="rounded-lg bg-gray-200 p-2 w-full">
                                <a className="text-[12px]">
                                    {contact.description}
                                </a>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

ContactUsPage.layout = (page: React.ReactNode) => <MainPage>{page}</MainPage>;