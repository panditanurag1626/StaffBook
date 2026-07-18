import React from 'react';
import { THEME } from '../../styles/theme';
import Card from '../shared/Card';
import { FiBarChart2, FiDownload, FiTrendingUp, FiActivity, FiEye } from 'react-icons/fi';

interface ResumeVersion {
  id: string;
  name: string;
  lastModified: string;
  views: number;
  downloads: number;
  isDefault: boolean;
  template: string;
  size: string;
}

interface ResumeAnalyticsProps {
  resumeVersions: ResumeVersion[];
}

const ResumeAnalytics: React.FC<ResumeAnalyticsProps> = ({ resumeVersions }) => {
  const totalViews = resumeVersions.reduce((acc, curr) => acc + curr.views, 0);
  const totalDownloads = resumeVersions.reduce((acc, curr) => acc + curr.downloads, 0);

  return (
    <div className={`space-y-6 ${THEME.layout.spacing.xl}`}>
      <div className="flex items-center justify-between">
        <h2 className={THEME.components.typography.sectionTitle}>
          Resume Analytics
        </h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <div className={`p-1.5 bg-purple-50 ${THEME.components.icon.primary} rounded-lg`}>
              <FiEye size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Views</p>
              <p className="text-sm font-bold text-gray-900">{totalViews}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <FiDownload size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Downloads</p>
              <p className="text-sm font-bold text-gray-900">{totalDownloads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${THEME.layout.spacing.xl}`}>
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <div className={`p-2 bg-purple-50 ${THEME.components.icon.primary} rounded-lg`}>
                <FiTrendingUp size={20} />
              </div>
              <h3 className={THEME.components.typography.cardTitle}>
                View Trends
              </h3>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              {resumeVersions.map((resume) => (
                <div key={resume.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`${THEME.components.typography.body} font-medium`}>
                      {resume.name}
                    </span>
                    <span className={`text-sm font-bold text-purple-600`}>
                      {resume.views} views
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F3EFFF] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${(resume.views / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FiActivity size={20} />
              </div>
              <h3 className={THEME.components.typography.cardTitle}>
                Download Performance
              </h3>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              {resumeVersions.map((resume) => (
                <div key={resume.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`${THEME.components.typography.body} font-medium`}>
                      {resume.name}
                    </span>
                    <span className={`text-sm font-bold text-purple-600`}>
                      {resume.downloads} downloads
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-purple-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: `${(resume.downloads / 50) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Optimization Tips */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <FiBarChart2 size={20} />
            </div>
            <h3 className={THEME.components.typography.cardTitle}>
              Optimization Tips
            </h3>
          </div>
        </Card.Header>
        <Card.Content>
          <div className={`grid grid-cols-1 md:grid-cols-3 ${THEME.layout.spacing.lg}`}>
            <div className="p-5 bg-light-bg rounded-xl border border-purple-100 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center ${THEME.components.icon.primary} mb-3 shadow-sm`}>
                <span className="font-bold">1</span>
              </div>
              <h4 className={`${THEME.components.typography.cardTitle} mb-2`}>Add Keywords</h4>
              <p className={THEME.components.typography.body}>
                Include industry-specific keywords to improve visibility and ATS ranking.
              </p>
            </div>
            <div className="p-5 bg-light-bg rounded-xl border border-purple-100 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center ${THEME.components.icon.primary} mb-3 shadow-sm`}>
                <span className="font-bold">2</span>
              </div>
              <h4 className={`${THEME.components.typography.cardTitle} mb-2`}>
                Quantify Achievements
              </h4>
              <p className={THEME.components.typography.body}>
                Use numbers and metrics to showcase your impact (e.g., "Increased sales by 20%").
              </p>
            </div>
            <div className="p-5 bg-light-bg rounded-xl border border-purple-100 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center ${THEME.components.icon.primary} mb-3 shadow-sm`}>
                <span className="font-bold">3</span>
              </div>
              <h4 className={`${THEME.components.typography.cardTitle} mb-2`}>
                Keep it Concise
              </h4>
              <p className={THEME.components.typography.body}>
                Limit your resume to 1-2 pages and focus on relevant experience.
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ResumeAnalytics;
