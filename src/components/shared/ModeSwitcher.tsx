'use client';

import React from 'react';
import { Briefcase, UserCircle } from 'lucide-react';
import { useUserMode } from '@/context/UserModeContext';
import EmployerVerificationModal from '../modals/EmployerVerificationModal';

export default function ModeSwitcher() {
    const {
        currentMode,
        isEmployerVerified,
        switchMode,
        isLoading,
        showEmployerVerificationModal,
        setShowEmployerVerificationModal,
    } = useUserMode();

    const handleModeSwitch = async () => {
        const newMode = currentMode === 'job_seeker' ? 'employer' : 'job_seeker';
        await switchMode(newMode);
    };

    return (
        <>
            <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1">
                {/* Job Seeker Mode */}
                <button
                    onClick={() => currentMode !== 'job_seeker' && handleModeSwitch()}
                    disabled={isLoading}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${currentMode === 'job_seeker'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    <UserCircle size={18} />
                    <span className="text-sm font-medium">Job Seeker</span>
                </button>

                {/* Employer Mode */}
                <button
                    onClick={() => currentMode !== 'employer' && handleModeSwitch()}
                    disabled={isLoading}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${currentMode === 'employer'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    <Briefcase size={18} />
                    <span className="text-sm font-medium">Employer</span>
                    {!isEmployerVerified && (
                        <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Verify
                        </span>
                    )}
                </button>
            </div>

            {/* Employer Verification Modal */}
            <EmployerVerificationModal
                isOpen={showEmployerVerificationModal}
                onClose={() => setShowEmployerVerificationModal(false)}
            />
        </>
    );
}
