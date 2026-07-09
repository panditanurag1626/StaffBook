'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ResumeUpload from "../../components/profile/ResumeUpload";
import ExperienceSection from "../../components/profile/ExperienceSection";
import EducationSection from "../../components/profile/EducationSection";
import ProjectsSection from "../../components/profile/ProjectsSection";
import CertificationsSection from "../../components/profile/CertificationsSection";
import ImageGallery from "../../components/profile/ImageGallery";
import SkillsSidebar from "@/components/profile/SkillsSidebar";
import ProfileLayout from "@/components/shared/ProfileLayout";
import ProfileSubMenu from "@/components/shared/ProfileSubMenu";
import { THEME } from "@/styles/theme";
import { FiUser, FiBarChart2, FiBriefcase, FiGrid } from "react-icons/fi";
import { Building, Globe, Calendar, MapPin, Layers, Users, Info, Edit2, X, Check, Camera } from "lucide-react";
import Button from "@/components/shared/Button";
import { useAuth } from "@/context/AuthContext";
import MyPostsAndReels from "@/components/profile/MyPostsAndReels";
import BannerContent from "@/components/profile/BannerContent";
import { profileService, saveCompanyProfile } from "@/lib/api";
import type { UserProfile } from "@/lib/api/types";
import { subscriptionService, SubscriptionPlan } from "@/lib/api/services/subscriptionService";
import Image from "next/image";

