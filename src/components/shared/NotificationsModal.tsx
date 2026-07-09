'use client';
import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { THEME } from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { markNotificationAsRead } from '@/lib/firebaseNotifications';

interface Notification {
  id: string;
  type: 'news' | 'comment' | 'recommendation' | 'like';
  icon: string;
  title: string;
  subtitle?: string;
  timeAgo: string;
  avatar?: string;
  username?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, buttonRef }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !user.id) return;
    const notifRef = ref(db, `users/${user.id}/notifications`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotifications(parsed);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = (id: string, read: boolean) => {
    if (user && !read) {
      markNotificationAsRead(user.id, id);
    }
    onClose();
  };

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">

      {/* Modal positioned below button */}
      <div
        ref={modalRef}
        className="absolute md:top-[75px] md:right-6 bg-white rounded-xl shadow-xl w-full max-w-sm md:mx-4 max-h-[80vh] flex flex-col border border-gray-200 pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10 shrink-0">
          <h2 className={`${THEME.components.typography.sectionTitle} text-lg`}>Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Section Header */}
          <div className="px-4 py-3 bg-gray-50/50">
            <h3 className={`${THEME.components.typography.caption} font-semibold uppercase tracking-wider`}>Earlier</h3>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications yet.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => {
                const linkHref = "/profile/notifications";

                return (
                  <Link
                    href={linkHref}
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.read)}
                    className={`flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group ${!notification.read ? 'bg-indigo-50/50' : ''}`}
                  >
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                        <Image
                          src={notification.senderAvatar || '/images/user_profile_placeholder.jpeg'}
                          alt={notification.senderName || 'User'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`${THEME.components.typography.body} text-gray-900 font-medium leading-snug group-hover:text-indigo-300 transition-colors`}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : 'Just now'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;