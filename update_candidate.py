import re

with open('src/app/profile/find-candidates/[candidateId]/page.tsx', 'r') as f:
    content = f.read()

# 1. Add import
content = content.replace('import React, { useState } from "react";', 'import React, { useState, useEffect } from "react";\nimport { jobService } from "@/lib/api/services/jobService";')

# 2. Extract out candidatesData
content = re.sub(r'// Mock candidate data.*?const candidatesData: any = \{.*?\n};\n', '', content, flags=re.DOTALL)

# 3. Modify CandidateDetailPage body starting
old_body = """export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  const candidate = candidatesData[candidateId];

  const [activeView, setActiveView] = useState<'overview' | 'posts' | 'connections'>('overview');
  const [isNoteVisible, setIsNoteVisible] = useState(false);

  if (!candidate) {"""

new_body = """export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'posts' | 'connections'>('overview');
  const [isNoteVisible, setIsNoteVisible] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await jobService.getJobApplicantDetails(candidateId);
        if (res && res.data) {
          setCandidate(res.data);
        } else {
          setCandidate(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (candidateId) fetchDetails();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mt-2">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  const name = candidate?.name || candidate?.full_name || candidate?.user?.first_name || 'NA';
  const title = candidate?.title || candidate?.designation || candidate?.job_title || 'NA';
  const location = candidate?.location || candidate?.city || 'NA';
  const experience = candidate?.experience || candidate?.total_experience || 'NA';
  const education = candidate?.education || candidate?.highest_education || 'NA';
  const image = candidate?.image || candidate?.profile_url || candidate?.user?.profile_url || '/images/user_profile_placeholder.jpeg';
  const lastActive = candidate?.lastActive || candidate?.last_seen || 'NA';
  const isOnline = candidate?.isOnline || false;
  const currentSalary = candidate?.currentSalary || candidate?.current_salary || 'NA';
  const expectedSalary = candidate?.salary || candidate?.expected_salary || 'NA';
  const distance = candidate?.distance || 'NA';
  const about = candidate?.about || candidate?.bio || candidate?.description || 'NA';
  const hasReel = candidate?.hasReel || candidate?.has_reel || false;
  
  const rawSkills = candidate?.skills || candidate?.key_skills;
  const skillsList = Array.isArray(rawSkills) ? rawSkills : (typeof rawSkills === 'string' ? rawSkills.split(',').map((s: string) => s.trim()) : []);
  
  const historyList = Array.isArray(candidate?.history) ? candidate.history : [];
  const latestCompany = historyList[0]?.company || candidate?.company_name || '';

  if (!candidate) {"""

content = content.replace(old_body, new_body)

content = content.replace('candidate.name', 'name')
content = content.replace('candidate.title', 'title')
content = content.replace('candidate.location', 'location')
content = content.replace('candidate.experience', 'experience')
content = content.replace('candidate.education', 'education')
content = content.replace('candidate.image', 'image')
content = content.replace('candidate.lastActive', 'lastActive')
content = content.replace('candidate.isOnline', 'isOnline')
content = content.replace('candidate.currentSalary', 'currentSalary')
content = content.replace('candidate.salary', 'expectedSalary')
content = content.replace('candidate.distance &&', 'distance !== "NA" &&')
content = content.replace('candidate.distance', 'distance')
content = content.replace('candidate.about', 'about')
content = content.replace('candidate.hasReel', 'hasReel')
content = content.replace('candidate.skills', 'skillsList')
content = content.replace('candidate.history', 'historyList')

with open('src/app/profile/find-candidates/[candidateId]/page.tsx', 'w') as f:
    f.write(content)

