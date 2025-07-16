import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';
import { Card, CardContent, CardHeader } from './Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: LucideIcon;
  description?: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'outlined';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  className,
  variant = 'default'
}) => {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      case 'neutral':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-primary/20';
      case 'outlined':
        return 'border-2 border-primary/20 bg-white';
      default:
        return 'bg-white border-border';
    }
  };

  return (
    <Card 
      className={cn(
        'dashboard-stat-card overflow-hidden relative',
        getVariantStyles(),
        className
      )}
      hover
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-none">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground leading-none">
            {title}
          </p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {(change || description) && (
            <div className="flex items-center justify-between">
              {change && (
                <div className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getChangeColor(change.type)
                )}>
                  {change.type === 'increase' && '↗'}
                  {change.type === 'decrease' && '↘'}
                  {change.type === 'neutral' && '→'}
                  <span className="ml-1">{change.value}</span>
                </div>
              )}
              
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-3xl" />
    </Card>
  );
};

export default StatsCard;
