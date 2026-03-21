import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Modern Card component with variants and animations
const cardVariants = cva(
    "rounded-2xl border transition-all duration-300",
    {
        variants: {
            variant: {
                default: "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm",
                gradient: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100/50 dark:border-blue-800/50 shadow-md",
                success: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800",
                warning: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800",
                error: "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800",
                glass: "glass-card backdrop-blur-xl border-white/20 dark:border-white/10"
            },
            size: {
                sm: "p-4",
                md: "p-6",
                lg: "p-8",
                xl: "p-10"
            },
            hover: {
                none: "",
                lift: "hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5",
                glow: "hover:shadow-2xl hover:shadow-primary/20",
                scale: "hover:scale-[1.01]"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            hover: "lift"
        }
    }
);

export const Card = React.forwardRef(({
    className,
    variant,
    size,
    hover,
    children,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn(cardVariants({ variant, size, hover }), className)}
        {...props}
    >
        {children}
    </div>
));

Card.displayName = "Card";

// Enhanced Stats Card with animated numbers and icons
export const StatsCard = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    variant = "default",
    size = "md",
    className,
    ...props
}) => (
    <Card variant={variant} size={size} className={cn("relative overflow-hidden group", className)} {...props}>
        {/* Animated background gradient shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {title}
                </p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                        ₹{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
                    </p>
                </div>
                {trend && trendValue && (
                    <div className={cn(
                        "flex items-center text-sm font-bold mt-2 px-2 py-0.5 rounded-full w-fit",
                        trend === 'up' 
                          ? 'bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-100/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                    )}>
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                trend === 'up' ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"
                            } />
                        </svg>
                        {trendValue}%
                    </div>
                )}
            </div>

            {icon && (
                <div className="flex-shrink-0 ml-4">
                    <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <div className="text-white">
                            {icon}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </Card>
);

// Modern Button component with variants and loading states
const buttonVariants = cva(
    "btn-saas inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 transform outline-none",
    {
        variants: {
            variant: {
                primary: "btn-saas-primary",
                secondary: "btn-saas-secondary",
                success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20",
                warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20",
                danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-500/20",
                ghost: "text-muted-foreground hover:text-foreground hover:bg-muted"
            },
            size: {
                sm: "px-4 py-2 text-xs rounded-lg",
                md: "px-6 py-3 text-sm rounded-xl",
                lg: "px-8 py-4 text-base rounded-2xl",
                xl: "px-10 py-5 text-lg rounded-2xl"
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md"
        }
    }
);

export const Button = React.forwardRef(({
    className,
    variant,
    size,
    loading = false,
    loadingText = "", // Keep it clean
    children,
    ...props
}, ref) => (
    <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || props.disabled}
        {...props}
    >
        {loading ? (
            <>
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loadingText && <span className="ml-2">{loadingText}</span>}
            </>
        ) : children}
    </button>
));

Button.displayName = "Button";

// Modal component omitted for brevity in replacement (not needed to change)

// Input component with premium styling
export const Input = React.forwardRef(({
    label,
    error,
    helperText,
    className,
    ...props
}, ref) => (
    <div className="space-y-2">
        {label && (
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
                {label}
                {props.required && <span className="text-destructive ml-1">*</span>}
            </label>
        )}
        <div className="relative">
            <input
                ref={ref}
                className={cn(
                    "input-saas w-full placeholder:text-muted-foreground/50",
                    error ? "border-rose-400 focus:ring-rose-400/10" : "focus:border-primary/50",
                    className
                )}
                aria-invalid={error ? "true" : "false"}
                {...props}
            />
        </div>
        {error && (
            <p className="text-xs font-bold text-rose-500 animate-entrance ml-1">
                {error}
            </p>
        )}
        {helperText && !error && (
            <p className="text-xs text-muted-foreground ml-1">
                {helperText}
            </p>
        )}
    </div>
));

Input.displayName = "Input";

// Select component
export const Select = React.forwardRef(({
    label,
    options,
    placeholder = "Select an option",
    error,
    helperText,
    className,
    ...props
}, ref) => (
    <div className="space-y-1">
        {label && (
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
        )}
        <select
            ref={ref}
            className={cn(
                "block w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-colors",
                "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
                "disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed",
                error ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-gray-600",
                className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-help` : undefined}
            {...props}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && (
            <p id={`${props.id}-error`} className="text-sm text-red-600 dark:text-red-400">
                {error}
            </p>
        )}
        {helperText && !error && (
            <p id={`${props.id}-help`} className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
            </p>
        )}
    </div>
));

Select.displayName = "Select";

// Alert component for notifications
export const Alert = ({
    type = "info",
    title,
    children,
    onClose,
    className,
    ...props
}) => {
    const alertStyles = {
        info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
        success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
        warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
        error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
    };

    const icons = {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌"
    };

    return (
        <div
            className={cn(
                "rounded-lg border p-4 flex items-start space-x-3 animate-fadeInUp",
                alertStyles[type],
                className
            )}
            role="alert"
            {...props}
        >
            <span className="text-lg flex-shrink-0 mt-0.5">{icons[type]}</span>
            <div className="flex-1">
                {title && <h4 className="font-medium mb-1">{title}</h4>}
                <div className="text-sm">{children}</div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close alert"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

// Badge component for status indicators
export const Badge = ({
    variant = "default",
    size = "md",
    children,
    className,
    ...props
}) => {
    const badgeVariants = {
        default: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
        success: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
        warning: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
        error: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200",
        info: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
    };

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm"
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full",
                badgeVariants[variant],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

// Progress bar component
export const ProgressBar = ({
    value,
    max = 100,
    variant = "primary",
    size = "md",
    showLabel = false,
    className,
    ...props
}) => {
    const percentage = Math.min((value / max) * 100, 100);

    const progressVariants = {
        primary: "bg-blue-500 dark:bg-blue-400",
        success: "bg-green-500 dark:bg-green-400",
        warning: "bg-yellow-500 dark:bg-yellow-400",
        error: "bg-red-500 dark:bg-red-400"
    };

    const sizeClasses = {
        sm: "h-1",
        md: "h-2",
        lg: "h-3"
    };

    return (
        <div className={cn("w-full", className)}>
            {showLabel && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={cn(
                "w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
                sizeClasses[size]
            )}>
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        progressVariants[variant]
                    )}
                    style={{ width: `${percentage}%` }}
                    {...props}
                />
            </div>
        </div>
    );
};



// Skeleton component for loading states
export const Skeleton = ({
    className,
    variant = 'default',
    width = '100%',
    height = '1rem',
    ...props
}) => {
    const baseClasses = 'animate-pulse bg-muted-foreground/10 rounded-xl';
    const variantClasses = {
        default: '',
        text: 'h-4',
        circle: 'rounded-full',
        rectangle: 'rounded-xl',
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant] || '',
                className
            )}
            style={{ width, height, ...props.style }}
            {...props}
        />
    );
};

// LoadingSpinner component
export const LoadingSpinner = ({ size = 'md', variant = 'primary', text = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4'
    };

    const variantClasses = {
        primary: 'border-primary/20 border-t-primary',
        secondary: 'border-secondary/20 border-t-secondary',
        success: 'border-emerald-200 border-t-emerald-600',
        error: 'border-rose-200 border-t-rose-600',
        white: 'border-white/20 border-t-white'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className={cn(
                "animate-spin rounded-full",
                sizeClasses[size],
                variantClasses[variant]
            )} />
            {text && <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">{text}</p>}
        </div>
    );
};

// Modal component
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]'
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-background/80 backdrop-blur-md animate-entrance"
                onClick={onClose}
            />
            <Card 
                variant="glass" 
                size="none" 
                className={cn(
                    "relative z-10 w-full animate-entrance shadow-2xl overflow-hidden",
                    sizeClasses[size]
                )}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between gradient-surface">
                    <h3 className="text-2xl font-black tracking-tighter uppercase tracking-widest leading-none">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    {children}
                </div>
            </Card>
        </div>
    );
};