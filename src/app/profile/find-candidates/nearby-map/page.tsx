"use client";

import React, { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/shared/MapComponent";
import CandidateCompactCard from "@/components/shared/CandidateCompactCard";
import { jobService } from "@/lib/api/services/jobService";
import { Candidate } from "@/types/candidate";
import { getCurrentLocation } from "@/lib/utils";
import { FiArrowLeft, FiMapPin, FiLoader, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";

const RADIUS_KEY = "staffbook_nearby_radius";

function mapApiCandidate(item: any): Candidate {
  const c = item.candidate || item;
  return {
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
    title: c.designation || c.preferred_role || "Candidate",
    company: c.employerDetails?.company_name || "",
    location: c.location || `${c.city || ""}, ${c.country || ""}`.replace(/^, |, $/, ""),
    experience: c.total_experience || `${c.total_experience_years || 0} years`,
    skills: (c.skill && c.skill.length > 0
      ? c.skill
      : c.experience && c.experience.length > 0 && c.experience[0].skills
        ? c.experience[0].skills
        : []
    ).map((s: any) => {
      if (typeof s === "string") return { title: s };
      return { title: s.title || s.skill_name || s.name || "" };
    }),
    education: "",
    distance_display:
      item?.distance?.display ??
      item?.distance_display ??
      item?.distance_from_job?.km ??
      c?.distance_km ??
      undefined,
    image: c.picture || "/images/user_profile_placeholder.jpeg",
    lastActive: c.last_active || "",
    isOnline: c.online === 1,
    email: c.email || "",
    phone: c.phone || "",
    resumeUrl: c.resumeUpload?.url || null,
    userId: String(c.id),
    lat: c.latitude ? parseFloat(c.latitude) : undefined,
    lng: c.longitude ? parseFloat(c.longitude) : undefined,
    is_premium: Boolean(c.is_premium),
    is_invited: Boolean(
      item.invite?.is_invited ||
      c.invite?.is_invited ||
      item.invite_any?.is_invited ||
      item.is_invited ||
      c.is_invited
    ),
    invite: item.invite || c.invite || item.invite_any || null,
  };
}

export default function NearbyMapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <FiLoader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    }>
      <NearbyMapPageContent />
    </Suspense>
  );
}

function NearbyMapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
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

  const selectedJobId = typeof window !== "undefined"
    ? localStorage.getItem("staffbook_selectedJobId")
    : null;

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

  const fetchCandidates = useCallback(
    async (page: number, replace = false) => {
      if (page === 1) setLoading(true);
      try {
        const res = await jobService.findNearbyCandidates(
          selectedJobId,
          radius,
          page,
          10
        );
        const data = res?.data?.data?.data || res?.data?.data || [];
        const pagination = res?.data?.data?.pagination || null;
        const items = Array.isArray(data) ? data.map(mapApiCandidate) : [];

        setCandidates((prev) => (replace || page === 1 ? items : [...prev, ...items]));
        if (pagination) {
          setTotalCount(pagination.total || 0);
          setHasMore(page < (pagination.total_pages || 1));
        } else {
          setHasMore(false);
        }
        setCurrentPage(page);
      } catch (e: any) {
        toast.error("Failed to load nearby candidates");
      } finally {
        setLoading(false);
      }
    },
    [radius, selectedJobId]
  );

  // Fetch on mount and radius change
  useEffect(() => {
    setCandidates([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchCandidates(1, true);
  }, [radius, fetchCandidates]);

  // Infinite scroll on desktop
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchCandidates(currentPage + 1);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, currentPage, fetchCandidates]);

  const handleRadiusChange = (val: number) => {
    setRadius(val);
  };

  const handleDownloadResume = (name: string) => {
    toast.success(`Downloading resume for ${name}`);
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
            onClick={() => router.push("/profile/find-candidates?tab=find-candidates")}
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
                Explore Nearby Candidates
              </h1>
              <p className="text-xs font-medium text-gray-600 mt-0.5">
                {totalCount} candidates within {radius} km
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
              type="users"
              context="find-candidates"
              embedded={true}
              jobPostId={selectedJobId || undefined}
              users={candidates.map((c) => ({
                id: String(c.userId || c.id),
                name: c.name,
                role: c.title,
                avatar: c.image,
                lat: c.lat,
                lng: c.lng,
                is_premium: c.is_premium,
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
                  Nearby Candidates
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {loading ? "Searching..." : `${totalCount} candidates found`}
                </p>
              </div>
            </div>

            {/* Scrollable Cards */}
            <div className="flex-1 overflow-x-auto lg:overflow-x-hidden overflow-y-hidden lg:overflow-y-auto px-4 lg:p-3 flex flex-row lg:flex-col gap-4 lg:gap-3 snap-x snap-mandatory pointer-events-auto w-full max-w-[100vw] lg:bg-gray-50/30 hide-scroll max-h-[280px] lg:max-h-none lg:custom-scrollbar">
              {loading && candidates.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full py-12">
                  <FiLoader className="w-6 h-6 text-purple-600 animate-spin" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full h-full py-12 text-center">
                  <FiMapPin size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">
                    No candidates found nearby
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Try increasing the search radius
                  </p>
                </div>
              ) : (
                <>
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="w-[75vw] sm:w-[300px] lg:w-auto shrink-0 snap-center"
                    >
                      <CandidateCompactCard
                        candidate={candidate}
                        jobPostId={selectedJobId ? Number(selectedJobId) : undefined}
                        onDownloadResume={handleDownloadResume}
                      />
                      {/* Mobile name label below card */}
                      <p className="lg:hidden text-xs font-semibold text-gray-700 text-center mt-1 truncate">
                        {candidate.name}
                      </p>
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
