'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthSideCard from '@/components/Auth/AuthSideCard';
import TextInput from '@/components/shared/TextInput';
import { FaWhatsapp, FaLinkedinIn, FaGitAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { resendOtp, verifyRegistrationOtp, verifyGstLogin } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@/styles/theme';

import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

function SigninContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const isEmployer = role === 'employer';

    const { login, socialLogin, isLoading: authLoading, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [authCode, setAuthCode] = useState<string | null>(null);

    // Verification State
    const [showJobSeekerVerification, setShowJobSeekerVerification] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // ── Employer GST verification state ─────────────────────────────────────────
    const [showGstVerificationPopup, setShowGstVerificationPopup] = useState(false);
    const [gstProfessionalEmail, setGstProfessionalEmail] = useState('');
    const [gstInputNumber, setGstInputNumber] = useState('');
    const [gstInputCompany, setGstInputCompany] = useState('');
    const [gstVerifyLoading, setGstVerifyLoading] = useState(false);
    const [gstError, setGstError] = useState('');

    const loginFromUserObject = async (user: any, authKey?: string) => {
        if (authKey) {
            localStorage.setItem('authToken', authKey);
        }
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
        }
        await refreshUser();
        window.location.href = '/networking';
    };

    const handleVerifyGst = async () => {
        if (!gstInputNumber || !gstInputCompany) {
            setGstError('Please fill in both GST Number and Company Name.');
            return;
        }
        setGstVerifyLoading(true);
        setGstError('');
        try {
            const res = await verifyGstLogin({
                token: authCode || '',
                gst_number: gstInputNumber,
                company_name: gstInputCompany,
                professional_email: gstProfessionalEmail,
                device_type: '1',
                device_token: '',
            });

            const verificationStatus = res?.data?.verification_status;
            const gstVerified = verificationStatus?.gst_verified;

            if (gstVerified === true || gstVerified === 1) {
                const user = res?.data?.user || res?.data?.data?.user;
                const authKey = res?.data?.auth_key || res?.data?.data?.auth_key;
                await loginFromUserObject(user, authKey);
            } else {
                setGstError('GST verification failed. Please check your GST number and company name and try again.');
            }
        } catch (err: any) {
            setGstError(err.message || 'GST verification failed. Please check your details.');
        } finally {
            setGstVerifyLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Use the stable Firebase Auth UID (never changes) instead of the ID token (changes every login)
            const firebaseUid = user.uid;

            console.log('Google Auth Result:', user);

            // Prepare social login payload
            // Derived fields from Google user
            const firstName = user.displayName?.split(' ')[0] || '';
            const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
            const username = user.email?.split('@')[0] || user.uid;

            const socialPayload = {
                social_type: 'google',
                social_id: firebaseUid, // Uses stable Firebase UID, not the short-lived ID token
                email: user.email || '',
                first_name: firstName,
                last_name: lastName,
                username: username,
                profile: user.photoURL || '',
                device_type: '1', // 1 for web
                device_token: ''
            };

            const response = await socialLogin(socialPayload);

            if (response.success) {
                router.push('/networking');
            } else {
                setError(response.error || 'Social login failed');
            }

        } catch (err: any) {
            console.error('Google Login Error:', err);
            if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/operation-not-allowed') {
                setError('Google sign-in is not configured for this domain. Please contact support.');
            } else {
                setError(err.message || 'Google login failed');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        const result = await login(formData.email, formData.password);

        if (result.success) {
            router.push('/networking');
        } else {
            if (result.error?.toLowerCase().includes('gst')) {
                if (result.token) setAuthCode(result.token);
                setGstProfessionalEmail(result.user?.employerDetails?.professional_email || '');
                setGstInputNumber(result.user?.employerDetails?.gst_number || '');
                setGstInputCompany(result.user?.employerDetails?.company_name || '');
                setShowGstVerificationPopup(true);
            } else if (result.error?.includes('not verified')) {
                if (result.token) setAuthCode(result.token);
                setShowJobSeekerVerification(true);
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
        }
    };

    const handleJobSeekerVerify = async () => {
        if (!otp) {
            setError('Please enter the verification code');
            return;
        }
        setVerifyLoading(true);
        setError('');
        try {
            await verifyRegistrationOtp(formData.email, otp, authCode || '');

            // Login User automatically after verification
            const loginResult = await login(formData.email, formData.password);

            if (loginResult.success) {
                router.push('/networking');
            } else {
                setError(loginResult.error || 'Login failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check the code.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResendJobSeekerOtp = async () => {
        if (!authCode || !formData.email) return;
        setIsResending(true);
        setError('');
        try {
            await resendOtp(formData.email, authCode);
            toast.success('Verification code resent successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    const renderContent = () => {
        if (showGstVerificationPopup) {
            return (
                <div className="w-full max-w-md mx-auto pl-4 animate-fadeIn">
                    <div className="mb-6 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiFileText size={32} className="text-purple-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">GST Verification Required</h1>
                        <p className="text-gray-600 font-medium text-sm max-w-xs mx-auto">
                            We need to verify your GST details to complete your employer registration.
                        </p>
                    </div>

                    <div className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        {/* Professional Email – readonly */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">
                                Professional Email <span className="text-gray-400 font-normal">(cannot be changed)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiMail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={gstProfessionalEmail}
                                    readOnly
                                    className={`${THEME.components.input.default} pl-10 pr-4 !py-3 !bg-gray-50 text-gray-500 cursor-not-allowed w-full`}
                                />
                            </div>
                        </div>

                        {/* GST Number */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">
                                GST Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiFileText size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={gstInputNumber}
                                    onChange={(e) => { setGstInputNumber(e.target.value.toUpperCase()); if (gstError) setGstError(''); }}
                                    className={`${THEME.components.input.default} pl-10 pr-4 !py-3 !bg-white w-full`}
                                    placeholder="22AAAAA0000A1Z5"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={gstInputCompany}
                                onChange={(e) => { setGstInputCompany(e.target.value); if (gstError) setGstError(''); }}
                                className={`${THEME.components.input.default} !py-3 !bg-white w-full`}
                                placeholder="Your Company Name"
                            />
                        </div>

                        {gstError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {gstError}
                            </div>
                        )}

                        <button
                            onClick={handleVerifyGst}
                            disabled={gstVerifyLoading}
                            className="w-full py-3.5 rounded-full font-bold text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-[0.98] bg-purple-700 hover:bg-purple-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {gstVerifyLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {gstVerifyLoading ? 'Verifying GST...' : 'Verify & Complete Registration'}
                        </button>

                        <button
                            onClick={() => { setShowGstVerificationPopup(false); setGstError(''); }}
                            className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            );
        }

        if (showJobSeekerVerification) {
            return (
                <div className="w-full max-w-md mx-auto pl-4 animate-fadeIn">
                    <div className="mb-6 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiMail size={32} className="text-purple-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">Check your email</h1>
                        <p className="text-gray-600 font-medium text-sm max-w-xs mx-auto">
                            We sent a verification code to <span className="text-purple-700 font-bold">{formData.email}</span>
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                Enter the verification code sent to your email. If it doesn&#39;t appear within a few minutes check your spam folder.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block ml-1">Verification Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Enter 4-digit code"
                                className={`${THEME.components.input.default} w-full !text-center !text-lg !tracking-[0.5em] !font-bold !py-4`}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleJobSeekerVerify}
                            disabled={authLoading || verifyLoading}
                            className="w-full py-3.5 rounded-full font-bold text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-[0.98] bg-purple-700 hover:bg-purple-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {(authLoading || verifyLoading) && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {verifyLoading ? 'Verifying...' : 'Verify & Log In'}
                        </button>

                        <div className="text-center">
                            <button
                                onClick={handleResendJobSeekerOtp}
                                disabled={isResending}
                                className="text-sm font-bold text-purple-600 hover:text-purple-800 disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Resend Code'}
                            </button>
                        </div>

                        <button
                            onClick={() => setShowJobSeekerVerification(false)}
                            className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            Change Email / Back
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="mb-6">
                    <h1 className={`text-xl md:text-2xl font-bold ${THEME.colors.text.heading} mb-2 tracking-tight`}>Welcome to StaffBook</h1>
                    <p className={`${THEME.components.typography.subheading} text-base`}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <TextInput
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <div>
                        <TextInput
                            id="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="●●●●●●●●"
                            value={formData.password}
                            onChange={handleChange}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            }
                        />
                        <div className="flex justify-end mt-2">
                            <Link href="/forgot-password" className={`${THEME.colors.text.link} text-xs font-medium`}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={authLoading}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-[0.98] mt-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {authLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-gray-400 font-medium text-sm">OR</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full border-2 border-gray-200 bg-white py-3.5 rounded-xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-base shadow-sm"
                >
                    <FcGoogle size={24} />
                    Continue with Google
                </button>


            </div>
        );
    };

    return (
        <div className={`min-h-screen ${THEME.colors.background.page} pt-24 pb-12 px-4 sm:px-6 lg:px-8`}>
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
                <div className="w-full flex justify-center lg:justify-end">
                    {renderContent()}
                </div>

                <div className="hidden lg:block relative h-full">
                    <div className="sticky top-24 w-full max-w-[400px]">
                        <AuthSideCard />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SigninPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
            <SigninContent />
        </Suspense>
    );
}
