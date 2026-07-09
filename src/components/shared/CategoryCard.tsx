// SHARED COMPONENT: CategoryCard
// This is the reusable card for category/job role cards. Always use this for popular roles/categories. (Per code-structure rules)

import React from 'react';
import Card from './Card';

interface CategoryCardProps {
  icon: React.ElementType;
  title: string;
  jobs: string;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon: Icon, title, jobs, className = '' }) => (
  <Card
    className={`flex flex-row items-center gap-4 min-h-[72px] ${className}`}
    hoverEffect
  >
    <div className="w-12 h-12 rounded-full bg-light-bg flex items-center justify-center">
      <Icon size={28} className="text-primary" />
    </div>
    <div className="flex flex-col justify-center">
      <div className="text-base text-gray-900 leading-tight">{title}</div>
      <div className="text-sm text-gray-400 font-medium">{jobs}</div>
    </div>
  </Card>
);

export default CategoryCard; 