export default function FormErrors({ errors }: { errors: object }) {
    const messages = [...new Set(Object.values(errors).filter(Boolean).map(String))];
    if (!messages.length) return null;
    return (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {messages.map((message) => (
                <p key={message}>{message}</p>
            ))}
            {Object.prototype.hasOwnProperty.call(errors, 'revision') && (
                <button type="button" onClick={() => window.location.reload()} className="mt-2 inline-block font-medium underline">
                    Reload latest information
                </button>
            )}
        </div>
    );
}
