import React from 'react';
import { cn } from '@/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default',
    resize = 'vertical',
    ...props 
  }, ref) => {
    const variants = {
      default: 'border-border bg-background hover:border-border/80 focus:border-primary',
      filled: 'border-transparent bg-muted hover:bg-muted/80 focus:bg-background focus:border-primary',
      outlined: 'border-2 border-border bg-transparent hover:border-primary/50 focus:border-primary'
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-3">
            {label}
          </label>
        )}
        <div className="relative group">
          <textarea
            className={cn(
              'flex min-h-[80px] w-full rounded-lg px-4 py-3 text-base transition-all duration-200 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              variants[variant],
              resizeClasses[resize],
              error && 'border-destructive focus:border-destructive focus-visible:ring-destructive/20',
              className
            )}
            ref={ref}
            {...props}
          />
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

Textarea.displayName = 'Textarea';

export default Textarea;
