import React from 'react';
import Image from 'next/image';
import { FiPlay } from 'react-icons/fi';
import { Reel } from '../../../data/networking';
import { THEME } from '../../../styles/theme';
import Card from '../../shared/Card';

const ReelCard: React.FC<{ reel: Reel }> = ({ reel }) => {
  return (
    <div className="flex-shrink-0 w-[150px] sm:w-[177px] md:w-[204px]">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="flex flex-col h-[330px]">
          <div className="relative flex-shrink-0">
            <Image
              src={reel.thumbnail}
              alt={reel.caption}
              width={204}
              height={245}
              className="w-full h-[245px] object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                <FiPlay className={`w-4 h-4 ${THEME.components.icon.primary} ml-0.5`} />
              </div>
            </div>
          </div>
          <div className="mt-2 mb-2 flex-1 flex flex-col min-h-0 px-2">
            <div className="flex items-center gap-2 mb-1 flex-shrink-0">
              <Image
                src={reel.author.avatar}
                alt={reel.author.name}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
              <span className={`${THEME.components.typography.cardTitle} text-xs truncate`}>{reel.author.name}</span>
            </div>
            <p className={`${THEME.components.typography.body} text-xs mb-1 line-clamp-2 flex-shrink-0`}>{reel.caption}</p>
            <p className={`${THEME.components.typography.meta} text-[10px] mt-auto`}>{reel.timestamp} • {reel.views} views</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelCard;
