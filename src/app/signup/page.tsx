'use client';
import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  sendEmployerVerificationEmail,
  verifyEmployerEmail,
  resendOtp,
  verifyRegistrationOtp,
  verifyGstLogin,
} from '@/lib/api';
import AuthSideCard from '@/components/Auth/AuthSideCard';
import TextInput from '@/components/shared/TextInput';
import { FaWhatsapp, FaLinkedinIn, FaGitAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiBriefcase, FiUser, FiUpload, FiFileText, FiMail, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@/styles/theme';
import toast from 'react-hot-toast';

import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, login: loginAction, isLoading: authLoading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 'job-seeker' | 'employer'
  const [userType, setUserType] = useState<'job-seeker' | 'employer'>('job-seeker');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',           // Regular/personal email (all users)
    professionalEmail: '', // Employer professional email (employer only)
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    designation: '',
    gstNumber: '',
    agreeToTerms: false,
    agreeToPolicy: false,
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'employer') {
      setUserType('employer');
    } else {
      setUserType('job-seeker');
    }
  }, [searchParams]);

  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showFullPolicy, setShowFullPolicy] = useState(false);


  /* Verification State for Job Seeker */
  const [showJobSeekerVerification, setShowJobSeekerVerification] = useState(false);

  // Verification State (Existing for Employer)
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [regToken, setRegToken] = useState(''); // Store registration token
  const [isResending, setIsResending] = useState(false);

  // ── Employer GST verification state ─────────────────────────────────────────
  const [showGstVerificationPopup, setShowGstVerificationPopup] = useState(false);
  const [gstProfessionalEmail, setGstProfessionalEmail] = useState(''); // pre-filled, readonly
  const [gstInputNumber, setGstInputNumber] = useState('');
  const [gstInputCompany, setGstInputCompany] = useState('');
  const [gstVerifyLoading, setGstVerifyLoading] = useState(false);
  const [gstError, setGstError] = useState('');

  /* Send OTP for Employer Professional Email */
  const handleSendOtp = async () => {
    if (!formData.professionalEmail) {
      setError('Please enter your professional email address first.');
      return;
    }
    setVerifyLoading(true);
    setError('');
    try {
      const res = await sendEmployerVerificationEmail(formData.professionalEmail);

      // If the API indicates the email is already verified (data.status === false
      // with message "Company email already verified"), mark it directly without OTP
      const alreadyVerified =
        res?.data?.status === false ||
        res?.message?.toLowerCase().includes('already verified') ||
        res?.data?.message?.toLowerCase().includes('already verified');

      if (alreadyVerified) {
        setIsEmailVerified(true);
        setShowOtpInput(false);
      } else {
        setShowOtpInput(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setVerifyLoading(false);
    }
  };

  /* Verify OTP for Employer Professional Email */
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter OTP.');
      return;
    }
    setVerifyLoading(true);
    setError('');
    try {
      await verifyEmployerEmail(formData.professionalEmail, Number(otp));
      setIsEmailVerified(true);
      setShowOtpInput(false);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });

    // Reset professional email verification if professionalEmail changes
    if (e.target.id === 'professionalEmail') {
      setIsEmailVerified(false);
      setShowOtpInput(false);
      setOtp('');
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
      if (error) setError('');
    }
  };

  const handleTabChange = (type: 'job-seeker' | 'employer') => {
    setUserType(type);
    setError('');
    setShowJobSeekerVerification(false);
    setShowGstVerificationPopup(false);
  };

  // ── Login user from a user object returned by API (no password needed) ───────
  const loginFromUserObject = async (user: any, authKey?: string) => {
    if (authKey) {
      localStorage.setItem('authToken', authKey);
    }
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    }
    // Refresh auth context to pick up new localStorage values
    await refreshUser();
    router.push('/networking');
  };

  const handleRegisterUser = async () => {
    // Generate username from first and last name
    const username = `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;

    const result = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      countryCode: '91',
      user_type: userType === 'job-seeker' ? 'job_seeker' : 'employer',
      company_name: userType === 'employer' ? formData.companyName : undefined,
      designation: userType === 'employer' ? formData.designation : undefined,
      professional_email: userType === 'employer' ? formData.professionalEmail : undefined,
      gst_number: userType === 'employer' ? formData.gstNumber : undefined,
      document: userType === 'employer' && documentFile ? documentFile : undefined,
    });

    if (result.success && result.data?.token) {
      const token = result.data.token;
      setRegToken(token);
      // Clear OTP state from professional email verification
      setOtp('');
      // Both job seeker and employer go through normal email verification first
      setShowJobSeekerVerification(true);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  // ── Employer GST Login Flow ──────────────────────────────────────────────────
  const handleEmployerGstLogin = async (token: string) => {
    setVerifyLoading(true);
    setError('');
    try {
      const res = await verifyGstLogin({
        token,
        gst_number: formData.gstNumber,
        company_name: formData.companyName,
        professional_email: formData.professionalEmail,
        device_type: '1',
        device_token: '',
      });

      const verificationStatus = res?.data?.verification_status;
      const gstVerified = verificationStatus?.gst_verified;

      if (gstVerified === true || gstVerified === 1) {
        // GST already verified → log in directly
        const user = res?.data?.user || res?.data?.data?.user;
        const authKey = res?.data?.auth_key || res?.data?.data?.auth_key;
        await loginFromUserObject(user, authKey);
      } else {
        // GST not verified → show popup for manual GST entry
        setGstProfessionalEmail(formData.professionalEmail);
        setGstInputNumber(formData.gstNumber);
        setGstInputCompany(formData.companyName);
        setShowJobSeekerVerification(false);
        setShowGstVerificationPopup(true);
      }
    } catch (err: any) {
      setError(err.message || 'GST login verification failed.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── Verify GST via verify-gst-login (popup retry with corrected GST) ─────────
  const handleVerifyGst = async () => {
    if (!gstInputNumber || !gstInputCompany) {
      setGstError('Please fill in both GST Number and Company Name.');
      return;
    }
    setGstVerifyLoading(true);
    setGstError('');
    try {
      const res = await verifyGstLogin({
        token: regToken,
        gst_number: gstInputNumber,
        company_name: gstInputCompany,
        professional_email: gstProfessionalEmail,
        device_type: '1',
        device_token: '',
      });

      const verificationStatus = res?.data?.verification_status;
      const gstVerified = verificationStatus?.gst_verified;

      if (gstVerified === true || gstVerified === 1) {
        // GST verified → log user in
        const user = res?.data?.user || res?.data?.data?.user;
        const authKey = res?.data?.auth_key || res?.data?.data?.auth_key;
        await loginFromUserObject(user, authKey);
      } else {
        // Still not verified → show error so user can correct and retry
        setGstError('GST verification failed. Please check your GST number and company name and try again.');
      }
    } catch (err: any) {
      setGstError(err.message || 'GST verification failed. Please check your details.');
    } finally {
      setGstVerifyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Common Validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all common fields');
      return;
    }

    // Validate phone number (10-digit Indian mobile)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Employer Validation
    if (userType === 'employer') {
      if (!formData.companyName || !formData.designation) {
        setError('Please fill in company details');
        return;
      }
      if (!formData.email) {
        setError('Email is required');
        return;
      }
      if (!formData.professionalEmail) {
        setError('Professional Email is required');
        return;
      }
      if (!formData.gstNumber) {
        setError('GST Number is required');
        return;
      }
      if (formData.gstNumber.length < 15) {
        setError('GST Number must be at least 15 characters');
        return;
      }
      if (!documentFile) {
        setError('Registration Document is required');
        return;
      }
      if (!isEmailVerified) {
        setError('Please verify your professional email.');
        return;
      }
    } else {
      // Job Seeker Validation
      if (!formData.email) {
        setError('Email is required');
        return;
      }
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

    if (!formData.agreeToPolicy) {
      setError('Please acknowledge that you agree with Staffbook Policy');
      return;
    }

    // Proceed to registration
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Continue login if the user already exists in Firebase, just in case
        console.warn('Firebase User already exists. Proceeding with standard registration.');
      } else {
        console.error("Firebase Registration error: ", err);
        setError('Failed to create account with Firebase. Please try again.');
        return;
      }
    }

    await handleRegisterUser();
  };

  const handleResendJobSeekerOtp = async () => {
    if (!regToken || !formData.email) return;
    setIsResending(true);
    setError('');
    try {
      await resendOtp(formData.email, regToken);
      toast.success('Verification code resent successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
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
      // 1. Verify OTP
      const verifyRes = await verifyRegistrationOtp(formData.email, otp, regToken);

      // Update regToken with the new token from verify API if present
      // Support formats where token is in root or data object
      const newToken = (verifyRes as any)?.token || verifyRes?.data?.token || regToken;
      if (newToken !== regToken) {
        setRegToken(newToken);
      }

      if (userType === 'employer') {
        // 2. For employer, proceed to GST verification
        await handleEmployerGstLogin(newToken);
      } else {
        // 2. Login User automatically after verification
        const loginResult = await loginAction(formData.email, formData.password);

        if (loginResult.success) {
          router.push('/networking');
        } else {
          // Fallback to signin if automatic login fails
          router.push('/signin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
      setVerifyLoading(false);
    } finally {
      if (userType !== 'employer' || error) {
        setVerifyLoading(false);
      }
    }
  };

  // ── GST Verification Popup ───────────────────────────────────────────────────
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
                className={`${THEME.components.input.default} pl-10 pr-4 !py-3 !bg-gray-50 text-gray-500 cursor-not-allowed`}
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
                className={`${THEME.components.input.default} pl-10 pr-4 !py-3 !bg-white`}
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
            ← Back to Registration
          </button>
        </div>
      </div>
    );
  }

  // ── Job Seeker OTP Verification ──────────────────────────────────────────────
  if (showJobSeekerVerification) {
    return (
      <div className="w-full max-w-md mx-auto pl-4 animate-fadeIn">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMail size={32} className="text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">Verify your email</h1>
          <p className="text-gray-600 font-medium text-sm max-w-xs mx-auto">
            Enter the verification code sent to <span className="text-purple-700 font-bold">{formData.email}</span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              Enter the code sent to your email. If you don't see
              it, check your spam folder.
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
            {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
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
            Change email or Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-black mb-2 tracking-tight">{userType === 'employer' ? "Create your employer account" : "Create your account"}</h1>
        <p className="text-gray-600 font-medium text-sm">
          {userType === 'employer' ? 'Sign up to hire top talent.' : 'Sign up to discover opportunities that match your goals.'}
        </p>
      </div>

      {/* Modern Role Selection Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => handleTabChange('job-seeker')}
          className={`relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group ${
            userType === 'job-seeker'
              ? 'border-purple-600 bg-purple-50 shadow-md transform scale-[1.02]'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
            userType === 'job-seeker' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
          }`}>
            <FiUser size={24} />
          </div>
          <span className={`font-bold text-base ${userType === 'job-seeker' ? 'text-purple-900' : 'text-gray-700'}`}>I want a job</span>
          <span className="text-[11px] text-gray-500 font-medium mt-1">Find your next role</span>
          
          {userType === 'job-seeker' && (
            <div className="absolute top-3 right-3 text-purple-600">
              <FiCheck size={18} />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('employer')}
          className={`relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group ${
            userType === 'employer'
              ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
            userType === 'employer' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
          }`}>
            <FiBriefcase size={24} />
          </div>
          <span className={`font-bold text-base ${userType === 'employer' ? 'text-blue-900' : 'text-gray-700'}`}>I want to hire</span>
          <span className="text-[11px] text-gray-500 font-medium mt-1">Find top talent</span>

          {userType === 'employer' && (
            <div className="absolute top-3 right-3 text-blue-600">
              <FiCheck size={18} />
            </div>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            id="firstName"
            label="First Name"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
          />

          <TextInput
            id="lastName"
            label="Last Name"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <TextInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        {userType === 'employer' && (
          <div className="animate-fadeIn space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-2">Company Information</h3>
            <TextInput
              id="companyName"
              label="Company Name"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={handleChange}
            />
            <TextInput
              id="designation"
              label="Designation"
              placeholder="e.g. HR Manager"
              value={formData.designation}
              onChange={handleChange}
            />
          </div>
        )}

        {userType === 'employer' ? (
          <div className={`p-5 rounded-xl border border-purple-100 bg-purple-50/30 space-y-4 animate-scaleIn`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                <FiCheck size={14} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Verify Your Company</h3>
            </div>

            {/* Professional Email */}
            <div className="group">
              <label className={`block text-xs font-semibold text-gray-700 mb-1.5 ml-1`}>
                Work Email Address<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail size={16} />
                  </div>
                  <input
                    id="professionalEmail"
                    type="email"
                    value={formData.professionalEmail}
                    onChange={handleChange}
                    className={`${THEME.components.input.default} pl-10 pr-4 !py-2.5 !bg-white ${isEmailVerified ? 'text-green-600 border-green-200 bg-green-50' : ''}`}
                    placeholder="Enter your work email address"
                    disabled={isEmailVerified || showOtpInput}
                  />
                  {isEmailVerified && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600">
                      <FiCheck size={16} />
                    </div>
                  )}
                </div>
                {!isEmailVerified && !showOtpInput && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={verifyLoading}
                    className={`${THEME.components.button.secondary} px-3 py-2 text-xs h-[42px] whitespace-nowrap disabled:opacity-50`}
                  >
                    {verifyLoading ? 'Sending...' : 'Verify Email'}
                  </button>
                )}
              </div>

              {showOtpInput && !isEmailVerified && (
                <div className="mt-2 animate-fadeIn flex gap-2 items-center">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                    placeholder="OTP"
                    className={`${THEME.components.input.default} !py-2 !w-24 !text-center tracking-widest bg-white`}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 whitespace-nowrap"
                  >
                    {verifyLoading ? '...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* GST Number */}
            <div className="group">
              <label className={`block text-xs font-semibold text-gray-700 mb-1.5 ml-1`}>
                GST Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiFileText size={16} />
                </div>
                <input
                  id="gstNumber"
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  className={`${THEME.components.input.default} pl-10 pr-4 !py-2.5 !bg-white`}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>
            </div>

            {/* Registration Document */}
            <div className="group">
              <label className={`block text-xs font-semibold text-gray-700 mb-1.5 ml-1`}>
                Business Registration Document <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 bg-white rounded-xl p-4 text-center cursor-pointer transition-all`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="flex flex-col items-center gap-1">
                  <FiUpload size={18} className="text-purple-400" />
                  <p className={`text-xs font-medium text-gray-600`}>
                    {documentFile ? documentFile.name : 'Upload GST Certificate or Company Registration Document. Accepted formats: PDF, JPG, PNG (max 10 MB)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}

        <div>
          <label htmlFor="phone" className={`block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1`}>Mobile Number</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-700 text-sm border-r pr-2 border-gray-200">+91</span>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your number"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-16 pr-5 py-3 text-gray-900 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 text-sm font-semibold placeholder:text-gray-400 placeholder:font-normal transition-all duration-300`}
            />
          </div>
        </div>

        <TextInput
          id="password"
          label="Create Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
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

        <TextInput
          id="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChange={handleChange}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          }
        />

        <div className="flex items-start gap-2">
          <input
            id="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 mt-0.5 flex-shrink-0"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-justify text-gray-700">
            By signing up, you are acknowledging that you have read, understood and accept our <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-medium hover:text-purple-700">Terms & Condition</Link> and <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-medium hover:text-purple-700">Privacy Policy</Link>.
          </label>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="agreeToPolicy"
            type="checkbox"
            checked={formData.agreeToPolicy}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 mt-0.5 flex-shrink-0"
          />
          <label htmlFor="agreeToPolicy" className={`text-sm text-justify text-gray-700`}>
            I agree to the terms and conditions of this platform. I understand that any activity from my registered account that violates the rules... 
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowFullPolicy(!showFullPolicy);
              }}
              className="text-purple-600 font-medium hover:text-purple-700 ml-1"
            >
              {showFullPolicy ? 'See less' : 'See more'}
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={authLoading || verifyLoading}
          className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-[0.98] mt-6 bg-purple-700 hover:bg-purple-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {(authLoading || verifyLoading) && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {authLoading ? 'Creating Account...' : verifyLoading ? 'Processing...' : (userType === 'employer' ? 'Create Employer Account' : 'Register Now')}
        </button>

        <div className="text-center mt-6">
          <p className={`text-sm ${THEME.colors.text.muted}`}>
            Already have an account? <Link href="/signin" className={THEME.colors.text.link}>Sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className={`min-h-screen ${THEME.colors.background.page} pt-24 pb-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Form */}
        <div className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <Suspense fallback={
              <div className="h-[600px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            }>
              <SignupContent />
            </Suspense>
          </div>
        </div>

        {/* Right: Sticky Sidebar */}
        <div className="hidden lg:block relative h-full">
          <div className="sticky top-24 w-full max-w-[400px]">
            <AuthSideCard topButtonText="Log In" topButtonLink="/signin" />
          </div>
        </div>
      </div>
    </div>
  );
}