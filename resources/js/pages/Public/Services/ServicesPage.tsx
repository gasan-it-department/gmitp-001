import PublicLayout from '@/layouts/Public/template/PublicLayoutTemplate';
import { Link } from '@inertiajs/react';
import { BriefcaseBusiness, Shield, Users } from 'lucide-react';

export default function ServicesPage() {
    const values = [
        {
            title: 'Business Permit',
            description:
                'una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino',
            icon: <BriefcaseBusiness />,
        },
        {
            title: 'Lorem Ipsum',
            description:
                'una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino',
            icon: <Shield className="h-6 w-6" />,
        },
        {
            title: 'Lorem Ipsum',
            description:
                'una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino',
            icon: <Users className="h-6 w-6" />,
        },
    ];
    return (
        <PublicLayout title="Services" description="">
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
                    {/* Header */}
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Our Core Service</h2>
                        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                            Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit{' '}
                        </p>
                    </div>

                    {/* Values Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {values.map((value, index) => (
                            <Link
                                href="#"
                                key={index}
                                className="flex flex-col rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    {value.icon}
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                                <p className="text-muted-foreground">{value.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
