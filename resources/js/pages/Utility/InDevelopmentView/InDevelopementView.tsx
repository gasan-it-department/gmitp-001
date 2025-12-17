
interface InDevelopementViewProps {
    title?: string,
    description?: string
}

export default function InDevelopmentView({ title, description }: InDevelopementViewProps) {
    return (
        <div className="h-[70vh] flex items-center justify-center dark:bg-zinc-950 px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                </div>

                {title && (
                    <h1 className="text-[20px] text-zinc-900 dark:text-zinc-100 p-1">
                        {title}
                    </h1>
                )}

                {/* Title */}
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Page Under Development
                </h1>

                {/* Description */}
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {description || "This page is currently being built. We’re working to make it available as soon as possible."}
                </p>

                {/* Divider */}
                <div className="my-6 h-px w-full bg-zinc-200 dark:bg-zinc-800" />

                {/* <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button className="rounded-lg px-5 py-2.5 text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition">
                        Go back
                    </button>
                    <button className="rounded-lg px-5 py-2.5 text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
                        Return home
                    </button>
                </div> */}

                {/* Footer */}
                <p className="mt-8 text-xs text-zinc-400">
                    Thank you for your patience.
                </p>
            </div>
        </div>
    );
}
