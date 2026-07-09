'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Employer Details Interface
export interface EmployerDetails {
    gst_number: string;
    corporate_id: string;
    professional_email: string;
    company_name: string;
    company_address?: string;
    company_website?: string;
}

// User Mode Type
export type UserMode = 'job_seeker' | 'employer';

// Context Interface
interface UserModeContextType {
    currentMode: UserMode;
    isEmployerVerified: boolean;
    employerDetails: EmployerDetails | null;
    isLoading: boolean;
    switchMode: (mode: UserMode) => Promise<void>;
    verifyEmployer: (details: EmployerDetails) => Promise<void>;
    showEmployerVerificationModal: boolean;
    setShowEmployerVerificationModal: (show: boolean) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [currentMode, setCurrentMode] = useState<UserMode>('job_seeker');
    const [isEmployerVerified, setIsEmployerVerified] = useState(false);
    const [employerDetails, setEmployerDetails] = useState<EmployerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmployerVerificationModal, setShowEmployerVerificationModal] = useState(false);

    // Load mode and employer status from localStorage on mount
    useEffect(() => {
        if (user) {
            const savedMode = localStorage.getItem('userMode') as UserMode;
            const savedEmployerDetails = localStorage.getItem('employerDetails');

            if (savedMode) {
                setCurrentMode(savedMode);
            }

            // If user type is already employer, they are verified
            if (user.user_type === 'employer') {
                setIsEmployerVerified(true);
            } else if (savedEmployerDetails) {
                try {
                    const details = JSON.parse(savedEmployerDetails);
                    setEmployerDetails(details);
                    setIsEmployerVerified(true);
                } catch (error) {
                    console.error('Error parsing employer details:', error);
                }
            }
        }
    }, [user]);

    /**
     * Switch between job seeker and employer mode
     */
    const switchMode = async (mode: UserMode) => {
        // If switching to employer mode and not verified, show verification modal
        // Skip if user is already an employer (user_type === 'employer')
        const isActuallyEmployer = user?.user_type === 'employer';

        if (mode === 'employer' && !isEmployerVerified && !isActuallyEmployer) {
            setShowEmployerVerificationModal(true);
            return;
        }

        setIsLoading(true);
        try {
            // Update mode
            setCurrentMode(mode);
            localStorage.setItem('userMode', mode);

            // TODO: Call API to update user mode on backend if needed
            // await apiClient.post('/users/update-mode', { mode });

            console.log(`Switched to ${mode} mode`);
        } catch (error) {
            console.error('Error switching mode:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verify employer details
     */
    const verifyEmployer = async (details: EmployerDetails) => {
        setIsLoading(true);
        try {
            // TODO: Call API to verify employer details
            // const response = await apiClient.post('/employer/verify', details);

            // For now, just save locally
            setEmployerDetails(details);
            setIsEmployerVerified(true);
            localStorage.setItem('employerDetails', JSON.stringify(details));

            // Switch to employer mode after verification
            setCurrentMode('employer');
            localStorage.setItem('userMode', 'employer');

            // Close modal
            setShowEmployerVerificationModal(false);

            console.log('Employer verified successfully');
        } catch (error) {
            console.error('Error verifying employer:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value: UserModeContextType = {
        currentMode,
        isEmployerVerified,
        employerDetails,
        isLoading,
        switchMode,
        verifyEmployer,
        showEmployerVerificationModal,
        setShowEmployerVerificationModal,
    };

    return (
        <UserModeContext.Provider value={value}>
            {children}
        </UserModeContext.Provider>
    );
}

/**
 * Hook to use user mode context
 */
export function useUserMode() {
    const context = useContext(UserModeContext);
    if (context === undefined) {
        throw new Error('useUserMode must be used within a UserModeProvider');
    }
    return context;
}

/**
 * HOC to protect employer-only routes
 */
export function withEmployerMode<P extends object>(
    Component: React.ComponentType<P>
) {
    return function EmployerModeComponent(props: P) {
        const { currentMode } = useUserMode();
        const { user } = useAuth();

        // If user is already an employer on account level, they should have access
        const isEmployerAccount = user?.user_type === 'employer';

        if (currentMode !== 'employer' && !isEmployerAccount) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Employer Access Required
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You need to switch to employer mode to access this page.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}

/**
 * HOC to protect job seeker-only routes
 */
export function withJobSeekerMode<P extends object>(
    Component: React.ComponentType<P>
) {
    return function JobSeekerModeComponent(props: P) {
        const { currentMode } = useUserMode();
        const { user } = useAuth();

        // Employers can access both views seamlessly
        const isEmployerAccount = user?.user_type === 'employer';

        if (currentMode !== 'job_seeker' && !isEmployerAccount) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Job Seeker Access Required
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You need to switch to job seeker mode to access this page.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}
