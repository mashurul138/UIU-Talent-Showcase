import { useState, type MouseEvent, type TouchEvent } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  userValue?: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  colorClass?: string;
  inactiveColorClass?: string;
}

export function StarRating({
  value,
  userValue,
  onChange,
  size = 'md',
  colorClass = 'text-orange-500',
  inactiveColorClass = 'text-gray-300'
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const isInteractive = typeof onChange === 'function';

  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const baseValue = userValue && userValue > 0 ? userValue : value;
  const displayValue = hoverValue ?? baseValue;

  const getFillPercent = (index: number) => {
    const starValue = index + 1;
    if (displayValue >= starValue) return 100;
    if (displayValue >= starValue - 0.5) return 50;
    return 0;
  };

  const getRatingFromPoint = (index: number, clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const isHalf = clientX - rect.left < rect.width / 2;
    return index + (isHalf ? 0.5 : 1);
  };

  const handleMouseMove = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    if (!isInteractive) return;
    const rating = getRatingFromPoint(index, event.clientX, event.currentTarget);
    setHoverValue(rating);
  };

  const handleClick = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    if (!isInteractive || !onChange) return;
    event.preventDefault();
    event.stopPropagation();
    const rating = getRatingFromPoint(index, event.clientX, event.currentTarget);
    onChange(rating);
  };

  const handleTouch = (index: number, event: TouchEvent<HTMLButtonElement>) => {
    if (!isInteractive || !onChange) return;
    const touch = event.touches[0];
    if (!touch) return;
    event.preventDefault();
    event.stopPropagation();
    const rating = getRatingFromPoint(index, touch.clientX, event.currentTarget);
    onChange(rating);
  };

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHoverValue(null)}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fillPercent = getFillPercent(index);
        return (
          <button
            key={index}
            type="button"
            className={`relative ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
            onMouseMove={(event) => handleMouseMove(index, event)}
            onClick={(event) => handleClick(index, event)}
            onTouchStart={(event) => handleTouch(index, event)}
            aria-label={`Rate ${index + 1} star`}
            disabled={!isInteractive}
          >
            <Star className={`${sizeClass} ${inactiveColorClass}`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star className={`${sizeClass} ${colorClass} fill-current`} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
