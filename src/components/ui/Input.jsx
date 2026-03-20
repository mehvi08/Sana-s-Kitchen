import React from 'react';
import { cn } from '../../lib/utils.js';

const Input = React.forwardRef(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-brand-maroon mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-brand-maroon/30 bg-white/50 px-3 py-2 text-sm placeholder:text-brand-maroon/50 focus:outline-none focus:ring-2 focus:ring-brand-maroon disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input };


