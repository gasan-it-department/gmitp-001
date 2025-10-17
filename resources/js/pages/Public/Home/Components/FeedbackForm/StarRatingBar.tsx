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
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-foreground">
        Service Rating
      </label>

      <div className="flex items-center gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            onMouseEnter={() => setHover(rating)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform duration-150 hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${rating <= (hover || value)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
                } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>

      {value > 0 && (
        <p
          className={`text-sm font-medium transition-colors duration-300 ${value <= 2
              ? "text-red-600 dark:text-red-400" // low rating
              : value === 3
                ? "text-yellow-600 dark:text-yellow-400" // neutral
                : "text-green-600 dark:text-green-400" // high rating
            }`}
        >
          {value <= 2
            ? "We’re sorry to hear that 😔"
            : value === 3
              ? "Thanks! We’ll keep improving 😊"
              : "Awesome! Glad you’re satisfied 🎉"}
        </p>
      )}

    </div>
  );
}

//You rated {value} out of {max}
