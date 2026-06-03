import { Star } from 'lucide-react';
import { useState } from 'react';

type StarRatingProps = {
    value?: number;
    max?: number;
    onChange: (rating: number) => void;
};

export default function StarRating({ value = 0, max = 5, onChange }: StarRatingProps) {
    const [hover, setHover] = useState<number>(0);

    return (
        <div className="flex flex-col gap-3">
            <label className="text-sm font-bold tracking-wider text-slate-500 uppercase">Antas ng Serbisyo</label>

            <div className="flex items-center gap-2">
                {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => onChange(rating)}
                        onMouseEnter={() => setHover(rating)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform duration-150 hover:scale-110 focus:outline-none active:scale-90"
                    >
                        <Star
                            className={`h-10 w-10 ${
                                rating <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                            } transition-colors duration-200`}
                        />
                    </button>
                ))}
            </div>

            {value > 0 && (
                <p
                    className={`text-sm font-bold transition-colors duration-300 ${
                        value <= 2
                            ? 'text-red-500' // low rating
                            : value === 3
                              ? 'text-amber-500' // neutral
                              : 'text-green-500' // high rating
                    }`}
                >
                    {value <= 2
                        ? 'Paumanhin, susubukan naming ayusin ito 😔'
                        : value === 3
                          ? 'Salamat! Patuloy kaming magsisikap 😊'
                          : 'Maraming salamat! Masaya kaming nasiyahan kayo 🎉'}
                </p>
            )}
        </div>
    );
}

//You rated {value} out of {max}
