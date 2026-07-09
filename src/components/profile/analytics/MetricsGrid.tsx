import React from 'react';
import { FiTrendingUp, FiEye, FiSearch, FiUsers } from 'react-icons/fi';
import { THEME } from '../../../styles/theme';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

const metrics: MetricCardProps[] = [
  {
    title: "Profile Views",
    value: "1,247",
    change: "+23%",
    trend: "up",
    icon: <FiEye size={24} />,
    color: "from-gradient-start to-gradient-end",
  },
  {
    title: "Search Appearances",
    value: "892",
    change: "+18%",
    trend: "up",
    icon: <FiSearch size={24} />,
    color: "from-gradient-end to-gradient-start",
  },
  {
    title: "Connection Requests",
    value: "156",
    change: "+31%",
    trend: "up",
    icon: <FiUsers size={24} />,
    color: "from-gradient-end to-gradient-start",
  },
];

const MetricsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`${THEME.components.card.default} hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} text-white shadow-sm`}
            >
              {metric.icon}
            </div>
            <div
              className={`text-sm font-bold ${
                metric.trend === "up" ? "text-green-600" : "text-red-600"
              } flex items-center gap-1`}
            >
              <FiTrendingUp size={16} />
              {metric.change}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {metric.value}
          </h3>
          <p className={THEME.components.typography.meta}>{metric.title}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
