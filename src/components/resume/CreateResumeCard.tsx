import React from 'react';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { THEME } from '../../styles/theme';
import Card from '../shared/Card';

interface CreateResumeCardProps {
  onClick?: () => void;
}

const CreateResumeCard: React.FC<CreateResumeCardProps> = () => {
  const content = (
    <Card
      className="h-full min-h-[160px] md:min-h-[200px] border-2 border-dashed border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-white transition-all duration-300 group flex flex-col items-center justify-center gap-4 cursor-pointer"
      noPadding
    >
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white group-hover:bg-purple-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
        <FiPlus size={24} className="md:w-8 md:h-8 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
      </div>
      <div className="text-center">
        <h3 className={`${THEME.components.typography.cardTitle} text-gray-500 group-hover:text-purple-600 transition-colors duration-300`}>
          Create New Resume
        </h3>
        <p className={`${THEME.components.typography.meta} mt-1`}>
          Start from scratch or use a template
        </p>
      </div>
    </Card>
  );

  return (
    <Link href="/profile/jobs?tab=resume&resumeTab=builder" className="block h-full">
      {content}
    </Link>
  );
};

export default CreateResumeCard;
