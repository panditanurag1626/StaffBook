"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/shared/MapComponent";
import PlatformActionButton from "@/components/shared/PlatformActionButton";
import { jobService } from "@/lib/api/services/jobService";
import { connectionService } from "@/lib/api/services/connectionService";
import { JobPost } from "@/lib/api/types";
import { getCurrentLocation, formatSalaryLPA } from "@/lib/utils";
import { sendNotificationToUser } from "@/lib/firebaseNotifications";
import { useAuth } from "@/context/AuthContext";
import {
  FiArrowLeft, FiMapPin, FiLoader, FiNavigation,
  FiBookmark, FiUserPlus, FiMail, FiPhone, FiSend
} from "react-icons/fi";
import toast from "react-hot-toast";

const RADIUS_KEY = "staffbook_nearby_radius";

interface EmployerPosting {
  id: string;
  company: string;
  position: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  logo?: string;
  companyLogo?: string;
  posterName?: string;
  posterImage?: string;
  posterDesignation?: string;
  isOnline?: boolean;
  lastActive?: string;
  workMode?: string;
  experienceLevel?: string;
  distance?: number;
  lat?: number;
  lng?: number;
  isSaved?: boolean;
  isApplied?: boolean;
  is_saved?: boolean;
  is_applied?: boolean;
  distanceDisplay?: string;
  skills?: string[];
  contactUserId?: number;
  contactEmail?: string;
  contactPhone?: string;
  connection_status?: string;
  postedDate?: string;
}

function mapJobResponse(job: JobPost): EmployerPosting {
  return {
    id: job.id.toString(),
    company: job.company_name || job.user?.employerDetails?.company_name || job.user?.company_name || "Company",
    position: job.job_title || job.jobtitle || "Position",
    location: job.location || `${job.city || ''}, ${job.state || ''}`.trim().replace(/^,|,$/g, '') || "N/A",
    salary: job.min_salary ? `${formatSalaryLPA(job.min_salary)} - ${formatSalaryLPA(job.max_salary)}` : (job.minimumfixedsalary ? `${formatSalaryLPA(job.minimumfixedsalary)} - ${formatSalaryLPA(job.maximumfixedsalary)}` : "Salary Not Disclosed"),
    type: job.employment_type || job.jobtype || "Full-time",
    description: job.job_description || job.jobdescription || "No description provided.",
    posterName: job.posted_by_name || (job.user ? `${job.user.first_name} ${job.user.last_name}` : "Recruiter"),
    posterImage: job.user?.picture || job.user?.image || "/images/user_profile_placeholder.jpeg",
    posterDesignation: job.user?.employerDetails?.designation || job.user?.designation || job.user?.employerDetails?.job_title || (job as any).poster_designation || (job as any).poster_designation_text || null,
    isOnline: job.user?.online === 1,
    lastActive: job.user?.last_active ? "Active" : "Away",
    companyLogo: job.user?.employerDetails?.company_logo_url || job.companyLogoUrl || job.company_logo_url || job.user?.picture || job.user?.image || null,
    workMode: job.work_mode || job.joblocation || "On-site",
    experienceLevel: job.min_experience_years ? `${job.min_experience_years}-${job.max_experience_years} Yrs` : (job.minimumexperience || "Both"),
    distance: job.distance || 0,
    lat: job.latitude ? parseFloat(job.latitude) : (job.maplat as number),
    lng: job.longitude ? parseFloat(job.longitude) : (job.maplong as number),
    isSaved: job.is_saved,
    isApplied: job.is_applied,
    is_applied: job.is_applied,
    is_saved: job.is_saved,
    distanceDisplay: job.distance_display,
    skills: job.key_skills ? job.key_skills.split(',').map(s => s.trim()) : [],
    contactUserId: job.user?.id,
    contactEmail: job.user?.email || job.user?.employerDetails?.professional_email,
    contactPhone: job.user?.phone,
    connection_status: (job.user as any)?.connection_status || 'not_connected',
    postedDate: String((job as any).created_at || (job as any).postedDate || (job as any).updated_at || ''),
  };
}

