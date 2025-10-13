import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactUsPage() {
    return (
        <PublicLayout title="Contact Us" description="">
            <main className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-6xl">
                    {/* Page Title */}
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-balance text-gray-700 md:text-5xl">Contact Us</h2>
                        <p className="text-gray/90 mx-auto max-w-2xl text-xl text-pretty">
                            We're here to help. Reach out to us for any inquiries, concerns, or feedback.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Contact Form */}
                        <Card className="bg-white shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                                <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" placeholder="John Doe" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="john.doe@example.com" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" placeholder="How can we help you?" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" placeholder="Please provide details about your inquiry..." rows={5} required />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
                                    >
                                        Submit Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            {/* Office Location */}
                            <Card className="bg-white shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-red-500" />
                                        Office Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Barangay 2
                                        <br />
                                        Municipal <br />
                                        Gasan, Marinduque{' '}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Phone */}
                            <Card className="bg-white shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-red-500" />
                                        Phone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Main Office: (555) 123-4567
                                        <br />
                                        Emergency: 911
                                        <br />
                                        Non-Emergency: (555) 123-4568
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Email */}
                            <Card className="bg-white shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-red-500" />
                                        Email
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        General Inquiries: info@municipality.gov
                                        <br />
                                        Support: support@municipality.gov
                                        <br />
                                        Mayor's Office: mayor@municipality.gov
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Office Hours */}
                            <Card className="bg-white shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-red-500" />
                                        Office Hours
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Monday - Friday: 8:00 AM - 5:00 PM
                                        <br />
                                        Saturday: 9:00 AM - 1:00 PM
                                        <br />
                                        Sunday: Closed
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Map Section */}
                    {/* <Card className="mt-8 bg-white shadow-xl">
                        <CardHeader>
                            <CardTitle>Find Us on the Map</CardTitle>
                            <CardDescription>Visit us at our main office location</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-96 w-full items-center justify-center rounded-lg bg-muted">
                                <p className="text-muted-foreground">Map integration placeholder - Add your preferred map service here</p>
                            </div>
                        </CardContent>
                    </Card> */}
                </div>
            </main>
        </PublicLayout>
    );
}
