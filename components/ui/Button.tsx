import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'text-white hover:brightness-110 hover:scale-105',
      secondary: 'text-white border-2 hover:brightness-110',
      ghost: 'bg-transparent text-white hover:bg-white hover:bg-opacity-10',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(180deg, #c8621a 0%, #8a3e0a 100%)',
        border: '1px solid #e8821a',
        borderBottom: '3px solid #4a1e04',
        boxShadow: '0 2px 8px rgba(200,98,26,0.3), inset 0 1px 0 rgba(255,180,80,0.15)',
        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
      },
      secondary: {
        background: 'rgba(20,12,4,0.9)',
        border: '2px solid #5a3e28',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        color: '#d4a030',
      },
      ghost: {},
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
