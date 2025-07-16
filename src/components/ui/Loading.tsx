import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import { APP_NAME } from '@/constants';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-primary rounded-full animate-pulse',
            size === 'sm' && 'w-1 h-1',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'bg-primary rounded-full animate-pulse',
        sizeClasses[size]
      )}
    />
  );

  const renderSkeleton = () => (
    <div className="space-y-3 w-full max-w-sm">
      <div className="h-4 bg-muted rounded animate-pulse"></div>
      <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
      <div className="h-4 bg-muted rounded animate-pulse w-4/6"></div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      fullScreen && 'min-h-screen',
      className
    )}>
      {renderVariant()}
      {text && (
        <p className={cn(
          'text-muted-foreground font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card p-8 rounded-xl shadow-xl border border-border">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Page Loading Component
export const PageLoading: React.FC<{ text?: string }> = ({ 
  text = `Loading ${APP_NAME}...` 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
    
    <div className="relative text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-4">
          {APP_NAME}
        </h1>
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
      </div>
      
      <Loading size="lg" text={text} />
    </div>
  </div>
);

// Inline Loading Component
export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-8">
    <Loading size="md" text={text} />
  </div>
);

// Button Loading Component
export const ButtonLoading: React.FC = () => (
  <Loader2 className="w-4 h-4 animate-spin" />
);

// Card Loading Skeleton
export const CardSkeleton: React.FC = () => (
  <div className="p-6 bg-card rounded-lg border border-border animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-muted rounded-full"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
      <div className="h-4 bg-muted rounded w-4/6"></div>
    </div>
  </div>
);

// Table Loading Skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-muted rounded animate-pulse flex-1"
            style={{
              animationDelay: `${(rowIndex * cols + colIndex) * 0.1}s`,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

export default Loading;
