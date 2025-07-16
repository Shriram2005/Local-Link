import React from 'react';
import { Shield, CheckCircle, Building, CreditCard } from 'lucide-react';
import { VerificationBadge as VerificationBadgeType } from '@/types';
import { VERIFICATION_BADGES } from '@/constants';
import { cn } from '@/utils';

interface VerificationBadgeProps {
  badge: VerificationBadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const badgeIcons = {
  identity: CheckCircle,
  business: Building,
  insurance: Shield,
  background_check: CreditCard,
};

const badgeColors = {
  identity: 'text-green-600 bg-green-100',
  business: 'text-blue-600 bg-blue-100',
  insurance: 'text-purple-600 bg-purple-100',
  background_check: 'text-orange-600 bg-orange-100',
};

export default function VerificationBadge({
  badge,
  size = 'md',
  showLabel = false,
  className,
}: VerificationBadgeProps) {
  const Icon = badgeIcons[badge];
  const badgeInfo = VERIFICATION_BADGES[badge];
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  if (showLabel) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            badgeColors[badge],
            containerSizeClasses[size]
          )}
          title={badgeInfo.description}
        >
          <Icon className={sizeClasses[size]} />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {badgeInfo.label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        badgeColors[badge],
        containerSizeClasses[size],
        className
      )}
      title={badgeInfo.description}
    >
      <Icon className={sizeClasses[size]} />
    </div>
  );
}

interface VerificationBadgesProps {
  badges: VerificationBadgeType[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function VerificationBadges({
  badges,
  size = 'md',
  showLabels = false,
  maxDisplay,
  className,
}: VerificationBadgesProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {displayBadges.map((badge) => (
        <VerificationBadge
          key={badge}
          badge={badge}
          size={size}
          showLabel={showLabels}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-sm text-gray-500">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
