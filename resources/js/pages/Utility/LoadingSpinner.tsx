export default function LoadingSpinner() {
    return (
        // Theme Update: Uses 'bg-secondary' for the circle background
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <svg
                // Theme Update: Uses 'text-primary' for the spinner color
                className="h-8 w-8 animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
            </svg>
        </div>
    );
}