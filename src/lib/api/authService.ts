/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './config';
import {
    ApiResponse,
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    SendEmailRequest,
    VerifyEmailRequest,
    ResendOtpRequest,
    VerifyRegistrationOtpRequest,
} from './types';

/**
 * Extract error message from API response
 */
const getErrorMessage = (error: any, defaultMessage: string): string => {
    const responseData = error.response?.data;
    let message = responseData?.message;

    if (responseData?.errors) {
        const errors = responseData.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && Array.isArray(errors[firstErrorKey])) {
            message = errors[firstErrorKey][0];
        }
    }

    // Extract nested error messages if present (e.g. { data: { errors: { email: ["Exist"] } } })
    if (responseData?.data?.errors) {
        const errors = responseData.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && Array.isArray(errors[firstErrorKey])) {
            message = errors[firstErrorKey][0];
        }
    }

    return message || defaultMessage;
};

/**
 * Register a new user
 * @param data - Registration data
 * @returns Promise with registration response including token
 */
export const registerUser = async (
    data: Omit<RegisterRequest, 'device_type' | 'device_token' | 'device_token_voip_ios'>
): Promise<ApiResponse<RegisterResponse>> => {
    try {
        let requestData: any;
        const headers: any = {};

        // Check if user_type is employer to use FormData
        if (data.user_type === 'employer') {
            const formData = new FormData();

            // Append all data fields
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'document' && value instanceof File) {
                        formData.append(key, value);
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            // Add default device fields
            formData.append('device_type', '1');
            formData.append('device_token', 'fcm_token');
            formData.append('device_token_voip_ios', '');

            requestData = formData;
            // Headers for FormData are automatically set by browser/axios with boundary
            // Do NOT manually set Content-Type: multipart/form-data as it removes the boundary
            delete headers['Content-Type'];
            headers['Accept'] = 'application/json';
        } else {
            // Job Seeker uses JSON
            requestData = {
                ...data,
                device_type: '1',
                device_token: 'fcmToken',
                device_token_voip_ios: '',
            };
        }

        const response = await apiClient.post<ApiResponse<RegisterResponse>>(
            'users/register',
            requestData,
            { headers }
        );

        // Fix backend typo if present
        if (response.data?.message && response.data.message.includes('Looged')) {
            response.data.message = response.data.message.replace('Looged', 'Logged');
        }

        // Store token in localStorage
        if (response.data.data.token) {
            localStorage.setItem('authToken', response.data.data.token);
        }

        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'));
    }
};

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns Promise with login response including user data and auth key
 */
export const loginUser = async (
    email: string,
    password: string
): Promise<ApiResponse<LoginResponse>> => {
    try {
        const payload: LoginRequest = {
            email,
            password,
            device_type: '1', // 1 for web
            device_token: '',
            device_token_voip_ios: '',
        };

        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            'users/login',
            payload
        );

        // Fix backend typo if present
        if (response.data?.message && response.data.message.includes('Looged')) {
            response.data.message = response.data.message.replace('Looged', 'Logged');
        }

        // Store auth key and user data in localStorage
        if (response.data.data.auth_key) {
            localStorage.setItem('authToken', response.data.data.auth_key);
            localStorage.setItem('authUser', JSON.stringify(response.data.data.user));
        }

        return response.data;
    } catch (error: any) {
        const errorMessage = getErrorMessage(error, 'Login failed. Please check your credentials.');
        const err: any = new Error(errorMessage);
        if (error?.response?.data?.token) {
            err.token = error.response.data.token;
        } else if (error?.response?.data?.data?.token) {
            err.token = error.response.data.data.token;
        } else if (error?.response?.data?.errors?.token) {
            err.token = error.response.data.errors.token;
        }
        throw err;
    }
};

/**
 * Social login
 * @param data - Social login data
 * @returns Promise with login response
 */
export const loginSocial = async (
    data: any
): Promise<ApiResponse<LoginResponse>> => {
    try {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            'users/login-social',
            data
        );

        // Fix backend typo if present
        if (response.data?.message && response.data.message.includes('Looged')) {
            response.data.message = response.data.message.replace('Looged', 'Logged');
        }

        // Store auth key and user data in localStorage
        if (response.data.data.auth_key) {
            localStorage.setItem('authToken', response.data.data.auth_key);
            localStorage.setItem('authUser', JSON.stringify(response.data.data.user));
        }

        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Social login failed. Please try again.'));
    }
};

/**
 * Logout user - Clear local storage
 */
export const logoutUser = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
};

/**
 * Request password reset
 * @param email - User email
 * @param verificationWith - Verification method ('1' for email, '2' for phone)
 * @returns Promise with forgot password response
 */
export const forgotPassword = async (
    email: string,
    verificationWith: string = '1' // '1' for email, '2' for phone
): Promise<ApiResponse<{ token: string; value: boolean }>> => {
    try {
        // Create FormData instead of JSON
        const formData = new FormData();
        formData.append('email', email);
        formData.append('verification_with', verificationWith);

        const response = await apiClient.post<ApiResponse<{ token: string; value: boolean }>>(
            'users/forgot-password-request',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to send reset link. Please try again.'));
    }
};

/**
 * Get current user from localStorage
 * @returns User object or null
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
};

/**
 * Check if user is authenticated
 * @returns boolean
 */
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
};

