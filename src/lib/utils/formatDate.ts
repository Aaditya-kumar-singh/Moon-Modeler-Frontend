import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Formats a date into a readable string (e.g., "MMM d, yyyy")
 * @param date Date string, Date object, or timestamp
 * @param formatStr Optional format string (default: 'MMM d, yyyy')
 */
export const formatDate = (date: string | Date | number | null | undefined, formatStr = 'MMM d, yyyy'): string => {
    if (!date) return '-';
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return format(d, formatStr);
    } catch (e) {
        console.error('Invalid date', date, e);
        return '-';
    }
};

/**
 * Formats a date with time (e.g., "MMM d, yyyy h:mm a")
 * @param date Date string, Date object, or timestamp
 */
export const formatDateTime = (date: string | Date | number | null | undefined): string => {
    return formatDate(date, 'MMM d, yyyy h:mm a');
};

/**
 * Formats a date relative to now (e.g., "2 hours ago")
 * @param date Date string, Date object, or timestamp
 */
export const formatRelativeTime = (date: string | Date | number | null | undefined): string => {
    if (!date) return '';
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(d, { addSuffix: true });
    } catch (e) {
        console.error('Invalid date', date, e);
        return '';
    }
};
