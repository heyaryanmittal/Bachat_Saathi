import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Modern Card component with variants and animations
const cardVariants = cva(
    "rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md",
    {
        variants: {
            variant: {
                default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                gradient: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800",
                success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
                error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                glass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-700/20"
            },
            size: {
                sm: "p-4",
                md: "p-6",
                lg: "p-8",
                xl: "p-10"
            },
            hover: {
                none: "",
                lift: "hover:shadow-lg hover:-translate-y-1",
                glow: "hover:shadow-xl hover:shadow-blue-500/25",
                scale: "hover:scale-[1.02]"
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
    <Card variant={variant} size={size} className={cn("relative overflow-hidden", className)} {...props}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 dark:to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {title}
                </p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white animate-fadeInUp">
                        ₹{typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {trend && trendValue && (
                        <div className={cn(
                            "flex items-center text-sm font-medium",
                            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
            </div>

            {icon && (
                <div className="flex-shrink-0 ml-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        {typeof icon === 'string' ? (
                            <span className="text-xl">{icon}</span>
                        ) : (
                            icon
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Animated progress bar for budget cards */}
        {variant === 'warning' && trendValue && (
            <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(trendValue, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {trendValue}% of budget used
                </p>
            </div>
        )}
    </Card>
);

// Modern Button component with variants and loading states
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500",
                secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500",
                success: "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500",
                warning: "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg focus:ring-yellow-500",
                danger: "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500",
                ghost: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500"
            },
            size: {
                sm: "px-3 py-1.5 text-sm",
                md: "px-4 py-2 text-sm",
                lg: "px-6 py-3 text-base",
                xl: "px-8 py-4 text-lg"
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
    loadingText = "Loading...",
    children,
    ...props
}, ref) => (
    <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || props.disabled}
        {...props}
    >
        {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        )}
        {loading ? loadingText : children}
    </button>
));

Button.displayName = "Button";

// Enhanced Loading Spinner with variants
export const LoadingSpinner = ({
    size = "md",
    variant = "default",
    className,
    text
}) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const spinnerClasses = {
        default: "border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400",
        primary: "border-blue-200 border-t-blue-600",
        white: "border-white/30 border-t-white"
    };

    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <div className={cn(
                "border-2 rounded-full animate-spin",
                sizeClasses[size],
                spinnerClasses[variant]
            )} />
            {text && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

// Modal component with animations and accessibility
export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    className,
    ...props
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl"
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={cn(
                        "relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all",
                        sizeClasses[size],
                        "animate-in fade-in-0 zoom-in-95 duration-300",
                        className
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    {...props}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {title && (
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h3>
                        </div>
                    )}

                    <div className="px-6 py-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Input component with validation and accessibility
export const Input = React.forwardRef(({
    label,
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
        <input
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
        />
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
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
    const variantClasses = {
        default: '',
        text: 'h-4',
        circle: 'rounded-full',
        rectangle: 'rounded',
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