export default function NearbyJobsMapPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [postings, setPostings] = useState<EmployerPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [radius, setRadius] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(RADIUS_KEY);
      return saved ? Number(saved) : 25;
    }
    return 25;
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 19.076, lng: 72.8777 });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Persist radius
  useEffect(() => {
    localStorage.setItem(RADIUS_KEY, String(radius));
  }, [radius]);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        if (loc) setUserLocation(loc);
      } catch {
        // fallback to default
      }
    })();
  }, []);

  const fetchNearbyJobs = useCallback(
    async (page: number, replace = false) => {
      if (page === 1) setLoading(true);
      try {
        const filterParams: any = {
          expand: 'apply,save',
          status: 'Active',
          max_distance: radius,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          page,
          'per-page': 10,
        };
        const res = await jobService.getNearbyJobs(filterParams);
        const items = (res?.data?.items || []).filter((job: any) => {
          const status = (job.status || '').toLowerCase();
          return status === 'active' || status === '';
        });
        const pagination = res?.data?._meta || null;

        const mapped = items.map(mapJobResponse);
        setPostings((prev) => (replace || page === 1 ? mapped : [...prev, ...mapped]));

        if (pagination) {
          setTotalCount(pagination.totalCount || 0);
          setHasMore(page < (pagination.pageCount || 1));
        } else {
          setHasMore(false);
        }
        setCurrentPage(page);
      } catch (e: any) {
        toast.error("Failed to load nearby jobs");
      } finally {
        setLoading(false);
      }
    },
    [radius, userLocation]
  );

  // Fetch on mount and radius change
  useEffect(() => {
    if (!userLocation.lat && !userLocation.lng) return;
    setPostings([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchNearbyJobs(1, true);
  }, [radius, userLocation, fetchNearbyJobs]);

  // Infinite scroll on desktop
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchNearbyJobs(currentPage + 1);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, currentPage, fetchNearbyJobs]);

  const handleRadiusChange = (val: number) => {
    setRadius(val);
  };

  const handleApply = (job: EmployerPosting) => {
    router.push(`/profile/jobs/${job.id}`);
  };

  const toggleSaveJob = async (job: EmployerPosting) => {
    try {
      const isCurrentlySaved = job.is_saved !== undefined ? job.is_saved : job.isSaved;
      const numericId = typeof job.id === 'string' ? parseInt(job.id) : job.id;

      if (isCurrentlySaved) {
        await jobService.unsaveJob(numericId);
      } else {
        await jobService.saveJob(numericId);
      }

      setPostings(prev => prev.map(j => {
        if (j.id.toString() === job.id.toString()) {
          return { ...j, is_saved: !isCurrentlySaved, isSaved: !isCurrentlySaved };
        }
        return j;
      }));
    } catch (err) {
      console.error("Failed to toggle save job:", err);
    }
  };

  const handleConnectRequest = async (e: React.MouseEvent, targetUserId: number | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id || !targetUserId) {
      toast.error('Unable to send connection request.');
      return;
    }
    try {
      await connectionService.sendConnectionRequest(Number(user.id), targetUserId);
      await sendNotificationToUser(
        targetUserId,
        Number(user.id),
        `${user.first_name} ${user.last_name}`,
        user.picture || '',
        'connection_request',
        `${user.first_name} ${user.last_name} sent you a connection request.`
      );
      toast.success('Connection request sent!');
    } catch (error: any) {
      const apiError = error?.response?.data?.data?.errors?.message?.[0] || error?.response?.data?.message || 'Failed to send connection request.';
      toast.error(apiError);
    }
  };

  const handleShowEmployerContact = async (e: React.MouseEvent, p: EmployerPosting) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const resp = await jobService.getEmployerContactDetails(p.id);
      const data = resp as any;
      const isSuccess = data?.status === 200 ||
        data?.status === 201 ||
        data?.data?.already_unlocked ||
        data?.data?.data?.already_unlocked ||
        data?.data?.credit_consumed ||
        data?.data?.data?.credit_consumed;

      if (isSuccess) {
        toast.success(data?.message || 'Contact unlocked');
      } else {
        throw new Error(data?.message || "Failed to reveal contact");
      }
    } catch (err: any) {
      let errMsg = err?.response?.data?.data?.errors?.message?.[0] || err?.response?.data?.message || err.message || 'Failed to reveal contact';
      toast.error(errMsg);
    }
  };

  const handleShowEmployerEmail = async (e: React.MouseEvent, p: EmployerPosting) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const resp = await jobService.getEmployerEmailDetails(p.id);
      const data = resp as any;
      const isSuccess = data?.status === 200 ||
        data?.status === 201 ||
        data?.data?.already_unlocked ||
        data?.data?.data?.already_unlocked ||
        data?.data?.credit_consumed ||
        data?.data?.data?.credit_consumed;

      if (isSuccess) {
        toast.success(data?.message || 'Email unlocked');
      } else {
        throw new Error(data?.message || "Failed to reveal email");
      }
    } catch (err: any) {
      let errMsg = err?.response?.data?.data?.errors?.message?.[0] || err?.response?.data?.message || err.message || 'Failed to reveal email';
      toast.error(errMsg);
    }
  };

  const formatConnStatus = (status?: string) => {
    if (status === 'connected') return 'Connected';
    if (!status || status === 'not_connected') return 'Connect';
    return 'Pending';
  };

  return (
    <div className="h-[100dvh] bg-[#f3f2ed] flex flex-col overflow-hidden">
      <Navbar />
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "calc(100dvh - 70px)", marginTop: "70px" }}
      >
        {/* Page Header Bar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => router.push("/profile/jobs?tab=browse")}
            className="flex items-center gap-1.5 text-sm text-gray-900 hover:text-purple-700 transition-colors font-medium"
          >
            <FiArrowLeft size={16} />
            Back
          </button>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
              <FiMapPin size={14} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">
                Explore Nearby Jobs
              </h1>
              <p className="text-xs font-medium text-gray-600 mt-0.5">
                {totalCount} jobs within {radius} km
              </p>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 hidden sm:block">
              Search Radius
            </span>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-24 sm:w-36 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${radius}%, #e5e7eb ${radius}%, #e5e7eb 100%)`,
              }}
            />
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full min-w-[58px] text-center">
              <span className="text-xs font-bold text-purple-700">{radius} km</span>
            </div>
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT — Map */}
          <div className="flex-1 relative min-h-0">
            <MapComponent
              radius={radius}
              className="h-full w-full"
              type="jobs"
              embedded={true}
              jobs={postings.map((j) => ({
                id: j.id,
                lat: j.lat || 0,
                lng: j.lng || 0,
                title: j.position,
                company: j.company,
                salary: j.salary,
                phone: j.contactPhone,
                email: j.contactEmail,
                posterName: j.posterName,
                posterImage: j.posterImage,
                distance: j.distance,
                isOnline: j.isOnline,
              }))}
              onRadiusChange={handleRadiusChange}
            />
          </div>

          {/* RIGHT / BOTTOM — Cards Panel */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none lg:pointer-events-auto lg:relative w-full lg:w-[400px] shrink-0 bg-transparent lg:bg-white lg:border-l lg:border-gray-100 flex flex-col lg:overflow-hidden lg:shadow-xl pb-[70px] lg:pb-0">
            {/* Panel Header — desktop only */}
            <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0 pointer-events-auto">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Nearby Jobs
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {loading ? "Searching..." : `${totalCount} jobs found`}
                </p>
              </div>
            </div>

            {/* Scrollable Cards */}
            <div className="flex-1 overflow-x-auto lg:overflow-x-hidden overflow-y-hidden lg:overflow-y-auto px-4 lg:p-3 flex flex-row lg:flex-col gap-4 lg:gap-3 snap-x snap-mandatory pointer-events-auto w-full max-w-[100vw] lg:bg-gray-50/30 hide-scroll max-h-[280px] lg:max-h-none lg:custom-scrollbar">
              {loading && postings.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full py-12">
                  <FiLoader className="w-6 h-6 text-purple-600 animate-spin" />
                </div>
              ) : postings.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full h-full py-12 text-center">
                  <FiMapPin size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">
                    No jobs found nearby
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Try increasing the search radius
                  </p>
                </div>
              ) : (
                <>
                  {postings.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleApply(job)}
                      className="w-[75vw] sm:w-[300px] lg:w-auto shrink-0 snap-center bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col p-5 cursor-pointer"
                    >
                      {/* Top row: Logo + Info */}
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                          {job.companyLogo ? (
                            <img src={`${job.companyLogo}${job.companyLogo.includes('?') ? '&' : '?'}_t=${(job as any).postedDate || Date.now()}`} alt={job.company} className="w-full h-full object-contain p-2" />
                          ) : (
                            <span className="text-xl font-bold text-gray-300">
                              {(job.company || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">
                            {job.position}
                          </h4>
                          <div className="my-2 border-t border-gray-100" />
                          <p className="text-xs font-medium text-gray-600 truncate">
                            {job.company}
                          </p>
                          {job.distanceDisplay && (
                            <p className="text-[10px] text-purple-500 font-medium mt-0.5 flex items-center gap-1">
                              <FiNavigation size={9} />
                              {job.distanceDisplay}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            {[job.location, job.type, job.salary].filter(Boolean).join(" • ") || ""}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around gap-1">
                        <PlatformActionButton
                          icon={FiBookmark}
                          label="Save"
                          showLabelBelow
                          isSaved={job.isSaved || job.is_saved}
                          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job); }}
                          size="sm"
                        />
                        <PlatformActionButton
                          icon={FiUserPlus}
                          label="Connect"
                          showLabelBelow
                          isRevealed={job.connection_status === 'connected'}
                          isLocked={job.connection_status === 'pending'}
                          disabled={!!(job.connection_status && job.connection_status !== 'not_connected')}
                          onClick={(e) => { e.stopPropagation(); handleConnectRequest(e, job.contactUserId); }}
                          size="sm"
                        />
                        <PlatformActionButton
                          icon={FiMail}
                          label="Email"
                          showLabelBelow
                          onClick={(e) => { e.stopPropagation(); handleShowEmployerEmail(e, job); }}
                          size="sm"
                        />
                        <PlatformActionButton
                          icon={FiPhone}
                          label="Contact"
                          showLabelBelow
                          onClick={(e) => { e.stopPropagation(); handleShowEmployerContact(e, job); }}
                          size="sm"
                        />
                        <PlatformActionButton
                          icon={FiSend}
                          label="Apply"
                          showLabelBelow
                          isRevealed={job.is_applied}
                          disabled={job.is_applied}
                          onClick={(e) => { e.stopPropagation(); if (!(job.is_applied)) handleApply(job); }}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                  {/* Infinite scroll sentinel */}
                  <div ref={sentinelRef} className="w-full h-4 shrink-0" />
                  {hasMore && (
                    <div className="flex items-center justify-center py-4 shrink-0 w-full">
                      <FiLoader className="w-5 h-5 text-purple-600 animate-spin" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .hide-scroll {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .hide-scroll::-webkit-scrollbar {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
