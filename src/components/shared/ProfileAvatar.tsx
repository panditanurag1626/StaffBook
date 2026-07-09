'use client';
import Image from 'next/image';
import React, { useState, useRef } from 'react';
import ProfileModal from './ProfileModal';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@/styles/theme';

interface ProfileAvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  showMenu?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, src, size = 36, className = '', showMenu = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
    const { isOnline, user } = useAuth();

  const handleProfileClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const userModeType = user?.user_mode_type;

  return (
    <>
      <div 
        ref={buttonRef}
        className={`flex cursor-pointer group ${showMenu ? 'flex-col items-center justify-center gap-0.5 min-w-[70px]' : 'items-center gap-2'} ${className}`} 
        onClick={handleProfileClick}
      >
        <div className='relative rounded-full overflow-visible h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center'>
          {src && src.trim() !== '' ? (
            <Image
              src={src}
              alt={name}
              width={size}
              height={size}
              className="rounded-full object-cover"
            />
          ) : (
            <div 
              style={{ width: size, height: size }}
              className={`rounded-full bg-gradient-to-br ${THEME.colors.gradient.sky} flex items-center justify-center text-white font-bold text-[10px]`}
            >
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          {/* Online Indicator */}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full z-10"></div>
          )}
          {(userModeType === 'Ready To Join' || userModeType === 'Actively Hiring') && (
            <div className="absolute inset-[-3px] z-10 pointer-events-none rotate-45">
              <Image
                src={userModeType === 'Ready To Join' ? "/ReadyToJoin.png" : "/Hiring.png"}
                alt={userModeType}
                fill
                sizes="30px"
                className="object-contain drop-shadow-sm -rotate-[15deg]"
              />
            </div>
          )}
        </div>
        {showMenu && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] font-normal text-gray-500 group-hover:text-black leading-none whitespace-nowrap">
              My Profile
            </span>
            <svg
              className="text-gray-500 group-hover:text-black"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="10px"
              width="10px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        )}
      </div>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        buttonRef={buttonRef}
      />
    </>
  );
};

export default ProfileAvatar; 