import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating;
          const isHalf = !isFilled && value - 0.5 <= displayRating;

          return (
            <button
              key={value}
              type="button"
              className={cn(
                'relative transition-colors',
                !readonly && 'hover:scale-110 cursor-pointer',
                readonly && 'cursor-default'
              )}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : isHalf
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                )}
              />
              {isHalf && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute inset-0 text-yellow-400 fill-yellow-400',
                    'clip-path-half'
                  )}
                  style={{
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface StarDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarDisplay({
  rating,
  reviewCount,
  size = 'md',
  className,
}: StarDisplayProps) {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <StarRating rating={rating} size={size} readonly showValue />
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}

interface RatingBreakdownProps {
  ratings: { [key: number]: number };
  totalReviews: number;
  className?: string;
}

export function RatingBreakdown({
  ratings,
  totalReviews,
  className,
}: RatingBreakdownProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = ratings[stars] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={stars} className="flex items-center space-x-2 text-sm">
            <span className="w-8 text-right">{stars}</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-gray-600">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
