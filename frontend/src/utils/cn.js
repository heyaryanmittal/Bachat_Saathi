import { clsx } from 'clsx';

/**
 * Utility function to merge class names using clsx and tailwind-merge
 * This provides intelligent class name merging for Tailwind CSS
 */
export function cn(...inputs) {
    return clsx(inputs);
}
