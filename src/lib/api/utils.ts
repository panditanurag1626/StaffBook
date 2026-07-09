/**
 * API Utility Functions
 * Helper functions for API error handling and response formatting
 */

import { AxiosError } from 'axios';

/**
 * Extract error message from API error response
 * @param error - Error object from API call
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    const axiosError = error as AxiosError<{ message: string }>;

    if (axiosError.response) {
        // Server responded with error
        return axiosError.response.data?.message || 'An error occurred. Please try again.';
    } else if (axiosError.request) {
        // Request made but no response
        return 'Network error. Please check your connection.';
    }

    return 'An unexpected error occurred.';
};

/**
 * Check if error is a network error
 * @param error - Error object
 * @returns boolean
 */
export const isNetworkError = (error: unknown): boolean => {
    const axiosError = error as AxiosError;
    return !axiosError.response && !!axiosError.request;
};

/**
 * Check if error is an authentication error (401)
 * @param error - Error object
 * @returns boolean
 */
export const isAuthError = (error: unknown): boolean => {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
};

/**
 * Format phone number for API
 * @param phone - Phone number string
 * @returns Formatted phone number (digits only)
 */
export const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
};

/**
 * Validate email format
 * @param email - Email string
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param phone - Phone number string
 * @returns boolean
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(formatPhoneNumber(phone));
};

/**
 * Validate password strength
 * @param password - Password string
 * @returns Object with validation result and message
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    // Optional: Add more password strength checks
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumber = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return { isValid: true, message: 'Password is valid' };
};

/**
 * Generate username from name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Generated username
 */
export const generateUsername = (firstName: string, lastName: string): string => {
    const cleanFirst = firstName.toLowerCase().replace(/\s/g, '');
    const cleanLast = lastName.toLowerCase().replace(/\s/g, '');
    return `${cleanFirst}${cleanLast}`;
};

/**
 * Format user display name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Formatted full name
 */
export const formatUserName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
};

/**
 * Debounce function for API calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
