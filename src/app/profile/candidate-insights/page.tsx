"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProfileLayout from '../../../components/shared/ProfileLayout';
import ProfileSubMenu from '@/components/shared/ProfileSubMenu';
import { THEME } from '@/styles/theme';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
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

interface CandidateInsight {
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

function CandidateInsightsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "insights" | "market" | "companies" | "salary" | "skills"
  >(searchParams.get("tab") as any || "insights");

  // Update activeTab when URL changes
  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const insights: CandidateInsight[] = [
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

  const candidateInsightsMenuItems = [
    { icon: <FiBarChart size={18} />, label: 'Key Insights', key: 'insights' },
    { icon: <FiPieChart size={18} />, label: 'Market Trends', key: 'market' },
    { icon: <FiBriefcase size={18} />, label: 'Companies', key: 'companies' },
    { icon: <FiDollarSign size={18} />, label: 'Salary Insights', key: 'salary' },
    { icon: <FiTarget size={18} />, label: 'Skill Demand', key: 'skills' },
  ];

  return (
    <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
      <div className="px-6">
        <ProfileSubMenu
          menuItems={candidateInsightsMenuItems}
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
                  <FiBriefcase className="mr-2" size={16} />
                  Insights
                </span>
              </li>
            </ol>
          </nav>
        </div> */}

        {/* Header */}
        <div className="mb-8 mt-[4rem]">
          <h1 className={`text-3xl md:text-2xl font-bold ${THEME.colors.text.heading}`}>
            Candidate Insights
          </h1>
          <p className={`text-lg ${THEME.components.typography.body}`}>
            Get data-driven insights about job market trends and opportunities
          </p>
        </div>

        {/* Insights Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-[6px] mb-[3px]">
          <Card className="hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                <FiTarget size={20} />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>92%</h3>
                <p className={`${THEME.components.typography.body}`}>Profile Match</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiTrendingUp size={14} />
              <span className="font-bold">+5% this week</span>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                <FiBriefcase size={20} />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>247</h3>
                <p className={`${THEME.components.typography.body}`}>Matching Jobs</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <FiStar size={14} />
              <span className="font-bold">41 new today</span>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                <FiUsers size={20} />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>156</h3>
                <p className={`${THEME.components.typography.body}`}>Candidate Views</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-purple-600">
              <FiEye size={14} />
              <span className="font-bold">23 this week</span>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card className="p-2 mb-8 mt-[1rem]" noPadding>
          <div className="flex gap-2 p-2">
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
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                variant={activeTab === tab.key ? 'primary' : 'ghost'}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'shadow-lg'
                    : `text-gray-600 hover:text-[${THEME.colors.primary}] hover:bg-purple-50`
                }`}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Content based on active tab */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>
                Personalized Insights
              </h2>
              <p className={`${THEME.components.typography.body}`}>Updated daily based on market data</p>
            </div>

            <div className="grid gap-6">
              {insights.map((insight) => (
                <Card
                  key={insight.id}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className={`text-xl font-bold ${THEME.colors.text.heading}`}>
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
                      <p className={`${THEME.components.typography.body} mb-3`}>{insight.description}</p>
                      <div className={`flex items-center gap-1 text-sm text-[${THEME.colors.primary}]`}>
                        <FiClock size={14} />
                        {insight.date}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button className="px-4 py-2 shadow-md">
                        Take Action
                      </Button>
                      <Button variant="outline" className={`px-4 py-2 text-[${THEME.colors.primary}] border border-[${THEME.colors.primary}] rounded-lg hover:bg-purple-50 transition-colors duration-300`}>
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>
                Market Trends
              </h2>
              <p className={`${THEME.components.typography.body}`}>Skills demand and salary insights</p>
            </div>

            <Card>
              <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-6`}>
                Top Skills in Demand
              </h3>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white text-sm font-bold flex items-center justify-center`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className={`font-bold ${THEME.colors.text.heading}`}>{trend.skill}</h4>
                        <p className={`${THEME.components.typography.body}`}>
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
                        <div className={`w-24 h-2 bg-[${THEME.colors.primaryLight}] rounded-full overflow-hidden`}>
                          <div
                            className={`h-full bg-gradient-to-r from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] rounded-full transition-all duration-500`}
                            style={{ width: `${trend.demand}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold text-[${THEME.colors.primary}]`}>
                          {trend.demand}%
                        </div>
                        <div className={`${THEME.components.typography.caption}`}>Demand</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Salary Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                    <FiDollarSign size={20} />
                  </div>
                  <h3 className={`text-lg font-bold ${THEME.colors.text.heading}`}>
                    Salary Trends
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${THEME.components.typography.body}`}>Entry Level (0-2 years)</span>
                    <span className={`font-bold ${THEME.colors.text.heading}`}>₹6-12 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${THEME.components.typography.body}`}>Mid Level (3-5 years)</span>
                    <span className={`font-bold ${THEME.colors.text.heading}`}>₹12-20 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${THEME.components.typography.body}`}>Senior Level (6+ years)</span>
                    <span className={`font-bold ${THEME.colors.text.heading}`}>₹20-35 LPA</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white`}>
                    <FiMapPin size={20} />
                  </div>
                  <h3 className={`text-lg font-bold ${THEME.colors.text.heading}`}>
                    Location Insights
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${THEME.components.typography.body}`}>Bangalore</span>
                    <span className={`font-bold ${THEME.colors.text.heading}`}>₹15-25 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${THEME.components.typography.body}`}>Mumbai</span>
                    <span className={`font-bold ${THEME.colors.text.heading}`}>₹14-24 LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${THEME.components.typography.body}`}>Delhi NCR</span>
                    <span className={`font-bold ${THEME.colors.text.heading}`}>₹13-23 LPA</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "companies" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${THEME.colors.text.heading}`}>
                Company Insights
              </h2>
              <p className={`${THEME.components.typography.body}`}>
                Companies actively hiring for your skills
              </p>
            </div>

            <div className="grid gap-6">
              {companyInsights.map((company, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] text-white font-bold text-lg flex items-center justify-center`}>
                        {company.company.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${THEME.colors.text.heading} mb-2`}>
                          {company.company}
                        </h3>
                        <div className={`flex flex-wrap gap-4 ${THEME.components.typography.body} mb-3`}>
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
                          <span className={`${THEME.components.typography.body}`}>
                            Profile Match:
                          </span>
                          <div className={`flex-1 h-2 bg-[${THEME.colors.primaryLight}] rounded-full overflow-hidden max-w-24`}>
                            <div
                              className={`h-full bg-gradient-to-r from-[${THEME.colors.gradient.start}] to-[${THEME.colors.gradient.end}] rounded-full transition-all duration-500`}
                              style={{ width: `${company.matchScore}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold text-[${THEME.colors.primary}]`}>
                            {company.matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button className="px-4 py-2 shadow-md">
                        View Jobs
                      </Button>
                      <Button variant="outline" className={`px-4 py-2 text-[${THEME.colors.primary}] border border-[${THEME.colors.primary}] rounded-lg hover:bg-purple-50 transition-colors duration-300`}>
                        Company Info
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </ProfileLayout>
  );
}

export default function CandidateInsights() {
  return (
    <Suspense fallback={
      <ProfileLayout showSidebar={true} showStories={false} showJobSearchBar={false}>
        <div className={`min-h-screen p-4 md:p-6 flex items-center justify-center`}>
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${THEME.colors.primary}]`}></div>
          <span className={`ml-3 ${THEME.colors.text.body}`}>Loading...</span>
        </div>
      </ProfileLayout>
    }>
      <CandidateInsightsContent />
    </Suspense>
  );
}
