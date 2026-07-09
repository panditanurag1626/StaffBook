import React from 'react';
import Image from 'next/image';
import { JobCard as JobCardType } from '../../types/jobCard';
import { motion } from 'framer-motion';
import Card from '../shared/Card';

interface JobCardProps {
  job: JobCardType;
  style?: React.CSSProperties;
}

const tagColors: Record<string, string> = {
  Design: 'bg-orange-400',
  Finance: 'bg-yellow-400',
  Sales: 'bg-pink-400',
  'Full Time': 'bg-blue-200 text-blue-700',
};

const JobCard: React.FC<JobCardProps> = ({ job, style }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.7, ease: 'easeOut' }}
    style={style}
    className="z-10"
  >
    <Card 
      className="w-[85vw] min-w-[160px] max-w-[240px] sm:w-[220px] sm:max-w-[240px] flex flex-col gap-1.5"
      noPadding
    >
      <div className="px-3 py-3 sm:px-4 sm:py-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Image src={job.logo} alt={job.company} width={20} height={20} className="rounded-md sm:w-[22px] sm:h-[22px] w-[20px] h-[20px]" />
          <span className="font-semibold text-gray-800 text-[10px] sm:text-xs">{job.company}</span>
          {job.distance && <span className="ml-auto text-[9px] text-gray-400">{job.distance}</span>}
        </div>
        <div className="text-sm sm:text-base font-bold text-black mb-0.5 line-clamp-1">{job.role}</div>
        <div className="flex gap-1.5 mb-1 flex-wrap">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium text-white ${tagColors[tag] || 'bg-blue-200 text-blue-700'}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-gray-500 mt-1">
          <span className="flex items-center gap-0.5 truncate">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 1112 21z" stroke="#A0AEC0" strokeWidth="1.5"/></svg>
            {job.location}
          </span>
          <span className="flex items-center gap-0.5 truncate">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11V7a5 5 0 1110 0v4M5 11h14v6H5v-6z" stroke="#A0AEC0" strokeWidth="1.5"/></svg>
            {job.salary}
          </span>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default JobCard; 