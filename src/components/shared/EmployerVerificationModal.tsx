import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCheck, FiBriefcase, FiMail, FiFileText, FiUpload, FiUser } from 'react-icons/fi';
import { THEME } from '@/styles/theme';
import { sendEmployerVerificationEmail, verifyEmployerEmail, upgradeToEmployer, verifyGst } from '@/lib/api/authService';
import { useAuth } from '@/context/AuthContext';

interface EmployerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify?: (details: { companyName: string; gstNumber: string; email: string; file: File | null }) => void;
}

const EmployerVerificationModal: React.FC<EmployerVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
}) => {
  const { user, refreshUser } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Initialize form with existing user data for seamless switching
  useEffect(() => {
    if (user?.employerDetails) {
      setCompanyName(user.employerDetails.company_name || '');
      setDesignation(user.designation || '');
      setEmail(user.employerDetails.professional_email || '');
      setGstNumber(user.employerDetails.gst_number || '');
      setIsEmailVerified(!!user.employerDetails.professional_email);
    }
  }, [user]);
  const [errors, setErrors] = useState<{ companyName?: string; designation?: string; gstNumber?: string; email?: string; file?: string; otp?: string }>({});
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted || user?.user_type === 'employer') return null;

  const isPreviouslyVerified = !!user?.employerDetails;

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
      isValid = false;
    }

    if (!isPreviouslyVerified && !designation.trim()) {
      newErrors.designation = 'Designation is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Professional Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!gstNumber.trim()) {
      newErrors.gstNumber = 'GST Number is required';
      isValid = false;
    }

    if (!isPreviouslyVerified && !file) {
      newErrors.file = 'Registration Document is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (!isEmailVerified) {
        setErrors({ ...errors, email: 'Please verify your email first' });
        return;
      }
      handleUpgrade();
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Step 1: Verify GST FIRST
      const verifyResponse = await verifyGst({
        gst_number: gstNumber,
        company_name: companyName,
        professional_email: email,
      });

      if (verifyResponse && verifyResponse.status === 200 && verifyResponse.data?.status !== false && verifyResponse.data?.success !== false) {
        // Step 2: Finalize Upgrade and switch user type
        // Note: For previously verified users, this Finalizes or switches the mode
        const upgradeResponse = await upgradeToEmployer({
          company_name: companyName,
          designation: designation,
          professional_email: email,
          gst_number: gstNumber,
          document: file,
        });

        if (upgradeResponse && upgradeResponse.status === 200 && upgradeResponse.data?.status !== false && upgradeResponse.data?.success !== false) {
          // Success! Complete flow
          await refreshUser();
          if (onVerify) {
            onVerify({ companyName, gstNumber, email, file });
          }
          onClose();
        } else {
          setErrors({ companyName: upgradeResponse?.message || upgradeResponse?.data?.message || 'Upgrade failed' });
        }
      } else {
        setErrors({ gstNumber: verifyResponse?.message || verifyResponse?.data?.message || 'GST verification failed' });
      }
    } catch (error: any) {
      setErrors({ gstNumber: error.message || 'Verification failed. Please check your GST and company details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email.trim()) {
      setErrors({ ...errors, email: 'Email is required' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ ...errors, email: 'Invalid email format' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await sendEmployerVerificationEmail(email);
      if (response && response.status === 200 && response.data?.status !== false && response.data?.success !== false) {
        setIsOtpSent(true);
        setErrors({ ...errors, email: undefined });
      } else if (response && response.status === 200 && (response.message === 'Company email already verified' || response.data?.message === 'Company email already verified')) {
        // Special case: User already verified this email in a previous session
        setIsEmailVerified(true);
        setErrors({ ...errors, email: undefined });
      } else {
        setErrors({ ...errors, email: response?.message || response?.data?.message || 'Failed to send verification email' });
      }
    } catch (error: any) {
      setErrors({ ...errors, email: error.message || 'Failed to send verification email' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors({ ...errors, otp: 'OTP is required' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyEmployerEmail(email, parseInt(otp));
      if (response && response.status === 200 && response.data?.status !== false && response.data?.success !== false) {
        setIsEmailVerified(true);
        setIsOtpSent(false);
        setErrors({ ...errors, otp: undefined });
        // Removed handleUpgrade() call - user must click "Verify & Switch" button explicitly
      } else {
        setErrors({ ...errors, otp: response?.message || response?.data?.message || 'Invalid OTP' });
      }
    } catch (error: any) {
      setErrors({ ...errors, otp: error.message || 'Invalid OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors({ ...errors, file: undefined });
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn" onClick={onClose}>
      <div
        className={`bg-white ${THEME.components.card.radius} shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn relative z-[100000] max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-purple-700 p-6 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

          {/* <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
          >
            <FiX size={18} />
          </button> */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
              <FiBriefcase size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Employer Verification</h2>
              <p className="text-indigo-50 text-xs font-medium opacity-90">
                Setup your business profile
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className={`${THEME.components.typography.body} leading-relaxed`}>
            To switch to Employer mode, we need to verify your business details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div className="group">
              <label className={`block ${THEME.components.typography.subheading} mb-1.5 ml-1`}>
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                  <FiBriefcase size={16} />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`${THEME.components.input.default} pl-10 pr-4 !py-2.5`}
                  placeholder="Enter your company name"
                />
              </div>
              {errors.companyName && (
                <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Designation */}
            <div className="group">
              <label className={`block ${THEME.components.typography.subheading} mb-1.5 ml-1`}>
                Designation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                  <FiUser size={16} />
                </div>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  disabled={isPreviouslyVerified}
                  className={`${THEME.components.input.default} pl-10 pr-4 !py-2.5 ${isPreviouslyVerified ? 'bg-gray-50 text-gray-500' : ''}`}
                  placeholder="e.g. HR Manager, CEO"
                />
              </div>
              {errors.designation && (
                <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.designation}
                </p>
              )}
            </div>

            {/* Professional Email */}
            <div className="group">
              <label className={`block ${THEME.components.typography.subheading} mb-1.5 ml-1`}>
                Professional Email <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                    <FiMail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEmailVerified}
                    className={`${THEME.components.input.default} pl-10 pr-4 !py-2.5 ${isEmailVerified ? 'bg-gray-50 text-gray-500' : ''}`}
                    placeholder="hr@yourcompany.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isEmailVerified || isLoading}
                  className={`${isEmailVerified
                    ? 'bg-green-600 text-white cursor-default'
                    : THEME.components.button.primary
                    } px-4 py-2.5 h-[42px] transition-all duration-300 min-w-[100px] font-medium rounded-full flex items-center justify-center`}
                >
                  {isLoading && !isOtpSent && !isEmailVerified ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : isEmailVerified ? (
                    <span className="flex items-center gap-1">
                      <FiCheck size={16} /> Verified
                    </span>
                  ) : 'Verify'}
                </button>
              </div>
              {errors.email && (
                <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* OTP Input */}
            {isOtpSent && !isEmailVerified && (
              <div className="group animate-fadeIn">
                <label className={`block ${THEME.components.typography.subheading} mb-1.5 ml-1`}>
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className={`${THEME.components.input.default} text-center tracking-[1em] font-bold !py-2.5`}
                    placeholder="••••"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    className={`${THEME.components.button.primary} px-4 py-2.5 h-[42px] min-w-[100px] font-medium rounded-full flex items-center justify-center`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Verify OTP'}
                  </button>
                </div>
                {errors.otp && (
                  <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {errors.otp}
                  </p>
                )}
              </div>
            )}

            {/* GST Number */}
            <div className="group">
              <label className={`block ${THEME.components.typography.subheading} mb-1.5 ml-1`}>
                GST Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                  <FiFileText size={16} />
                </div>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  className={`${THEME.components.input.default} pl-10 pr-4 !py-2.5`}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>
              {errors.gstNumber && (
                <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.gstNumber}
                </p>
              )}
            </div>

            {/* Registration Document */}
            {!isPreviouslyVerified && (
              <div className="group">
                <label className={`block ${THEME.components.typography.subheading} mb-1.5 ml-1`}>
                  Registration Document <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed ${THEME.components.card.radius} p-5 text-center cursor-pointer transition-all ${errors.file ? 'border-red-300 bg-red-50' : `border-gray-200 hover:border-purple-300 hover:bg-purple-50`
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <FiUpload size={20} className="text-gray-400" />
                    <p className={`${THEME.components.typography.body} font-medium`}>
                      {file ? file.name : 'Upload GST Certificate / Company Registration Doc'}
                    </p>
                    <p className="text-[10px] text-gray-400">Max file size: 5MB</p>
                  </div>
                </div>
                {errors.file && (
                  <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {errors.file}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 ${THEME.components.button.primary} py-2.5`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-[2] ${THEME.components.button.primary} flex items-center justify-center gap-2 py-2.5`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheck size={18} />
                    Verify & Switch
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EmployerVerificationModal;
