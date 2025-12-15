import { Star } from 'lucide-react';

export function StarRating({ rating }: { rating?: number }) {
    if (!rating) return <span className="text-sm text-gray-400">No rating provided</span>;

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
            ))}
        </div>
    );
}
