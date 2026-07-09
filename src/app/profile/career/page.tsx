"use client";

import React, { useState } from "react";
import { 
  FiTrendingUp, 
  FiTarget, 
  FiBook,
  FiAward,
  FiUsers,
  FiCalendar,
  FiClock,
  FiStar,
  FiPlay,
  FiCheckCircle,
  FiArrowRight,
  FiBookOpen
} from "react-icons/fi";

interface SkillAssessment {
  id: string;
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  score: number;
  completedDate: string;
  badge: string;
}

interface CareerGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  modules: number;
  completedModules: number;
  category: string;
}

export default function CareerDevelopment() {
  const [activeTab, setActiveTab] = useState<'goals' | 'skills' | 'learning'>('goals');

  const skillAssessments: SkillAssessment[] = [
    {
      id: '1',
      skill: 'React Development',
      level: 'Advanced',
      score: 92,
      completedDate: '2024-01-15',
      badge: 'React Expert'
    },
    {
      id: '2',
      skill: 'JavaScript',
      level: 'Expert',
      score: 96,
      completedDate: '2024-01-10',
      badge: 'JS Master'
    },
    {
      id: '3',
      skill: 'TypeScript',
      level: 'Advanced',
      score: 88,
      completedDate: '2024-01-08',
      badge: 'TS Pro'
    }
  ];

  const careerGoals: CareerGoal[] = [
    {
      id: '1',
      title: 'Become a Senior Frontend Developer',
      description: 'Advance to senior level with leadership responsibilities',
      progress: 75,
      deadline: '2024-06-30',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Master Full-Stack Development',
      description: 'Learn backend technologies and become full-stack',
      progress: 45,
      deadline: '2024-12-31',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Lead a Development Team',
      description: 'Develop leadership skills and manage a team',
      progress: 30,
      deadline: '2025-03-31',
      priority: 'medium'
    }
  ];

  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Advanced React Patterns',
      description: 'Master advanced React concepts and design patterns',
      duration: '6 weeks',
      level: 'Advanced',
      modules: 12,
      completedModules: 8,
      category: 'Frontend'
    },
    {
      id: '2',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js',
      duration: '8 weeks',
      level: 'Intermediate',
      modules: 16,
      completedModules: 3,
      category: 'Backend'
    },
    {
      id: '3',
      title: 'System Design Fundamentals',
      description: 'Learn to design large-scale distributed systems',
      duration: '10 weeks',
      level: 'Advanced',
      modules: 20,
      completedModules: 0,
      category: 'Architecture'
    }
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-100 text-purple-600';
      case 'Advanced': return 'bg-blue-100 text-blue-600';
      case 'Intermediate': return 'bg-green-100 text-green-600';
      case 'Beginner': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 mt-[60px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-Montserrat text-primary mb-2">
            Career Development
          </h1>
          <p className="text-lg text-[#666] font-Montserrat">
            Track your progress, set goals, and advance your career
          </p>
        </div>

        {/* Career Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end text-white">
                <FiTarget size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">3</h3>
                <p className="text-sm text-[#666]">Active Goals</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiTrendingUp size={14} />
              <span className="font-bold">75% avg progress</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiAward size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">12</h3>
                <p className="text-sm text-[#666]">Skills Assessed</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <FiStar size={14} />
              <span className="font-bold">92% avg score</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-gradient-start text-white">
                <FiBook size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">5</h3>
                <p className="text-sm text-[#666]">Learning Paths</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-purple-600">
              <FiPlay size={14} />
              <span className="font-bold">3 in progress</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white">
                <FiAward size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#222]">8</h3>
                <p className="text-sm text-[#666]">Certifications</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <FiCheckCircle size={14} />
              <span className="font-bold">2 this month</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-[#E8E4FF] mb-8">
          <div className="flex gap-2">
            {[
              { key: 'goals', label: 'Career Goals', icon: <FiTarget size={18} /> },
              { key: 'skills', label: 'Skill Assessments', icon: <FiAward size={18} /> },
              { key: 'learning', label: 'Learning Paths', icon: <FiBook size={18} /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-lg'
                    : 'text-[#666] hover:text-primary hover:bg-light-bg'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">Career Goals</h2>
              <button className="px-6 py-3 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-xl transition-all duration-300">
                Add New Goal
              </button>
            </div>

            <div className="grid gap-6">
              {careerGoals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#222]">{goal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(goal.priority)}`}>
                          {goal.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#666] mb-4">{goal.description}</p>
                      <div className="flex items-center gap-4 text-sm text-[#666]">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          Deadline: {goal.deadline}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiTarget size={14} />
                          {goal.progress}% Complete
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">{goal.progress}%</div>
                        <div className="w-24 h-2 bg-[#F3EFFF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 border border-[#E8E4FF] rounded-lg hover:border-gradient-end transition-colors duration-300">
                        View Details
                        <FiArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">Skill Assessments</h2>
              <button className="px-6 py-3 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-xl transition-all duration-300">
                Take Assessment
              </button>
            </div>

            <div className="grid gap-6">
              {skillAssessments.map((assessment) => (
                <div key={assessment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end text-white font-bold text-lg flex items-center justify-center">
                        <FiAward size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#222] mb-1">{assessment.skill}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSkillLevelColor(assessment.level)}`}>
                            {assessment.level}
                          </span>
                          <span className="px-3 py-1 bg-[#F3EFFF] text-secondary text-sm font-bold rounded-full">
                            {assessment.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#666]">
                          <div className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            Completed: {assessment.completedDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiStar size={14} />
                            Score: {assessment.score}/100
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary mb-1">{assessment.score}</div>
                        <div className="text-sm text-[#666]">Score</div>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                        Retake Test
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <h2 className="text-2xl font-bold text-[#222] font-Montserrat">Learning Paths</h2>
              <button className="px-6 py-3 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-xl transition-all duration-300">
                Browse Courses
              </button>
            </div>

            <div className="grid gap-6">
              {learningPaths.map((path) => (
                <div key={path.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4FF] hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gradient-end to-gradient-end text-white font-bold text-lg flex items-center justify-center">
                        <FiBookOpen size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#222] mb-1">{path.title}</h3>
                        <p className="text-[#666] mb-3">{path.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-[#666] mb-3">
                          <div className="flex items-center gap-1">
                            <FiClock size={14} />
                            {path.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiBook size={14} />
                            {path.modules} modules
                          </div>
                          <span className="px-2 py-1 bg-[#F3EFFF] text-secondary text-xs font-medium rounded-lg">
                            {path.category}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg">
                            {path.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#F3EFFF] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                              style={{ width: `${(path.completedModules / path.modules) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-secondary">
                            {path.completedModules}/{path.modules}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-[#4A4AD6] hover:to-[#A13BD3] text-white font-bold rounded-lg transition-all duration-300">
                        <FiPlay size={16} />
                        {path.completedModules > 0 ? 'Continue' : 'Start'}
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-[#E8E4FF] rounded-lg hover:border-gradient-end transition-colors duration-300">
                        View Details
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
  );
}