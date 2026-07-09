"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProfileLayout from '../../../components/shared/ProfileLayout';
import ProfileSubMenu from '@/components/shared/ProfileSubMenu';
import {
  FiTrendingUp,
  FiBook,
  FiTarget,
  FiAward,
  FiStar,
  FiPlay,
  FiClock,
  FiUsers,
  FiChevronRight,
  FiBookOpen,
  FiBarChart,
  FiCalendar,
  FiArrowRight,
  FiCheckCircle,
  FiCircle,
  FiCode,
  FiDatabase,
  FiGitBranch,
  FiSmartphone,
  FiCloud,
  FiEye,
  FiHeart,
  FiCpu,
  FiActivity,
} from "react-icons/fi";

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  inDemand: boolean;
  growthPotential: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  progress: number;
  category: string;
  rating: number;
  enrollments: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "certification" | "course" | "project" | "skill";
  verified: boolean;
}

interface CareerGoal {
  id: string;
  title: string;
  targetRole: string;
  timeframe: string;
  progress: number;
  requiredSkills: string[];
  status: "active" | "completed" | "paused";
}

function DevelopmentContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "overview" | "skills" | "learning" | "achievements" | "goals"
  >(searchParams.get("tab") as any || "overview");

  // Update activeTab when URL changes
  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const skills: Skill[] = [
    {
      id: "1",
      name: "React",
      level: 85,
      category: "Frontend",
      inDemand: true,
      growthPotential: "+23%",
    },
    {
      id: "2",
      name: "TypeScript",
      level: 78,
      category: "Programming",
      inDemand: true,
      growthPotential: "+31%",
    },
    {
      id: "3",
      name: "Node.js",
      level: 72,
      category: "Backend",
      inDemand: true,
      growthPotential: "+18%",
    },
    {
      id: "4",
      name: "Python",
      level: 65,
      category: "Programming",
      inDemand: true,
      growthPotential: "+28%",
    },
    {
      id: "5",
      name: "AWS",
      level: 45,
      category: "Cloud",
      inDemand: true,
      growthPotential: "+42%",
    },
    {
      id: "6",
      name: "Docker",
      level: 55,
      category: "DevOps",
      inDemand: true,
      growthPotential: "+35%",
    },
  ];

  const learningPaths: LearningPath[] = [
    {
      id: "1",
      title: "Full-Stack Development Mastery",
      description:
        "Complete path from frontend to backend development with modern technologies",
      duration: "12 weeks",
      difficulty: "Intermediate",
      skills: ["React", "Node.js", "MongoDB", "TypeScript"],
      progress: 45,
      category: "Full-Stack",
      rating: 4.8,
      enrollments: 2840,
    },
    {
      id: "2",
      title: "Cloud Architecture with AWS",
      description:
        "Learn to design and deploy scalable applications on Amazon Web Services",
      duration: "8 weeks",
      difficulty: "Advanced",
      skills: ["AWS", "Docker", "Kubernetes", "Serverless"],
      progress: 0,
      category: "Cloud",
      rating: 4.9,
      enrollments: 1560,
    },
    {
      id: "3",
      title: "AI/ML for Developers",
      description:
        "Practical machine learning and AI implementation for web developers",
      duration: "10 weeks",
      difficulty: "Intermediate",
      skills: ["Python", "TensorFlow", "Data Science", "APIs"],
      progress: 25,
      category: "AI/ML",
      rating: 4.7,
      enrollments: 3200,
    },
    {
      id: "4",
      title: "Mobile Development with React Native",
      description: "Build cross-platform mobile apps using React Native",
      duration: "6 weeks",
      difficulty: "Beginner",
      skills: ["React Native", "JavaScript", "Mobile UI", "App Store"],
      progress: 0,
      category: "Mobile",
      rating: 4.6,
      enrollments: 1890,
    },
  ];

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "React Developer Certification",
      description: "Completed advanced React development course with honors",
      date: "2024-01-15",
      type: "certification",
      verified: true,
    },
    {
      id: "2",
      title: "Full-Stack E-commerce Project",
      description:
        "Built a complete e-commerce platform with React and Node.js",
      date: "2024-01-10",
      type: "project",
      verified: true,
    },
    {
      id: "3",
      title: "JavaScript Algorithms & Data Structures",
      description: "Mastered core programming concepts and problem-solving",
      date: "2023-12-28",
      type: "course",
      verified: true,
    },
    {
      id: "4",
      title: "TypeScript Expert",
      description: "Achieved expert level proficiency in TypeScript",
      date: "2023-12-15",
      type: "skill",
      verified: true,
    },
  ];

  const careerGoals: CareerGoal[] = [
    {
      id: "1",
      title: "Senior Full-Stack Developer",
      targetRole: "Senior Full-Stack Developer",
      timeframe: "6 months",
      progress: 75,
      requiredSkills: ["React", "Node.js", "System Design", "Team Leadership"],
      status: "active",
    },
    {
      id: "2",
      title: "Cloud Solutions Architect",
      targetRole: "Cloud Solutions Architect",
      timeframe: "12 months",
      progress: 30,
      requiredSkills: ["AWS", "System Architecture", "DevOps", "Security"],
      status: "active",
    },
    {
      id: "3",
      title: "Tech Lead Position",
      targetRole: "Technical Lead",
      timeframe: "18 months",
      progress: 20,
      requiredSkills: [
        "Leadership",
        "Architecture",
        "Mentoring",
        "Project Management",
      ],
      status: "active",
    },
  ];

  const getSkillIcon = (category: string) => {
    switch (category) {
      case "Frontend":
        return <FiCode className="text-blue-600" size={20} />;
      case "Backend":
        return <FiDatabase className="text-green-600" size={20} />;
      case "Programming":
        return <FiGitBranch className="text-purple-600" size={20} />;
      case "Mobile":
        return <FiSmartphone className="text-orange-600" size={20} />;
      case "Cloud":
        return <FiCloud className="text-cyan-600" size={20} />;
      case "DevOps":
        return <FiTarget className="text-red-600" size={20} />;
      default:
        return <FiCode className="text-gray-600" size={20} />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "paused":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const developmentMenuItems = [
    { icon: <FiBarChart size={18} />, label: 'Overview', key: 'overview' },
    { icon: <FiCode size={18} />, label: 'Skills', key: 'skills' },
    { icon: <FiBook size={18} />, label: 'Learning Paths', key: 'learning' },
    { icon: <FiAward size={18} />, label: 'Achievements', key: 'achievements' },
    { icon: <FiTarget size={18} />, label: 'Career Goals', key: 'goals' },
  ];

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <div className="min-h-screen bg-gradient-to-br from-light-bg to-[#F3EFFF] px-3 sm:px-6">
        <ProfileSubMenu
          menuItems={developmentMenuItems}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as any)}
        />
        <div className="max-w-7xl mx-auto">
        {/* Enhanced Breadcrumb */}
        {/* <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <nav
            className="flex items-center text-sm font-medium"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center space-x-1">
              <li>
                <Link
                  href="/networking"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight
                  className="mx-2 text-gray-400 group-hover:text-primary transition-colors duration-200"
                  size={16}
                />
              </li>
              <li>
                <Link
                  href="/profile"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Profile
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight className="mx-2 text-gray-400" size={16} />
              </li>
              <li>
                <span className="flex items-center px-4 py-2.5 rounded-lg text-primary bg-gradient-to-r from-light-bg to-light-bg font-semibold shadow-sm border border-[#E5E3FF]">
                  <FiBook className="mr-2" size={16} />
                  Career Development
                </span>
              </li>
            </ol>
          </nav>
        </div> */}

        {/* Header */}
        <div className="mb-8 mt-[4rem]">
          <h1 className="text-3xl md:text-2xl font-bold font-Montserrat text-primary">
            Career Growth & Learning
          </h1>
          <p className="text-lg text-[#666] font-Montserrat">
            Accelerate your career with personalized learning paths and skill
            development
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-[6px] mb-[3px]">
          {/* <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                <FiAward size={16} className="md:hidden" />
                <FiAward size={20} className="hidden md:block" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#222]">
                  12
                </h3>
                <p className="text-xs md:text-sm text-[#666]">
                  Skills Mastered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm text-green-600">
              <FiTrendingUp size={12} className="md:hidden" />
              <FiTrendingUp size={14} className="hidden md:block" />
              <span className="font-bold">+3 this month</span>
            </div>
          </div> */}

          {/* <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiBook size={16} className="md:hidden" />
                <FiBook size={20} className="hidden md:block" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#222]">8</h3>
                <p className="text-xs md:text-sm text-[#666]">Active Courses</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm text-blue-600">
              <FiStar size={12} className="md:hidden" />
              <FiStar size={14} className="hidden md:block" />
              <span className="font-bold">65% avg progress</span>
            </div>
          </div> */}

          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-secondary to-gradient-start text-white">
                <FiAward size={16} className="md:hidden" />
                <FiAward size={20} className="hidden md:block" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#222]">5</h3>
                <p className="text-xs md:text-sm text-[#666]">Certifications</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm text-green-600">
              <FiAward size={12} className="md:hidden" />
              <FiAward size={14} className="hidden md:block" />
              <span className="font-bold">2 verified</span>
            </div>
          </div>

          {/* <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiTarget size={16} className="md:hidden" />
                <FiTarget size={20} className="hidden md:block" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#222]">3</h3>
                <p className="text-xs md:text-sm text-[#666]">Career Goals</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm text-purple-600">
              <FiTarget size={12} className="md:hidden" />
              <FiTarget size={14} className="hidden md:block" />
              <span className="font-bold">1 near completion</span>
            </div>
          </div> */}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-[#E8E4FF] mb-8 overflow-x-auto mt-[1rem]">
          <div className="flex gap-2 min-w-max">
            {[
              {
                key: "overview",
                label: "Overview",
                icon: <FiBarChart size={16} className="md:hidden" />,
                iconLarge: <FiBarChart size={18} className="hidden md:block" />,
              },
              // {
              //   key: "skills",
              //   label: "Skills",
              //   icon: <FiActivity size={16} className="md:hidden" />,
              //   iconLarge: <FiActivity size={18} className="hidden md:block" />,
              // },
              // {
              //   key: "learning",
              //   label: "Learning Paths",
              //   icon: <FiBookOpen size={16} className="md:hidden" />,
              //   iconLarge: <FiBookOpen size={18} className="hidden md:block" />,
              // },
              {
                key: "achievements",
                label: "Achievements",
                icon: <FiAward size={16} className="md:hidden" />,
                iconLarge: <FiAward size={18} className="hidden md:block" />,
              },
              // {
              //   key: "goals",
              //   label: "Career Goals",
              //   icon: <FiTarget size={16} className="md:hidden" />,
              //   iconLarge: <FiTarget size={18} className="hidden md:block" />,
              // },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-lg"
                    : "text-[#666] hover:text-primary hover:bg-light-bg"
                }`}
              >
                {tab.icon}
                {tab.iconLarge}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">
                  {tab.label.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
              <h2 className="text-xl md:text-2xl font-bold text-[#222] font-Montserrat mb-6">
                Your Learning Journey
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-[#222] mb-4">
                    Current Focus Areas
                  </h3>
                  <div className="space-y-3">
                    {learningPaths
                      .filter((path) => path.progress > 0)
                      .map((path) => (
                        <div
                          key={path.id}
                          className="flex items-center justify-between p-4 bg-light-bg rounded-xl"
                        >
                          <div className="flex-1">
                            <h4 className="font-bold text-[#222] text-sm md:text-base">
                              {path.title}
                            </h4>
                            <p className="text-xs md:text-sm text-[#666] mb-2">
                              {path.duration} • {path.difficulty}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-[#E8E4FF] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                                  style={{ width: `${path.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-primary">
                                {path.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#222] mb-4">
                    Skill Development
                  </h3>
                  <div className="space-y-3">
                    {skills.slice(0, 4).map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {getSkillIcon(skill.category)}
                          <span className="font-medium text-[#222] text-sm md:text-base">
                            {skill.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 md:w-20 h-2 bg-[#F3EFFF] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                          <span className="text-xs md:text-sm font-bold text-secondary">
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                    <FiTarget size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#222]">
                    Recommended Next Steps
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-light-bg rounded-lg">
                    <FiTarget className="text-primary mt-1" size={16} />
                    <div>
                      <h4 className="font-bold text-[#222] text-sm">
                        Complete AWS Certification
                      </h4>
                      <p className="text-xs text-[#666]">
                        Boost your cloud skills and increase market value
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-light-bg rounded-lg">
                    <FiCode className="text-primary mt-1" size={16} />
                    <div>
                      <h4 className="font-bold text-[#222] text-sm">
                        Practice System Design
                      </h4>
                      <p className="text-xs text-[#666]">
                        Essential for senior developer positions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-light-bg rounded-lg">
                    <FiUsers className="text-primary mt-1" size={16} />
                    <div>
                      <h4 className="font-bold text-[#222] text-sm">
                        Develop Leadership Skills
                      </h4>
                      <p className="text-xs text-[#666]">
                        Prepare for tech lead opportunities
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                    <FiTrendingUp size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#222]">
                    Market Trends
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg">
                    <div>
                      <h4 className="font-bold text-[#222] text-sm">
                        AI/ML Integration
                      </h4>
                      <p className="text-xs text-[#666]">High demand skill</p>
                    </div>
                    <span className="text-xs font-bold text-green-600">
                      +45%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg">
                    <div>
                      <h4 className="font-bold text-[#222] text-sm">
                        Cloud Architecture
                      </h4>
                      <p className="text-xs text-[#666]">Growing fast</p>
                    </div>
                    <span className="text-xs font-bold text-green-600">
                      +38%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg">
                    <div>
                      <h4 className="font-bold text-[#222] text-sm">
                        DevOps Practices
                      </h4>
                      <p className="text-xs text-[#666]">Essential skill</p>
                    </div>
                    <span className="text-xs font-bold text-green-600">
                      +32%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#222] font-Montserrat">
                Skill Assessment
              </h2>
              <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                Take Skill Assessment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getSkillIcon(skill.category)}
                      <div>
                        <h3 className="font-bold text-[#222]">{skill.name}</h3>
                        <p className="text-sm text-[#666]">{skill.category}</p>
                      </div>
                    </div>
                    {skill.inDemand && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        IN DEMAND
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#666]">Proficiency</span>
                      <span className="text-sm font-bold text-secondary">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#F3EFFF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <FiTrendingUp size={14} />
                      <span className="font-bold">{skill.growthPotential}</span>
                    </div>
                    <button className="text-primary hover:text-[#4A4AD6] font-medium text-sm">
                      Improve →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Gap Analysis */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
              <h3 className="text-xl font-bold text-[#222] mb-6">
                Skill Gap Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-[#222] mb-4">
                    Trending Skills to Learn
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiCloud className="text-blue-600" size={20} />
                        <span className="font-medium text-[#222]">
                          Kubernetes
                        </span>
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        +42% demand
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiActivity className="text-purple-600" size={20} />
                        <span className="font-medium text-[#222]">
                          Machine Learning
                        </span>
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        +38% demand
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiGitBranch className="text-orange-600" size={20} />
                        <span className="font-medium text-[#222]">GraphQL</span>
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        +35% demand
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-[#222] mb-4">
                    Skills to Strengthen
                  </h4>
                  <div className="space-y-3">
                    {skills
                      .filter((skill) => skill.level < 70)
                      .map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getSkillIcon(skill.category)}
                            <span className="font-medium text-[#222]">
                              {skill.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-orange-600">
                            {skill.level}% proficient
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Learning Paths Tab */}
        {activeTab === "learning" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#222] font-Montserrat">
                Learning Paths
              </h2>
              <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                Browse All Paths
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <div
                  key={path.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[#222]">
                          {path.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full border ${getDifficultyColor(path.difficulty)}`}
                        >
                          {path.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-[#666] mb-3">
                        {path.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#666] mb-4">
                        <div className="flex items-center gap-1">
                          <FiClock size={14} />
                          {path.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiStar size={14} />
                          {path.rating}/5
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUsers size={14} />
                          {path.enrollments.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#666]">Progress</span>
                      <span className="text-sm font-bold text-secondary">
                        {path.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F3EFFF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-[#222] mb-2">
                      Skills you'll learn:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-light-bg text-primary text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {path.progress > 0 ? (
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                        <FiPlay size={16} />
                        Continue
                      </button>
                    ) : (
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                        <FiPlay size={16} />
                        Start Learning
                      </button>
                    )}
                    <button className="px-4 py-2 border border-[#E8E4FF] rounded-lg hover:border-gradient-end transition-colors duration-300">
                      <FiHeart size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Statistics */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
              <h3 className="text-xl font-bold text-[#222] mb-6">
                Your Learning Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end text-white font-bold text-xl flex items-center justify-center">
                    42
                  </div>
                  <p className="text-sm text-[#666]">Hours Learned</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gradient-end to-gradient-end text-white font-bold text-xl flex items-center justify-center">
                    8
                  </div>
                  <p className="text-sm text-[#666]">Courses Completed</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-secondary to-gradient-start text-white font-bold text-xl flex items-center justify-center">
                    12
                  </div>
                  <p className="text-sm text-[#666]">Skills Gained</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gradient-end to-gradient-end text-white font-bold text-xl flex items-center justify-center">
                    85
                  </div>
                  <p className="text-sm text-[#666]">Days Streak</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#222] font-Montserrat">
                Achievements & Certifications
              </h2>
              <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                Add Achievement
              </button>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                      {achievement.type === "certification" && (
                        <FiAward size={20} />
                      )}
                      {achievement.type === "course" && (
                        <FiBookOpen size={20} />
                      )}
                      {achievement.type === "project" && <FiCode size={20} />}
                      {achievement.type === "skill" && <FiStar size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-[#222]">
                          {achievement.title}
                        </h3>
                        {achievement.verified && (
                          <FiCheckCircle className="text-green-600" size={16} />
                        )}
                      </div>
                      <p className="text-sm text-[#666] mb-3">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-secondary">
                          <FiCalendar size={14} />
                          {new Date(achievement.date).toLocaleDateString()}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full ${
                            achievement.type === "certification"
                              ? "bg-blue-100 text-blue-700"
                              : achievement.type === "course"
                                ? "bg-green-100 text-green-700"
                                : achievement.type === "project"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {achievement.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievement Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
              <h3 className="text-xl font-bold text-[#222] mb-6">
                Achievement Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-light-bg rounded-xl">
                  <FiAward className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-bold text-[#222] mb-1">Certifications</h4>
                  <p className="text-2xl font-bold text-primary">5</p>
                  <p className="text-xs text-[#666]">2 verified</p>
                </div>
                <div className="text-center p-4 bg-light-bg rounded-xl">
                  <FiBookOpen className="w-8 h-8 mx-auto mb-3 text-gradient-end" />
                  <h4 className="font-bold text-[#222] mb-1">Courses</h4>
                  <p className="text-2xl font-bold text-gradient-end">12</p>
                  <p className="text-xs text-[#666]">8 completed</p>
                </div>
                <div className="text-center p-4 bg-light-bg rounded-xl">
                  <FiCode className="w-8 h-8 mx-auto mb-3 text-secondary" />
                  <h4 className="font-bold text-[#222] mb-1">Projects</h4>
                  <p className="text-2xl font-bold text-secondary">8</p>
                  <p className="text-xs text-[#666]">6 public</p>
                </div>
                <div className="text-center p-4 bg-light-bg rounded-xl">
                  <FiStar className="w-8 h-8 mx-auto mb-3 text-gradient-end" />
                  <h4 className="font-bold text-[#222] mb-1">Skills</h4>
                  <p className="text-2xl font-bold text-gradient-end">15</p>
                  <p className="text-xs text-[#666]">3 expert level</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Career Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#222] font-Montserrat">
                Career Goals
              </h2>
              <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                Set New Goal
              </button>
            </div>

            {/* Active Goals */}
            <div className="space-y-4">
              {careerGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-[#222]">
                          {goal.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(goal.status)}`}
                        >
                          {goal.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#666] mb-3">
                        Target Role: {goal.targetRole}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#666] mb-4">
                        <div className="flex items-center gap-1">
                          <FiClock size={14} />
                          {goal.timeframe}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiTarget size={14} />
                          {goal.progress}% complete
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#666]">
                            Progress
                          </span>
                          <span className="text-sm font-bold text-secondary">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-[#F3EFFF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#222] mb-2">
                          Required Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {goal.requiredSkills.map((skill, index) => {
                            const userSkill = skills.find(
                              (s) => s.name === skill,
                            );
                            const isCompleted =
                              userSkill && userSkill.level >= 70;
                            return (
                              <span
                                key={index}
                                className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                                  isCompleted
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {isCompleted ? (
                                  <FiCheckCircle size={12} />
                                ) : (
                                  <FiCircle size={12} />
                                )}
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:w-48">
                      <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                        <FiArrowRight size={16} />
                        View Plan
                      </button>
                      <button className="px-4 py-2 border border-[#695AE6] rounded-lg hover:border-gradient-end transition-colors duration-300 text-purple-600">
                        Edit Goal
                      </button>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {Math.ceil(
                            ((100 - goal.progress) * parseInt(goal.timeframe)) /
                              100,
                          )}
                        </div>
                        <div className="text-xs text-[#666]">
                          months remaining
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Goal Setting Tips */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
              <h3 className="text-xl font-bold text-[#222] mb-4">
                Tips for Setting Career Goals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-light-bg rounded-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                    <FiTarget size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#222] text-sm mb-1">
                      Be Specific
                    </h4>
                    <p className="text-xs text-[#666]">
                      Define clear, measurable objectives with deadlines
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-light-bg rounded-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                    <FiTrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#222] text-sm mb-1">
                      Track Progress
                    </h4>
                    <p className="text-xs text-[#666]">
                      Regular reviews help you stay on track
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-light-bg rounded-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-gradient-start text-white">
                    <FiActivity size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#222] text-sm mb-1">
                      Skill Development
                    </h4>
                    <p className="text-xs text-[#666]">
                      Focus on acquiring relevant skills for your target role
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-light-bg rounded-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#222] text-sm mb-1">
                      Network & Mentorship
                    </h4>
                    <p className="text-xs text-[#666]">
                      Connect with professionals in your target field
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProfileLayout>
  );
}

export default function Development() {
  return (
    <Suspense fallback={
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className="min-h-screen bg-gradient-to-br from-light-bg to-[#F3EFFF] p-4 md:p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </ProfileLayout>
    }>
      <DevelopmentContent />
    </Suspense>
  );
}
