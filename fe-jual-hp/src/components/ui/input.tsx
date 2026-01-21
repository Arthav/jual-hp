import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, ...props }, ref) => {
        if (icon) {
            return (
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                    <input
                        type={type}
                        className={cn(
                            'flex h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
            );
        }

        return (
            <input
                type={type}
                className={cn(
                    'flex h-11 w-full rounded-lg border border-input bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
