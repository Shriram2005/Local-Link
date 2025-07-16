import React from 'react';
import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95';

    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 shadow-md',
      secondary: 'bg-gradient-to-r from-secondary to-secondary-hover text-secondary-foreground hover:shadow-lg hover:-translate-y-0.5 shadow-md',
      outline: 'border-2 border-border bg-background hover:bg-muted hover:border-primary/50 hover:shadow-md',
      ghost: 'hover:bg-muted hover:shadow-sm',
      destructive: 'bg-gradient-to-r from-destructive to-destructive-hover text-destructive-foreground hover:shadow-lg hover:-translate-y-0.5 shadow-md',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm font-medium',
      md: 'h-11 px-6 text-sm font-medium',
      lg: 'h-12 px-8 text-base font-medium',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          loading && 'cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="spinner mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