type TabType = "basic" | "analytics" | "company" | "posts";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const { isEmployer, user, refreshUser } = useAuth();

  // Profile data state
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    about_company: "",
    company_website: "",
    founded: "",
    headquarter: "",
    industry: "",
    company_size: "",
    company_logo: "",
    company_logo_url: "",
  });
  const [companyFormDraft, setCompanyFormDraft] = useState({ ...companyForm });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await subscriptionService.getSubscriptionList('employer');
        if (res.data?.data?.data) {
          setPlans(res.data.data.data);
        }
      } catch {
        // silent fail
      }
    };
    fetchPlans();
  }, []);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch full profile data from API (independent of context)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await profileService.getProfile();
        if (response.data?.user) {
          setProfileData(response.data.user);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        // Fall back to context user if API fails
        if (user) {
          setProfileData(user as UserProfile);
        } else {
          setError(err.message || 'Failed to load profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Sync profile data with global user state (fallback)
  useEffect(() => {
    if (!profileData && user) {
      setProfileData(user as UserProfile);
      setIsLoading(false);
      setError(null);
    }
  }, [user, profileData]);

  useEffect(() => {
    if (profileData?.employerDetails) {
      const d = profileData.employerDetails;

      setCompanyForm({
        company_name: d.company_name || "",
        about_company: d.about_company || "",
        company_website: d.company_website || "",
        founded: d.founded || "",
        headquarter: d.headquarter || "",
        industry: d.industry || "",
        company_size: d.company_size || "",
        company_logo: d.company_logo || "",
        company_logo_url: d.company_logo_url || "",
      });
      setLogoPreview(d.company_logo_url || null);
    }
  }, [profileData]);

  const isPlanExpired = (expiryDate: string | undefined | null) => {
    if (!expiryDate) return false;
    try {
      return new Date(expiryDate) < new Date();
    } catch {
      return false;
    }
  };

  // Render employer subscription balance stats
  const renderBalanceStats = () => {
    const stats: { label: string; value: React.ReactNode; isBoolean?: boolean }[] = [];
    const bal = (user as any)?.user_balance_employer;

    if (!bal) {
      return <div className="col-span-full py-4 text-center text-gray-400 text-sm">No active plan limits to display.</div>;
    }

    if (isPlanExpired(bal.plan_expiry_date)) {
      return <div className="col-span-full py-4 text-center"><button onClick={() => router.push('/subscription')} className="text-red-500 hover:text-red-600 underline text-sm">Your Subscription Has Expired. Renew Your Plan to Continue.</button></div>;
    }

    const formatValue = (used: number, total: number) => {
      if (total === -1) return <span className="text-sm">∞</span>;
      return `${used}/${total}`;
    };
    const pushItem = (label: string, used: number, total: number) => {
      if (total > 0 || total === -1) stats.push({ label, value: formatValue(used, total) });
    };
    const pushBooleanItem = (label: string, available: number) => {
      if (available > 0) stats.push({ label, value: "Included", isBoolean: true });
    };

    pushItem("Job Postings", bal.job_posting_used, bal.job_posting_total);
    if (bal.live_chat_unlimited > 0) pushItem("Live Chat", bal.live_chat_used, -1);
    pushItem("Contact", bal.show_contact_used, bal.show_contact_total);
    pushItem("Connection Invites", bal.send_invite_used, bal.send_invite_total);
    pushItem("Schedule Meeting", bal.schedule_meeting_used, bal.schedule_meeting_total);
    pushItem("Email", bal.email_used, bal.email_total);
    pushItem("Resume Downloads", bal.download_cv_used, bal.download_cv_total);
    pushItem("Ad Banners", bal.bottom_banner_used, bal.bottom_banner_available);
    pushItem("Slider Banners", bal.slider_banner_used, bal.slider_banner_available);
    pushBooleanItem("Bulk Downloads", bal.bulk_download_available);
    pushBooleanItem("Bulk Actions", bal.bulk_actions_available);

    if (stats.length === 0) {
      return <div className="col-span-full py-4 text-center text-gray-400 text-sm">No active plan limits to display.</div>;
    }

    return stats.map((stat, idx) => (
      <div key={idx} className="flex flex-col items-center min-w-0">
                    <span className={`text-sm whitespace-nowrap ${stat.isBoolean ? 'text-green-600' : 'text-purple-600'}`}>
          {stat.value}
        </span>
        <span className="text-xs sm:text-sm text-gray-500 text-center leading-tight truncate w-full px-1">
          {stat.label}
        </span>
      </div>
    ));
  };

  const handleEditCompany = () => {
    setCompanyFormDraft({ ...companyForm });
    setIsEditingCompany(true);
  };

  const handleCancelCompany = () => {
    setCompanyFormDraft({ ...companyForm });
    setLogoPreview(companyForm.company_logo || null);
    setLogoFile(null);
    setIsEditingCompany(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setCompanyFormDraft(prev => ({ ...prev, company_logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompany = async () => {
    try {
      setIsSavingCompany(true);
      const formData = new FormData();
      formData.append("company_name", companyFormDraft.company_name);
      formData.append("about_company", companyFormDraft.about_company);
      formData.append("company_website", companyFormDraft.company_website);
      formData.append("founded", companyFormDraft.founded);
      formData.append("headquarter", companyFormDraft.headquarter);
      formData.append("industry", companyFormDraft.industry);
      formData.append("company_size", companyFormDraft.company_size);

      if (logoFile) {
        formData.append("company_logo", logoFile);
      }

      await saveCompanyProfile(formData);
      await refreshUser();
      setCompanyForm({ ...companyFormDraft });
      setLogoFile(null);
      setIsEditingCompany(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCompany(false);
    }
  };

  // Initialize tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "basic" || tab === "analytics" || tab === "company" || tab === "posts")) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  const menuItems = [
    {
      icon: <FiUser />,
      label: "Personal Details",
      key: "basic" as TabType,
    },
    ...(isEmployer ? [{
      icon: <FiBriefcase />,
      label: "Company Details",
      key: "company" as TabType,
    }] : []),
    {
      icon: <FiGrid />,
      label: "My Posts and Reels",
      key: "posts" as TabType,
    },
    {
      icon: <FiBarChart2 />,
      label: "Profile Analytics",
      key: "analytics" as TabType,
    },
  ];

  // Redirect to insights page when analytics tab is selected
  useEffect(() => {
    if (activeTab === "analytics") {
      router.push("/profile/insights?tab=insights");
    }
  }, [activeTab, router]);

  // Show loading state
  if (isLoading) {
    return (
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="text-gray-600 font-medium">Loading profile...</span>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200 max-w-md">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Profile</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      {/* Profile SubMenu at the top */}
      <ProfileSubMenu
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as TabType)}
        variant="primary"
      />

      <div className={`grid grid-cols-1 lg:grid-cols-3 ${THEME.layout.spacing.xl} mt-4 md:mt-12 pb-24 lg:pb-0`}>
        <div className={`lg:col-span-2 flex flex-col ${THEME.layout.spacing.sm}`}>
          {activeTab === "basic" && <ProfileHeader profileData={profileData} />}

          {/* Tab Content */}
          <div className="animate-fadeIn">
            {activeTab === "basic" && (
              <div className="flex flex-col gap-2">
                {/* <ProfilePerformanceStats /> */}
                <ResumeUpload profileData={profileData} />
                <ImageGallery profileData={profileData} />
                <ExperienceSection experiences={profileData?.experience || []} />
                <EducationSection educations={profileData?.educations || []} />
                <ProjectsSection projects={profileData?.projectList || []} />
                <CertificationsSection certifications={profileData?.certificationList || []} />
                {/* <PersonalInfo profileData={profileData} /> */}
              </div>
            )}

            {activeTab === "company" && (
              <div className="flex flex-col gap-4">

                  {/* ── Subscription & Benefits ── */}
                <div className="relative pt-10 pb-5 px-4 md:px-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-5 py-1.5 rounded-full shadow whitespace-nowrap">
                    Subscription &amp; Benefits
                  </div>
                  {/* Top: Image + Stats */}
                  <div className="flex flex-col md:flex-row items-center gap-5 mb-5">
                    {/* Plan Image */}
                    <div className="w-full md:w-48 shrink-0">
                      {(() => {
                        const planId = (user as any)?.user_balance_employer?.plan_id;
                        const matched = plans.find(p => p.id === planId);
                        const imgSrc = matched?.plan_image || null;
                        return imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={matched?.name || 'Plan'}
                            className="w-full h-36 object-contain rounded-xl bg-gray-50 border border-gray-100 p-3"
                          />
                        ) : (
                          <div className="w-full h-36 flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-100 p-3">
                            <span className="text-sm text-gray-700">
                              {(user as any)?.user_balance_employer?.plan_name || 'No Plan'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Stats Grid - 4 columns for two rows of 4 */}
                    <div className="flex-1 grid grid-cols-4 md:grid-cols-6 gap-y-4 gap-x-2 md:gap-x-3 min-w-0">
                      {renderBalanceStats()}
                    </div>
                  </div>
                  {/* Bottom: Upgrade CTA */}
                  <div className="flex justify-center pt-3 border-t border-gray-100">
                    <Button
                      variant="primary"
                      className="text-xs px-6 py-2.5 whitespace-nowrap bg-purple-600 hover:bg-purple-700 shadow-sm"
                      onClick={() => router.push('/subscription')}
                    >
                      {!isPlanExpired((user as any)?.user_balance_employer?.plan_expiry_date) && (user as any)?.user_balance_employer?.plan_name ? 'Upgrade Plan' : 'View Plans'}
                    </Button>
                  </div>
                </div>

                {/* ── Company Details Card ── */}
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Company Details</h3>
                    {!isEditingCompany ? (
                      <button
                        onClick={handleEditCompany}
                        className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-colors flex items-center justify-center"
                        aria-label="Edit Company Details"
                      >
                        <Edit2 size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCancelCompany}
                          disabled={isSavingCompany}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                          aria-label="Cancel"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={handleSaveCompany}
                          disabled={isSavingCompany}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {isSavingCompany ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          {isSavingCompany ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* View Mode */}
                  {!isEditingCompany && (
                    <>
                      {companyForm.company_logo_url && (
                        <div className="flex justify-center mb-6">
                          <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <img src={companyForm.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-5 md:gap-x-10 md:gap-y-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Building size={18} /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">Company Name</p>
                          <p className="text-sm text-gray-600">{companyForm.company_name || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Globe size={18} /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">Website</p>
                          <p className="text-sm text-gray-600">{companyForm.company_website || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Calendar size={18} /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">Founded</p>
                          <p className="text-sm text-gray-600">{companyForm.founded || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0"><MapPin size={18} /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">Headquarter</p>
                          <p className="text-sm text-gray-600">{companyForm.headquarter || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Layers size={18} /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">Industry</p>
                          <p className="text-sm text-gray-600">{companyForm.industry || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Users size={18} /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">Company Size</p>
                          <p className="text-sm text-gray-600">{companyForm.company_size || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 md:col-span-2">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Info size={18} /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">About Company</p>
                          <p className="text-sm text-gray-600">{companyForm.about_company || 'No information provided'}</p>
                        </div>
                      </div>
                    </div>
                    </>
                  )}

                  {/* Edit Mode */}
                  {isEditingCompany && (
                    <div className="flex flex-col gap-6">
                      {/* Logo Upload Slot */}
                      <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <div
                          className="relative w-20 h-20 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center group cursor-pointer"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          {logoPreview ? (
                            <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                            <Building className="text-gray-300" size={32} />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={20} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-gray-900">Company Logo</p>
                          <p className="text-xs text-gray-500">Click to upload or change logo</p>
                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoChange}
                            className="hidden"
                            accept="image/*"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {([
                          { id: 'company_name', label: 'Company Name', placeholder: 'e.g. Curioso Technologies' },
                          { id: 'company_website', label: 'Website', placeholder: 'https://example.com' },
                          { id: 'founded', label: 'Founded Year', placeholder: 'e.g. 2021' },
                          { id: 'headquarter', label: 'Headquarter', placeholder: 'e.g. Pune, India' },
                          { id: 'industry', label: 'Industry', placeholder: 'e.g. Recruitment Technology' },
                        ] as const).map(({ id, label, placeholder }) => (
                          <div key={id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                              type="text"
                              value={companyFormDraft[id]}
                              onChange={(e) => setCompanyFormDraft((p) => ({ ...p, [id]: e.target.value }))}
                              placeholder={placeholder}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                          <select
                            value={companyFormDraft.company_size}
                            onChange={(e) => setCompanyFormDraft((p) => ({ ...p, company_size: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          >
                            <option value="">Select Company Size</option>
                            {['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1001-5000 employees', '5001-10000 employees', '10000+ employees'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">About Company</label>
                          <textarea
                            rows={4}
                            value={companyFormDraft.about_company}
                            onChange={(e) => setCompanyFormDraft((p) => ({ ...p, about_company: e.target.value }))}
                            placeholder="Briefly describe your company..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Banner Section ── */}
                <div className="max-md:scale-[0.85] max-md:origin-top">
                  <BannerContent />
                </div>
              </div>
            )}

            {activeTab === "posts" && <MyPostsAndReels />}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
            <SkillsSidebar
              skills={profileData?.skill || []}
              title={activeTab === "company" ? "Company Products & Services" : undefined}
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </ProfileLayout>
    }>
      <ProfileContent />
    </Suspense>
  );
}
