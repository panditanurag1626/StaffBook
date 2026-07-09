"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProfileLayout from '../../../components/shared/ProfileLayout';
import {
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiClock,
  FiStar,
  FiEye,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiAward,
  FiChevronRight,
} from "react-icons/fi";

interface RecruiterInsight {
  id: string;
  title: string;
  description: string;
  category: "market" | "salary" | "skills" | "trends";
  priority: "high" | "medium" | "low";
  date: string;
}

interface MarketTrend {
  skill: string;
  demand: number;
  growth: string;
  avgSalary: string;
}

interface CompanyInsight {
  company: string;
  openings: number;
  avgSalary: string;
  hiringTrend: "up" | "down" | "stable";
  matchScore: number;
}

export default function RecruiterInsights_Old() {
  const [activeTab, setActiveTab] = useState<
    "insights" | "market" | "companies"
  >("insights");

  const insights: RecruiterInsight[] = [
    {
      id: "1",
      title: "React Developers in High Demand",
      description:
        "Companies are actively seeking React developers with 3+ years experience. Your profile matches 92% of current openings.",
      category: "market",
      priority: "high",
      date: "2024-01-15",
    },
    {
      id: "3",
      title: "TypeScript Skills Trending",
      description:
        "TypeScript is mentioned in 78% of frontend job postings. Consider highlighting this skill more prominently.",
      category: "skills",
      priority: "high",
      date: "2024-01-13",
    },
    {
      id: "4",
      title: "Remote Work Opportunities",
      description:
        "Remote positions for your skill set have increased by 45% this quarter.",
      category: "trends",
      priority: "medium",
      date: "2024-01-12",
    },
  ];

  const marketTrends: MarketTrend[] = [
    {
      skill: "React",
      demand: 95,
      growth: "+23%",
      avgSalary: "₹12-18 LPA",
    },
    {
      skill: "TypeScript",
      demand: 88,
      growth: "+31%",
      avgSalary: "₹14-20 LPA",
    },
    {
      skill: "Node.js",
      demand: 82,
      growth: "+18%",
      avgSalary: "₹15-22 LPA",
    },
    {
      skill: "Next.js",
      demand: 76,
      growth: "+42%",
      avgSalary: "₹16-24 LPA",
    },
    {
      skill: "GraphQL",
      demand: 68,
      growth: "+28%",
      avgSalary: "₹18-26 LPA",
    },
  ];

  const companyInsights: CompanyInsight[] = [
    {
      company: "Microsoft",
      openings: 12,
      avgSalary: "₹25-35 LPA",
      hiringTrend: "up",
      matchScore: 94,
    },
    {
      company: "Google",
      openings: 8,
      avgSalary: "₹30-40 LPA",
      hiringTrend: "up",
      matchScore: 91,
    },
    {
      company: "Amazon",
      openings: 15,
      avgSalary: "₹22-32 LPA",
      hiringTrend: "stable",
      matchScore: 88,
    },
    {
      company: "Flipkart",
      openings: 6,
      avgSalary: "₹18-28 LPA",
      hiringTrend: "up",
      matchScore: 85,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "market":
        return "bg-blue-100 text-blue-600";
      case "salary":
        return "bg-green-100 text-green-600";
      case "skills":
        return "bg-purple-100 text-purple-600";
      case "trends":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-yellow-100 text-yellow-600";
      case "low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <FiTrendingUp className="text-green-600" size={16} />;
      case "down":
        return <FiTrendingUp className="text-red-600 rotate-180" size={16} />;
      case "stable":
        return <FiActivity className="text-yellow-600" size={16} />;
      default:
        return null;
    }
  };

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <div className="min-h-screen bg-gradient-to-br from-light-bg to-[#F3EFFF] p-4 md:p-6 -mt-[10px]">
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
                  <FiBriefcase className="mr-2" size={16} />
                  Insights
                </span>
              </li>
            </ol>
          </nav>
        </div> */}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-2xl font-bold font-Montserrat text-primary">
            Recruiter Insights
          </h1>
          <p className="text-lg text-[#666] font-Montserrat">
            Get data-driven insights about job market trends and opportunities
          </p>
        </div>

        {/* Insights Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                <FiTarget size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">92%</h3>
                <p className="text-sm text-[#666]">Profile Match</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiTrendingUp size={14} />
              <span className="font-bold">+5% this week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiBriefcase size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">247</h3>
                <p className="text-sm text-[#666]">Matching Jobs</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <FiStar size={14} />
              <span className="font-bold">41 new today</span>
            </div>
          </div>

          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-gradient-start text-white">
                <FiDollarSign size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">₹18L</h3>
                <p className="text-sm text-[#666]">Market Average</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiTrendingUp size={14} />
              <span className="font-bold">+12% YoY</span>
            </div>
          </div> */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiUsers size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">156</h3>
                <p className="text-sm text-[#666]">Recruiter Views</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-purple-600">
              <FiEye size={14} />
              <span className="font-bold">23 this week</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-[#E8E4FF] mb-8">
          <div className="flex gap-2">
            {[
              // {
              //   key: "insights",
              //   label: "Key Insights",
              //   icon: <FiBarChart size={18} />,
              // },
              {
                key: "market",
                label: "Market Trends",
                icon: <FiPieChart size={18} />,
              },
              // {
              //   key: "companies",
              //   label: "Company Insights",
              //   icon: <FiBriefcase size={18} />,
              // },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-lg"
                    : "text-[#666] hover:text-primary hover:bg-light-bg"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">
                Personalized Insights
              </h2>
              <p className="text-[#666]">Updated daily based on market data</p>
            </div>

            <div className="grid gap-6">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-[#222]">
                          {insight.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${getCategoryColor(insight.category)}`}
                        >
                          {insight.category.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(insight.priority)}`}
                        >
                          {insight.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#666] mb-3">{insight.description}</p>
                      <div className="flex items-center gap-1 text-sm text-secondary">
                        <FiClock size={14} />
                        {insight.date}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                        Take Action
                      </button>
                      <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:border-gradient-end transition-colors duration-300">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">
                Market Trends
              </h2>
              <p className="text-[#666]">Skills demand and salary insights</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
              <h3 className="text-xl font-bold text-[#222] mb-6">
                Top Skills in Demand
              </h3>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-light-bg rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end text-white text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#222]">{trend.skill}</h4>
                        <p className="text-sm text-[#666]">
                          Avg Salary: {trend.avgSalary}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-green-600">
                            {trend.growth}
                          </span>
                          <FiTrendingUp size={14} className="text-green-600" />
                        </div>
                        <div className="w-24 h-2 bg-[#E8E4FF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                            style={{ width: `${trend.demand}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {trend.demand}%
                        </div>
                        <div className="text-xs text-[#666]">Demand</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                    <FiDollarSign size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#222]">
                    Salary Trends
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#666]">Entry Level (0-2 years)</span>
                    <span className="font-bold text-[#222]">₹6-12 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Mid Level (3-5 years)</span>
                    <span className="font-bold text-[#222]">₹12-20 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Senior Level (6+ years)</span>
                    <span className="font-bold text-[#222]">₹20-35 LPA</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                    <FiMapPin size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#222]">
                    Location Insights
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#666]">Bangalore</span>
                    <span className="font-bold text-[#222]">₹15-25 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Mumbai</span>
                    <span className="font-bold text-[#222]">₹14-24 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Delhi NCR</span>
                    <span className="font-bold text-[#222]">₹13-23 LPA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "companies" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">
                Company Insights
              </h2>
              <p className="text-[#666]">
                Companies actively hiring for your skills
              </p>
            </div>

            <div className="grid gap-6">
              {companyInsights.map((company, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end text-white font-bold text-lg flex items-center justify-center">
                        {company.company.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#222] mb-2">
                          {company.company}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-[#666] mb-3">
                          <div className="flex items-center gap-1">
                            <FiBriefcase size={14} />
                            {company.openings} open positions
                          </div>
                          <div className="flex items-center gap-1">
                            <FiDollarSign size={14} />
                            {company.avgSalary}
                          </div>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(company.hiringTrend)}
                            Hiring trend: {company.hiringTrend}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#666]">
                            Profile Match:
                          </span>
                          <div className="flex-1 h-2 bg-[#F3EFFF] rounded-full overflow-hidden max-w-24">
                            <div
                              className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                              style={{ width: `${company.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-secondary">
                            {company.matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                        View Jobs
                      </button>
                      <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:border-gradient-end transition-colors duration-300">
                        Company Info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </ProfileLayout>
  );
}
