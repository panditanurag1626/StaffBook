"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiBell,
  FiMail,
  FiUsers,
  FiBriefcase,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiUserPlus,
  FiTrendingUp,
  FiSettings,
  FiCheck,
  FiX,
  FiMoreHorizontal,
  FiClock,
  FiFilter,
  FiSearch,
  FiChevronRight,
} from "react-icons/fi";
import Card from "@/components/shared/Card";
import Button from "@/components/shared/Button";
import { THEME } from "@/styles/theme";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { markNotificationAsRead } from "@/lib/firebaseNotifications";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Notification {
  id: string;
  type: string;
  originalType: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  isImportant: boolean;
  actionRequired?: boolean;
  avatar?: string;
  senderId?: string | number;
  senderName?: string;
  company?: string;
  metadata?: any;
  createdAt?: number;
}

export default function Notifications() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "important" | "job" | "network">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  React.useEffect(() => {
    if (!user || !user.id) return;
    const notifRef = ref(db, `users/${user.id}/notifications`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(key => {
          const item = data[key];

          let mapType = "system";
          let mapTitle = "Notification";

          switch (item.type) {
            case "job_application": mapType = "job"; mapTitle = "New Job Application"; break;
            case "connection_request": mapType = "network"; mapTitle = "Connection Request"; break;
            case "connection_accepted": mapType = "network"; mapTitle = "Connection Accepted"; break;
            case "story": mapType = "network"; mapTitle = "New Story"; break;
            case "reel": mapType = "network"; mapTitle = "New Reel"; break;
            case "post": mapType = "network"; mapTitle = "New Post"; break;
            case "comment": mapType = "network"; mapTitle = "New Comment"; break;
            case "like": mapType = "network"; mapTitle = "Post Liked"; break;
            case "repost": mapType = "network"; mapTitle = "Post Reposted"; break;
            case "profile_view": mapType = "network"; mapTitle = "Profile View"; break;
            case "resume_download": mapType = "job"; mapTitle = "Resume Downloaded"; break;
            case "job_invite": mapType = "job"; mapTitle = "Job Invite"; break;
            case "contact_view": mapType = "network"; mapTitle = "Contact View"; break;
            case "message": mapType = "message"; mapTitle = "New Message"; break;
            case "meeting":
            case "meeting_scheduled": mapType = "network"; mapTitle = "Meeting Scheduled"; break;
            case "meeting_invite": mapType = "network"; mapTitle = "Meeting Invite"; break;
            case "meeting_upcoming": mapType = "network"; mapTitle = "Upcoming Meeting"; break;
            case "meeting_reminder": mapType = "network"; mapTitle = "Meeting Reminder"; break;
            case "job_match": mapType = "job"; mapTitle = "Matching Job Posted"; break;
            case "email_view": mapType = "network"; mapTitle = "Email View"; break;
          }

          const isImportant = [
            "job_application",
            "job_invite",
            "resume_download",
            "contact_view",
            "meeting",
            "meeting_scheduled",
            "meeting_invite",
            "meeting_upcoming",
            "meeting_reminder"
          ].includes(item.type);

          const createdAt = item.createdAt || 0;
          const isToday = (ts: number) => {
            if (!ts) return false;
            const date = new Date(ts);
            const today = new Date();
            return date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
          };

          const timeStr = createdAt ? new Date(createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : 'Just now';
          const displayTime = isToday(createdAt) ? `Today, ${timeStr}` : (createdAt ? new Date(createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : 'Just now');

          return {
            id: key,
            type: mapType,
            originalType: item.type,
            title: mapTitle,
            description: item.message,
            time: displayTime,
            isRead: item.read || false,
            isImportant: isImportant,
            avatar: item.senderAvatar,
            senderId: item.senderId || item.fromId || item.metadata?.senderId || item.metadata?.applicantId,
            senderName: item.senderName || item.fromName || item.metadata?.senderName || item.metadata?.applicantName || 'User',
            metadata: item.metadata,
            createdAt: createdAt
          };
        }).sort((a: any, b: any) => b.createdAt - a.createdAt);
        setNotifications(parsed);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job":
        return <FiBriefcase size={20} className="text-blue-600" />;
      case "network":
        return <FiUsers size={20} className="text-green-600" />;
      case "message":
        return <FiMail size={20} className="text-purple-600" />;
      case "achievement":
        return <FiStar size={20} className="text-yellow-600" />;
      case "system":
        return <FiBell size={20} className="text-gray-600" />;
      default:
        return <FiBell size={20} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "job":
        return "bg-blue-100 text-blue-600";
      case "network":
        return "bg-green-100 text-green-600";
      case "message":
        return "bg-purple-100 text-purple-600";
      case "achievement":
        return "bg-yellow-100 text-yellow-600";
      case "system":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const markAsRead = (id: string) => {
    if (!user) return;
    markNotificationAsRead(user.id, id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const updates: any = {};
    notifications.forEach(n => {
      updates[`${n.id}/read`] = true;
    });
    try {
      const notifRef = ref(db, `users/${user.id}/notifications`);
      // Update entire read status for all items individually
      await Promise.all(notifications.map(n => markNotificationAsRead(user.id, n.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    try {
      const notifRef = ref(db, `users/${user.id}/notifications/${id}`);
      await set(notifRef, null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unread" && !notif.isRead) ||
      (activeFilter === "important" && notif.isImportant) ||
      (activeFilter === "job" && notif.type === "job") ||
      (activeFilter === "network" && notif.type === "network");

    const matchesSearch =
      searchQuery === "" ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const importantCount = notifications.filter(
    (n) => n.isImportant && !n.isRead,
  ).length;

  return (
    <div className={`min-h-screen ${THEME.colors.background.page} p-2 md:p-4 lg:p-8 mt-[50px]`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 mt-8 md:mt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
            <div>
              <h1 className={`${THEME.components.typography.sectionTitle} text-xl md:text-3xl lg:text-4xl text-primary mb-1 md:mb-2`}>
                Notifications
              </h1>
              <p className={`${THEME.components.typography.body} text-sm md:text-lg`}>
                Stay updated with your professional activities
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-lg text-xs md:text-sm"
              >
                Mark All Read
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="p-3 md:p-4" noPadding>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <FiBell size={14} className="text-primary" />
              <span className={THEME.components.typography.caption}>Total</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-gray-900">
              {notifications.length}
            </div>
          </Card>

          <Card className="p-3 md:p-4" noPadding>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500"></div>
              <span className={THEME.components.typography.caption}>Unread</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-red-600">{unreadCount}</div>
          </Card>

          <Card className="p-3 md:p-4" noPadding>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <FiStar size={14} className="text-yellow-500" />
              <span className={THEME.components.typography.caption}>Important</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-yellow-600">
              {importantCount}
            </div>
          </Card>

          <Card className="p-3 md:p-4" noPadding>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <FiClock size={14} className="text-green-500" />
              <span className={THEME.components.typography.caption}>Today</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-green-600">
              {
                notifications.filter(
                  (n) => {
                    if (!n.createdAt) return false;
                    const d = new Date(n.createdAt);
                    const now = new Date();
                    return d.getDate() === now.getDate() &&
                      d.getMonth() === now.getMonth() &&
                      d.getFullYear() === now.getFullYear();
                  }
                ).length
              }
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-3 md:p-6 mb-4 md:mb-6" noPadding>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${THEME.components.input.search} pl-10`}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { key: "all", label: "All", icon: <FiBell size={16} /> },
                {
                  key: "unread",
                  label: "Unread",
                  icon: <div className="w-2 h-2 rounded-full bg-red-500"></div>,
                },
                {
                  key: "important",
                  label: "Important",
                  icon: <FiStar size={16} />,
                },
                { key: "job", label: "Jobs", icon: <FiBriefcase size={16} /> },
                {
                  key: "network",
                  label: "Network",
                  icon: <FiUsers size={16} />,
                },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  variant={activeFilter === filter.key ? 'primary' : 'ghost'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeFilter === filter.key
                    ? ''
                    : "bg-gray-50 text-gray-600 hover:text-primary hover:bg-gray-100"
                    }`}
                >
                  {filter.icon}
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-6 md:p-12 text-center" noPadding>
              <FiBell size={32} className="mx-auto text-gray-300 mb-3 md:mb-4" />
              <h3 className={`${THEME.components.typography.sectionTitle} text-base md:text-xl mb-1 md:mb-2`}>
                No notifications found
              </h3>
              <p className={THEME.components.typography.body}>
                Try adjusting your filters or search query
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 md:p-4 transition-all duration-300 hover:shadow-lg cursor-pointer ${notification.isRead
                  ? "bg-white"
                  : "bg-gradient-to-r from-white to-primary/5 border-l-4 border-l-primary"
                  }`}
                noPadding
                onClick={() => {
                  if (!notification.isRead) markAsRead(notification.id);
                  if (['meeting', 'meeting_scheduled', 'meeting_invite', 'meeting_upcoming', 'meeting_reminder'].includes(notification.originalType)) {
                    window.dispatchEvent(new CustomEvent('openMeetingModal', { detail: { candidateName: notification.senderName, candidateId: notification.senderId } }));
                  } else if (notification.type === 'job' && notification.metadata?.jobPostId) {
                    router.push(`/profile/jobs/${notification.metadata.jobPostId}`);
                  } else if (notification.senderId) {
                    router.push(`/user/${notification.senderId}`);
                  }
                }}
              >
                <div className="flex gap-3 md:gap-4">
                  {/* Icon/Avatar */}
                  <div className="flex-shrink-0">
                    <Link
                      href={notification.senderId ? `/user/${notification.senderId}` : '#'}
                      onClick={(e) => { e.stopPropagation(); if (!notification.senderId) e.preventDefault(); }}
                      className={`block w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gray-100 transition-all duration-300 ${notification.senderId ? 'hover:opacity-80 hover:ring-2 hover:ring-primary/20' : 'cursor-default'}`}
                    >
                      {notification.avatar ? (
                        <Image
                          src={notification.avatar}
                          alt="Avatar"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${THEME.colors.gradient.sky} flex items-center justify-center text-white font-bold text-sm md:text-lg`}>
                          {notification.senderName ? notification.senderName.charAt(0).toUpperCase() : getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 md:gap-4 mb-1.5 md:mb-2">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                          <h3
                            className={`text-sm md:text-base font-bold ${notification.isRead ? "text-gray-600" : "text-gray-900"}`}
                          >
                            {notification.title}
                          </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${['meeting', 'meeting_scheduled', 'meeting_invite', 'meeting_upcoming', 'meeting_reminder', 'job_invite'].includes(notification.originalType) ? 'bg-yellow-100 text-yellow-600' : getTypeColor(notification.type)}`}
                        >
                          {['meeting', 'meeting_scheduled', 'meeting_invite', 'meeting_upcoming', 'meeting_reminder', 'job_invite'].includes(notification.originalType) ? 'IMPORTANT' : notification.type.toUpperCase()}
                        </span>
                        {notification.isImportant && (
                          <FiStar
                            size={14}
                            className="text-yellow-500 fill-current"
                          />
                        )}
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 whitespace-nowrap">
                          {notification.time}
                        </span>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded transition-colors duration-300 w-auto h-auto"
                              title="Mark as read"
                            >
                              <FiCheck size={16} className="text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-red-50 rounded transition-colors duration-300 w-auto h-auto"
                            title="Delete"
                          >
                            <FiX size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <p
                      className={`text-xs md:text-sm mb-2 md:mb-3 ${notification.isRead ? "text-gray-600" : "text-gray-600"}`}
                    >
                      {notification.description}
                    </p>

                    {notification.company && (
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-gradient-to-br from-primary to-secondary text-white text-[10px] md:text-xs font-bold flex items-center justify-center">
                          {notification.company.substring(0, 1)}
                        </div>
                        <span className="text-xs md:text-sm text-primary font-medium">
                          {notification.company}
                        </span>
                      </div>
                    )}

                    {/* Metadata Detail Preview */}
                    {notification.metadata && (
                      (notification.type === 'job' && (notification.metadata.jobTitle || notification.metadata.applicantName)) ||
                      (notification.type === 'network' && notification.metadata.senderName) ||
                      (['meeting', 'meeting_scheduled', 'meeting_invite', 'meeting_upcoming', 'meeting_reminder'].includes(notification.originalType) && notification.metadata.notes)
                    ) && (
                      <div className="mt-2 md:mt-3 bg-gray-50 rounded-lg md:rounded-xl p-2.5 md:p-4 border border-gray-100 flex flex-col gap-1.5 md:gap-2">
                        {notification.type === 'job' && notification.metadata.jobTitle && (
                          <div className="text-xs md:text-sm">
                            <span className="font-semibold text-gray-700">Applied Job:</span>{" "}
                            <span className="text-gray-900">{notification.metadata.jobTitle}</span>
                            {notification.metadata.jobLocation && (
                              <span className="text-gray-500 ml-1">({notification.metadata.jobLocation})</span>
                            )}
                          </div>
                        )}
                        {notification.type === 'job' && notification.metadata.applicantName && (
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Applicant:</span>{" "}
                            <span className="text-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); router.push(`/profile/find-candidates/${notification.metadata.applicantId}`); }}>
                              {notification.metadata.applicantName}
                            </span>
                          </div>
                        )}
                        {notification.type === 'network' && notification.metadata.senderName && (
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">From:</span>{" "}
                            <span className="text-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); router.push(`/profile/find-candidates/${notification.metadata.senderId}`); }}>
                              {notification.metadata.senderName}
                            </span>
                            {notification.metadata.senderTitle && (
                              <span className="text-gray-500 ml-1">- {notification.metadata.senderTitle}</span>
                            )}
                          </div>
                        )}
                        {['meeting', 'meeting_scheduled', 'meeting_invite', 'meeting_upcoming', 'meeting_reminder'].includes(notification.originalType) && (
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Meeting Notes:</span>{" "}
                            <span className="text-gray-900">{notification.metadata.notes || 'No notes'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {notification.actionRequired && (
                      <div className="flex gap-2 md:gap-3 mt-2 md:mt-4">
                        <Button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm">
                          {notification.type === "network"
                            ? "Accept"
                            : "View Details"}
                        </Button>
                        {notification.type === "network" && (
                          <Button variant="outline" className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-200 rounded-lg hover:border-primary text-xs md:text-sm text-gray-600 hover:text-primary transition-colors duration-300">
                            Decline
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {/* {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="px-6 py-3 border border-gray-200 rounded-xl hover:border-primary hover:bg-gray-50 text-gray-600 hover:text-primary transition-all duration-300">
              Load More Notifications
            </Button>
          </div>
        )} */}
      </div>
    </div>
  );
}
