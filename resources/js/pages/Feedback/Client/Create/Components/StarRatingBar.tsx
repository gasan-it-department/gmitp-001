import { Star } from 'lucide-react';
import { useState } from 'react';

type StarRatingProps = {
    value?: number;
    max?: number;
    onChange: (rating: number) => void;
};

const ratingMessage = (rating: number) => {
    if (rating <= 2) return 'Hindi naging maayos ang karanasan ko';
    if (rating === 3) return 'Katamtaman ang aking karanasan';
    if (rating === 4) return 'Maganda ang aking karanasan';
    return 'Napakaganda ng aking karanasan';
};

export default function StarRating({ value = 0, max = 5, onChange }: StarRatingProps) {
    const [hover, setHover] = useState(0);
    const activeRating = hover || value;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-bold text-amber-950">Antas ng Serbisyo</label>
                <span className="text-xs font-semibold text-amber-700">{value > 0 ? `${value} sa ${max}` : 'Pumili ng rating'}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2" onMouseLeave={() => setHover(0)}>
                {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        aria-label={`${rating} sa ${max} na bituin`}
                        onClick={() => onChange(rating)}
                        onMouseEnter={() => setHover(rating)}
                        onFocus={() => setHover(rating)}
                        onBlur={() => setHover(0)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none active:scale-90 sm:h-11 sm:w-11"
                    >
                        <Star
                            className={`h-8 w-8 transition-all duration-150 sm:h-9 sm:w-9 ${
                                rating <= activeRating ? 'fill-amber-400 text-amber-500' : 'text-amber-200'
                            }`}
                        />
                    </button>
                ))}
            </div>

            {value > 0 && (
                <p className={`text-sm font-bold ${value <= 2 ? 'text-rose-600' : value === 3 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {ratingMessage(value)}
                </p>
            )}
        </div>
    );
}
