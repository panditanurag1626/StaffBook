import React from 'react';
import { categories } from '../../data/categories';
import { SITE_CONFIG } from '../../constants/siteconfig';
import CategoryCard from '../shared/CategoryCard';
import SeeAllButton from '../shared/SeeAllButton';
import { Megaphone, Users, Code, Monitor, BarChart, BookOpen, Briefcase, Headphones } from 'lucide-react';
const iconMap: Record<string, React.ElementType> = {
  Megaphone: Megaphone,
  Users: Users,
  Code: Code,
  Monitor: Monitor,
  BarChart: BarChart,
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  Headphones: Headphones,
};

const PopularRolesSection: React.FC = () => {
  // Split categories into two rows of 4
  const firstRow = categories.slice(0, 4);
  const secondRow = categories.slice(4, 8);

  return (
    <section className="w-full bg-transparent py-8 md:py-12">
      <div className="w-full max-w-[95%] px-2 md:px-6 mx-auto">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl max-w-[70%] font-bold text-gray-900">Jobs in most popular roles</h2>
          <SeeAllButton>See All</SeeAllButton>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {firstRow.map((cat) => {
              const Icon = cat.icon;
              return (
                <CategoryCard
                  key={cat.title}
                  icon={Icon}
                  title={cat.title}
                  jobs={cat.jobs}
                />
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {secondRow.map((cat) => {
              const Icon = cat.icon;
              return (
                <CategoryCard
                  key={cat.title}
                  icon={Icon}
                  title={cat.title}
                  jobs={cat.jobs}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularRolesSection; 