/**
 * Send employer verification email
 * @param email - Professional email
 */
export const sendEmployerVerificationEmail = async (email: string): Promise<ApiResponse<any>> => {
    try {
        const payload: SendEmailRequest = { professional_email: email };
        const response = await apiClient.post<ApiResponse<any>>('users/send-employer-email', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'Failed to send verification email.'));
    }
};

/**
 * Verify employer email OTP
 * @param email - Professional email
 * @param otp - OTP code
 */
export const verifyEmployerEmail = async (email: string, otp: number): Promise<ApiResponse<any>> => {
    try {
        const payload: VerifyEmailRequest = { professional_email: email, otp };
        const response = await apiClient.post<ApiResponse<any>>('users/verify-employer-email', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'Verification failed. Invalid OTP.'));
    }
};
/**
 * Resend registration OTP
 * @param email - User email
 * @param token - Token from registration response
 */
export const resendOtp = async (email: string, token: string): Promise<ApiResponse<any>> => {
    try {
        const payload: ResendOtpRequest = { email, token };
        const response = await apiClient.post<ApiResponse<any>>('users/resend-otp', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'Failed to resend OTP.'));
    }
};

/**
 * Verify registration OTP
 * @param email - User email
 * @param otp - OTP code (string as per request)
 * @param token - Token from registration response
 */
export const verifyRegistrationOtp = async (email: string, otp: string, token: string): Promise<ApiResponse<any>> => {
    try {
        const payload: VerifyRegistrationOtpRequest = { email, otp, token, "device_token": "", "device_type": "1", };
        const response = await apiClient.post<ApiResponse<any>>('users/verify-registration-otp', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'Verification failed. Invalid OTP.'));
    }
};

/**
 * Verify forgot password OTP
 * @param otp - OTP code
 * @param token - Token from forgot password request
 */
export const verifyForgotPasswordOtp = async (otp: string, token: string): Promise<ApiResponse<any>> => {
    try {
        const payload = { otp, token, device_type: "1", device_token: "" };
        const response = await apiClient.post<ApiResponse<any>>('users/forgot-password-verify-otp', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'Verification failed. Invalid OTP.'));
    }
};

/**
 * Upgrade user to employer
 * @param data - Employer details
 */
export const upgradeToEmployer = async (data: {
    company_name: string;
    designation: string;
    professional_email: string;
    gst_number: string;
    document: File | null;
}): Promise<ApiResponse<any>> => {
    try {
        const formData = new FormData();
        formData.append('company_name', data.company_name);
        formData.append('designation', data.designation);
        formData.append('professional_email', data.professional_email);
        formData.append('gst_number', data.gst_number);
        if (data.document) {
            formData.append('document', data.document);
        }

        const response = await apiClient.post<ApiResponse<any>>('users/upgrade-to-employer', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'Failed to upgrade to employer.'));
    }
};

/**
 * Verify GST login for employer after registration
 * Checks if employer already has GST verified. If so, logs in directly.
 * @param token - Registration token
 * @param gstNumber - GST number
 * @param companyName - Company name
 * @param professionalEmail - Professional email
 */
export const verifyGstLogin = async (data: {
    token: string;
    gst_number: string;
    company_name: string;
    professional_email: string;
    device_type?: string;
    device_token?: string;
}): Promise<ApiResponse<any>> => {
    try {
        const payload = {
            token: data.token,
            gst_number: data.gst_number,
            company_name: data.company_name,
            professional_email: data.professional_email,
            device_type: data.device_type || '1',
            device_token: data.device_token || '',
        };
        const response = await apiClient.post<ApiResponse<any>>('users/verify-gst-login', payload);

        // Store token and user data if auth_key is present
        if (response.data?.data?.auth_key) {
            localStorage.setItem('authToken', response.data.data.auth_key);
            localStorage.setItem('authUser', JSON.stringify(response.data.data.user));
        }

        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'GST login verification failed.'));
    }
};

/**
 * Verify GST details for employer
 * @param gstNumber - GST number
 * @param companyName - Company name
 * @param professionalEmail - Professional email
 */
export const verifyGst = async (data: {
    gst_number: string;
    company_name: string;
    professional_email: string;
}): Promise<ApiResponse<any>> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>('users/verify-gst', data);

        // Store token and user data if auth_key is present in response
        if (response.data?.data?.user) {
            const user = response.data.data.user;
            if (user.auth_key) {
                localStorage.setItem('authToken', user.auth_key);
                localStorage.setItem('authUser', JSON.stringify(user));
            }
        }

        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'GST verification failed.'));
    }
};

/**
 * Set new password
 * @param password - New password
 * @param token - Token from forgot password response
 */
export const setNewPassword = async (password: string, token: string): Promise<ApiResponse<any>> => {
    try {
        const payload = { password, token, device_type: "1", device_token: "" };
        const response = await apiClient.post<ApiResponse<any>>('users/set-new-password', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, 'Failed to set new password.'));
    }
};
