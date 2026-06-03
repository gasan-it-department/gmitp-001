import { useState } from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  value?: number;
  max?: number;
  onChange: (rating: number) => void;
};

export default function StarRating({ value = 0, max = 5, onChange }: StarRatingProps) {
  const [hover, setHover] = useState<number>(0);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold uppercase tracking-wider text-slate-500">
        Antas ng Serbisyo
      </label>

      <div className="flex items-center gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            onMouseEnter={() => setHover(rating)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform duration-150 active:scale-90 hover:scale-110"
          >
            <Star
              className={`w-10 h-10 ${rating <= (hover || value)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-slate-200"
                } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>

      {value > 0 && (
        <p
          className={`text-sm font-bold transition-colors duration-300 ${value <= 2
              ? "text-red-500" // low rating
              : value === 3
                ? "text-amber-500" // neutral
                : "text-green-500" // high rating
            }`}
        >
          {value <= 2
            ? "Paumanhin, susubukan naming ayusin ito 😔"
            : value === 3
              ? "Salamat! Patuloy kaming magsisikap 😊"
              : "Maraming salamat! Masaya kaming nasiyahan kayo 🎉"}
        </p>
      )}

    </div>
  );
}

//You rated {value} out of {max}
