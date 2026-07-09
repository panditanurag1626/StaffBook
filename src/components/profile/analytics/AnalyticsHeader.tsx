import React from 'react';
import { THEME } from '../../../styles/theme';

const AnalyticsHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className={THEME.components.typography.sectionTitle} style={{ fontSize: '24px' }}>
        Profile Analytics
      </h1>
      <p className={THEME.components.typography.body}>
        Track your profile performance and get insights to improve visibility
      </p>
    </div>
  );
};

export default AnalyticsHeader;
