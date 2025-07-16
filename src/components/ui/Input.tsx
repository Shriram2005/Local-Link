import React from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    size = 'md',
    ...props
  }, ref) => {
    const variants = {
      default: 'border-border bg-background hover:border-border/80 focus:border-primary',
      filled: 'border-transparent bg-muted hover:bg-muted/80 focus:bg-background focus:border-primary',
      outlined: 'border-2 border-border bg-transparent hover:border-primary/50 focus:border-primary'
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-4 text-base',
      lg: 'h-12 px-4 text-base'
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-3">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex w-full rounded-lg transition-all duration-200 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              variants[variant],
              sizes[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-destructive focus:border-destructive focus-visible:ring-destructive/20',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive mt-2 font-medium flex items-center gap-1">
            <span className="w-1 h-1 bg-destructive rounded-full"></span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground mt-2">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
