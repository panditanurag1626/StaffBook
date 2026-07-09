import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { THEME } from '../../../styles/theme';

const SearchKeywords: React.FC = () => {
  const keywords = [
    { keyword: "React Developer", count: 234, percentage: 85 },
    { keyword: "Frontend Engineer", count: 189, percentage: 68 },
    { keyword: "JavaScript Expert", count: 156, percentage: 56 },
    { keyword: "UI/UX Developer", count: 123, percentage: 44 },
  ];

  return (
    <div className={`${THEME.components.card.default} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={THEME.components.typography.cardTitle}>
          Top Search Keywords
        </h3>
        <FiSearch className={THEME.components.icon.primary} size={20} />
      </div>
      <div className="space-y-4">
        {keywords.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{item.keyword}</p>
              <p className={THEME.components.typography.meta}>
                {item.count} searches
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-2 bg-[#F3EFFF] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className={`text-sm font-medium text-indigo-300`}>
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchKeywords;
