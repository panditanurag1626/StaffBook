import React from 'react';
import { THEME } from '../../../styles/theme';
import Card from '../../shared/Card';

const ActionableInsights: React.FC = () => {
  const insights = [
    {
      metric: "Profile Completeness",
      your: 85,
      average: 67,
      status: "above",
    },
    {
      metric: "Weekly Views",
      your: 156,
      average: 89,
      status: "above",
    },
    {
      metric: "Connection Rate",
      your: 23,
      average: 31,
      status: "below",
    },
  ];

  return (
    <Card className="mb-8" hoverEffect>
      <div className="flex items-center justify-between mb-6">
        <h3 className={THEME.components.typography.cardTitle}>
          Actionable Insights
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((item, index) => (
          <div key={index} className="text-center">
            <h4 className="font-medium text-gray-900 mb-3">
              {item.metric}
            </h4>
            <div className="relative w-24 h-24 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-[#F3EFFF]"></div>
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                  item.status === "above"
                    ? "from-green-400 to-green-600"
                    : "from-orange-400 to-orange-600"
                }`}
                style={{
                  background: `conic-gradient(${
                    item.status === "above" ? "#10B981" : "#F59E0B"
                  } ${(item.your / 100) * 360}deg, #F3EFFF 0deg)`,
                }}
              ></div>
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {item.your}
                  {item.metric.includes("Rate") ? "%" : ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActionableInsights;
