import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    label, 
    description, 
    error, 
    size = 'md',
    variant = 'default',
    id,
    ...props 
  }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    const checkSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    const generatedId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <div className={cn(
          'flex items-start gap-3',
          variant === 'card' && 'p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer'
        )}>
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id={generatedId}
              className="sr-only"
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                'flex items-center justify-center rounded border-2 transition-all duration-200 cursor-pointer',
                sizes[size],
                props.checked 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-border hover:border-primary/50 bg-background',
                props.disabled && 'opacity-50 cursor-not-allowed',
                error && 'border-destructive',
                className
              )}
              onClick={() => {
                if (!props.disabled) {
                  const checkbox = document.getElementById(generatedId) as HTMLInputElement;
                  checkbox?.click();
                }
              }}
            >
              {props.checked && (
                <Check className={cn('text-current', checkSizes[size])} />
              )}
            </div>
          </div>
          
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label 
                  htmlFor={generatedId} 
                  className="block text-sm font-medium text-foreground cursor-pointer leading-relaxed"
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-destructive mt-2 font-medium flex items-center gap-1">
            <span className="w-1 h-1 bg-destructive rounded-full"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
