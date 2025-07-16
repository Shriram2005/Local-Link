import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    options, 
    placeholder,
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
          <select
            className={cn(
              'flex w-full rounded-lg transition-all duration-200 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer',
              variants[variant],
              sizes[size],
              'pr-10', // Space for chevron
              error && 'border-destructive focus:border-destructive focus-visible:ring-destructive/20',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
            <ChevronDown className="h-4 w-4" />
          </div>
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

Select.displayName = 'Select';

export default Select;
export type { SelectOption, SelectProps };
