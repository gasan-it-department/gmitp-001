import PublicLayout from '@/layouts/PublicLayoutTemplate';

// const newsCarauselItems = [
//     { id: 1, title: 'News 1 Item', image: '/assets/news_banner_1.png' },
//     { id: 2, title: 'News 2 Item', image: '/assets/news_banner_2.png' },
//     { id: 3, title: 'News 3 Item', image: '/assets/news_banner_3.png' },
// ];

export default function HomePage() {
    return (
        <PublicLayout title="Welcome" description="Landing Page">
            <section className="bg-gray-700 bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/conference.jpg')] bg-center bg-no-repeat bg-blend-multiply">
                <div className="mx-auto max-w-screen-xl px-4 py-24 text-center lg:py-56">
                    <h1 className="mb-4 text-4xl leading-none font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
                        We invest in the world’s potential
                    </h1>
                    <p className="mb-8 text-lg font-normal text-gray-300 sm:px-16 lg:px-48 lg:text-xl">
                        Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic
                        growth.
                    </p>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                        <a
                            href="#"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-center text-base font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                        >
                            Get started
                            <svg
                                className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 10"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M1 5h12m0 0L9 1m4 4L9 9"
                                />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="inline-flex items-center justify-center rounded-lg border border-white px-5 py-3 text-center text-base font-medium text-white hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-400 sm:ms-4"
                        >
                            Learn more
                        </a>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
