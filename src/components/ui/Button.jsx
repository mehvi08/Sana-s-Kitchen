import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const Button = React.forwardRef(
  (
    { className, variant = 'primary', size = 'default', isLoading, children, ...props },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon disabled:opacity-50 disabled:pointer-events-none ring-offset-brand-sand';

    const variants = {
      primary: 'bg-brand-maroon text-brand-sand hover:bg-brand-maroon/90',
      secondary: 'bg-brand-gold text-brand-maroon hover:bg-brand-gold/80',
      outline:
        'border-2 border-brand-maroon text-brand-maroon hover:bg-brand-gold/20',
      ghost: 'text-brand-maroon hover:bg-brand-maroon/10',
    };

    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-12 px-8 rounded-full text-lg',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export { Button };


