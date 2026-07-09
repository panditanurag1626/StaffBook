import React from 'react';
import { FiBarChart, FiActivity } from 'react-icons/fi';
import { THEME } from '../../../styles/theme';

const ProfileViewsChart: React.FC = () => {
  return (
    <div className={`${THEME.components.card.default} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={THEME.components.typography.cardTitle}>
          Profile Views Trend
        </h3>
        <div className="flex items-center gap-2">
          <FiBarChart className={THEME.components.icon.primary} size={20} />
          <span className={THEME.components.typography.meta}>Last 30 days</span>
        </div>
      </div>
      <div className="h-64 bg-gradient-to-t from-light-bg to-transparent rounded-xl flex items-end justify-center">
        <div className="text-gray-500 text-center">
          <FiActivity
            size={48}
            className={`mx-auto mb-2 ${THEME.components.icon.primary}`}
          />
          <p className={THEME.components.typography.body}>Chart visualization would go here</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewsChart;
