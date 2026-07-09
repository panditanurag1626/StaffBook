'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthSideCard from '@/components/Auth/AuthSideCard';
import { Mail, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { forgotPassword, verifyForgotPasswordOtp, setNewPassword } from '@/lib/api/authService';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await forgotPassword(email, '1');

            if (response.status === 200) {
                if (response.data && response.data.token) {
                    setToken(response.data.token);
                }
                setStep('otp');
            } else {
                setError(response.message || 'Failed to send reset link. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otp) {
            setError('Please enter the verification code');
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyForgotPasswordOtp(otp, token);

            if (response && response.status === 200) {
                // The API can return the new token in multiple generic nested places
                const newToken =
                    response.data?.token ||
                    response.data?.data?.token ||
                    (response as any).token ||
                    (response as any).data?.auth_key ||
                    response.data?.auth_key;

                if (newToken) {
                    setToken(newToken);
                }
                setStep('password');
            } else {
                setError(response?.message || 'Verification failed. Please check the code.');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check the code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!password || !confirmPassword) {
            setError('Please fill in both password fields');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await setNewPassword(password, token);
            if (response.status === 200) {
                router.push('/signin');
            } else {
                setError(response.message || 'Failed to reset password.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8 flex items-start justify-center pt-20 md:pt-32">
            <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[600px]">
                {/* Left Side - Form */}
                <div className="w-full max-w-md mx-auto pl-4">
                    {step === 'email' && (
                        <>
                            <Link
                                href="/signin"
                                className="inline-flex items-center gap-2 text-primary hover:text-[#4A4AD6] mb-6 font-medium transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Sign In
                            </Link>

                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 tracking-tight">
                                    Forgot your password?
                                </h1>
                                <p className="text-gray-600 font-medium text-base">
                                    Enter your email address and we'll send
                                    you an OTP to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleEmailSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Enter your email"
                                            className="w-full pl-11 text-sm pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base placeholder:text-gray-400 text-gray-700"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-primary to-gradient-end text-white py-3 rounded-lg font-semibold text-base hover:from-[#4A4AD6] hover:to-[#811284] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <button
                                onClick={() => setStep('email')}
                                className="inline-flex items-center gap-2 text-primary hover:text-[#4A4AD6] mb-6 font-medium transition-colors relative z-10"
                            >
                                <ArrowLeft size={18} />
                                Change Email
                            </button>

                            <div className="mb-8 relative z-0">
                                <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 tracking-tight">
                                    Verify your email
                                </h1>
                                <p className="text-gray-600 font-medium text-base leading-relaxed">
                                    Enter the verification code sent to <span className="font-bold">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleOtpSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            setOtp(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Enter 4-digit code"
                                        className="w-full text-center text-lg tracking-[0.5em] font-bold py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-primary to-gradient-end text-white py-3 rounded-lg font-semibold text-base hover:from-[#4A4AD6] hover:to-[#811284] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'password' && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 tracking-tight">
                                    Set new password
                                </h1>
                                <p className="text-gray-600 font-medium text-base">
                                    Your new password must be different from previously used passwords.
                                </p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Enter new password"
                                            className="w-full pl-11 text-sm pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base placeholder:text-gray-400 text-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Confirm new password"
                                            className="w-full pl-11 text-sm pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base placeholder:text-gray-400 text-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-primary to-gradient-end text-white py-3 rounded-lg font-semibold text-base hover:from-[#4A4AD6] hover:to-[#811284] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Right Side - Blue Card */}
                <div className="hidden lg:block h-full">
                    <AuthSideCard topButtonText="Sign Up" topButtonLink="/signup" />
                </div>
            </div>
        </div>
    );
}
