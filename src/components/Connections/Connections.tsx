'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheck, FiX, FiUserPlus, FiUserMinus, FiUsers, FiSearch, FiMessageSquare, FiCalendar, FiMapPin, FiMoreHorizontal, FiChevronDown, FiFilter, FiStar, FiSend, FiUserCheck, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { ImageIcon } from 'lucide-react';
import MessageIcon from '../icons/MessageIcon';
import ProfileSubMenu from '../shared/ProfileSubMenu';
import { THEME } from '@/styles/theme';
import Card from '../shared/Card';
import ConnectButton from '../shared/ConnectButton';
import Button from '../shared/Button';
import PlatformActionButton from '../shared/PlatformActionButton';
import {
  connectionRequests,
  myConnections,
  peopleYouMayKnow,
  sentRequests,
  ConnectionRequest,
  Connection,
  PeopleYouMayKnow,
} from '@/data/connections';
import { connectionService, userService, type Connection as APIConnection } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { sendNotificationToUser } from '@/lib/firebaseNotifications';
import toast from 'react-hot-toast';

type SortType = 'recently-added' | 'first-name' | 'last-name';

const Connections: React.FC = () => {
  // API Integration
  const [isLoadingAPI, setIsLoadingAPI] = useState(false);
  const [useAPI, setUseAPI] = useState(true);
  const [apiConnections, setApiConnections] = useState<APIConnection[]>([]);
  const [apiRequests, setApiRequests] = useState<APIConnection[]>([]);
  const [apiSent, setApiSent] = useState<APIConnection[]>([]);
  const { user } = useAuth();

  // Fallback to hardcoded data
  const [requests, setRequests] = useState<ConnectionRequest[]>(connectionRequests);
  const [connections, setConnections] = useState<Connection[]>(myConnections);
  const [suggestions, setSuggestions] = useState<PeopleYouMayKnow[]>([]);
  const [sent, setSent] = useState<Connection[]>(sentRequests);
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    userId: string | null;
    reason: string;
  }>({ isOpen: false, userId: null, reason: "" });
  const [isReporting, setIsReporting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('recently-added');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(urlTab || 'requests');

  // Keep state in sync with URL changes
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', key);
    router.replace(`/connections?${params.toString()}`, { scroll: false });
  };

  // Fetch data from API
  useEffect(() => {
    if (useAPI && user) {
      fetchConnectionsData();
    }
  }, [activeTab, useAPI, user]);

  const fetchConnectionsData = async () => {
    try {
      setIsLoadingAPI(true);

      const sanitizeUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('http') && url.lastIndexOf('http') > 0) {
          return url.substring(url.lastIndexOf('http'));
        }
        return url;
      };

      if (activeTab === 'connections') {
        const response = await connectionService.getMyConnections(1, user?.id);
        if (response.status === 200 && response.data?.myconnections) {
          const items = response.data.myconnections.items || [];
          setApiConnections(items);
          setConnections(items.map((item: any) => ({
            id: item.id.toString(),
            name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username || 'User',
            avatar: sanitizeUrl(item.picture || item.image || item.profile_image || '/images/user_profile_placeholder.jpeg'),
            email: item.email || '',
            title: item.designation || item.profileHeadline || 'No Title',
            mutualConnections: 0,
            isFollowing: false,
            connectedDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
            distance_display: item.distance_display,
            media: item.media || [],
          } as any)));
        }
      } else if (activeTab === 'requests') {
        const response = await connectionService.getReceivedRequests(1, user?.id);
        if (response.status === 200 && response.data?.getrequestconnections) {
          const items = response.data.getrequestconnections.items || [];
          setApiRequests(items);
          setRequests(items.map((item: any) => ({
            id: item.id.toString(),
            name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
            avatar: sanitizeUrl(item?.picture || item.image || item.backimage || item.userDetail?.image || '/images/user_profile_placeholder.jpeg'),
            email: item.email || item.userDetail?.email || '',
            title: item.designation || item.profileHeadline || 'No Title',
            mutualConnections: item.mutual_count || 0,
            timestamp: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
            distance_display: item.distance_display,
            media: item.media || [],
          } as any)));
        }
      } else if (activeTab === 'sent') {
        const response = await connectionService.getSentRequests(1, user?.id);
        if (response.status === 200 && response.data?.sentrequestconnections) {
          const items = response.data.sentrequestconnections.items || [];
          setApiSent(items);
          setSent(items.map((item: any) => ({
            id: item.id.toString(),
            name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
            avatar: sanitizeUrl(item?.picture || item.image || item.profile_image || item.connectionUserDetail?.image || '/images/user_profile_placeholder.jpeg'),
            email: item.email || item.connectionUserDetail?.email || '',
            title: item.designation || "",
            mutual_count: item.mutual_count || 0,
            isFollowing: false,
            distance_display: item.distance_display,
            media: item.media || [],
          } as any)));
        }
      } else if (activeTab === 'suggestions') {
        const response = await connectionService.getSuggestedConnections(1);
        if (response.status === 200 && response.data?.connections?.items) {
          const items = response.data.connections.items || [];
          setSuggestions(items.map((item: any) => ({
            id: item.id.toString(),
            name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username,
            avatar: item.picture || item.image || '/images/user_profile_placeholder.jpeg',
            email: item.email || '',
            title: item.designation || '',
            mutual_count: item.mutual_count || 0,
            distance_display: item.distance_display,
            company: item.employerDetails?.company_name || 'Staffbook',
            media: item.media || [],
          } as any)));
        }
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoadingAPI(false);
    }
  };

  // Handle Accept Request
  const handleAccept = async (id: string) => {
    if (useAPI) {
      try {
        await connectionService.acceptConnectionRequest(Number(user?.id), Number(id));
        if (user) {
          // Find the request to potentially get the other user's details if needed, 
          // but we can just send it using their ID.
          // Note: id here is the connection_user_id of the person who sent the request.
          await sendNotificationToUser(
            id,
            Number(user.id),
            `${user.first_name} ${user.last_name}`,
            user.picture || '',
            'connection_accepted',
            `${user.first_name} ${user.last_name} accepted your connection request.`
          );
        }
        toast.success('Connection request accepted!');
        fetchConnectionsData(); // Refresh data
      } catch (error) {
        console.error('Error accepting request:', error);
        toast.error('Failed to accept connection request');
      }
    } else {
      const request = requests.find((r) => r.id === id);
      if (request) {
        setConnections([
          {
            id: request.id,
            name: request.name,
            avatar: request.avatar,
            title: request.title,
            mutualConnections: request.mutualConnections || request.mutual_count || 0,
            isFollowing: true,
            distance_display: request.distance_display,
          },
          ...connections,
        ]);
        setRequests(requests.filter((r) => r.id !== id));
      }
    }
  };

  // Handle Ignore Request
  const handleIgnore = async (id: string) => {
    if (useAPI) {
      try {
        await connectionService.rejectConnectionRequest(Number(id));
        fetchConnectionsData(); // Refresh data
      } catch (error) {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject connection request');
      }
    } else {
      setRequests(requests.filter((r) => r.id !== id));
    }
  };

  // Handle Connect
  const handleConnect = async (id: string) => {
    if (useAPI) {
      try {
        await connectionService.sendConnectionRequest(Number(user?.id), Number(id));
        if (user) {
          await sendNotificationToUser(
            id,
            Number(user.id),
            `${user.first_name} ${user.last_name}`,
            user.picture || '',
            'connection_request',
            `${user.first_name} ${user.last_name} sent you a connection request.`
          );
        }
        toast.success('Connection request sent!');
        fetchConnectionsData(); // Refresh data
      } catch (error) {
        console.error('Error sending request:', error);
        toast.error('Failed to send connection request');
      }
    } else {
      const suggestion = suggestions.find((s) => s.id === id);
      if (suggestion) {
        setSent([
          {
            id: suggestion.id,
            name: suggestion.name,
            avatar: suggestion.avatar,
            title: suggestion.title,
            company: suggestion.company,
            mutualConnections: suggestion.mutual_count || suggestion.mutualConnections || 0,
            distance_display: suggestion.distance_display,
            media: suggestion.media || [],
          },
          ...sent,
        ]);
        setSuggestions(suggestions.filter((s) => s.id !== id));
      }
    }
  };

  // Handle Withdraw Request
  const handleWithdraw = async (id: string) => {
    if (useAPI) {
      try {
        await connectionService.withdrawConnectionRequest(Number(user?.id), Number(id));
        toast.success('Connection request withdrawn!');
        fetchConnectionsData(); // Refresh data
      } catch (error) {
        console.error('Error withdrawing request:', error);
        toast.error('Failed to withdraw connection request');
      }
    } else {
      setSent(sent.filter((s) => s.id !== id));
    }
  };

  // Handle Follow/Unfollow
  const handleFollowToggle = (id: string) => {
    setConnections(
      connections.map((conn) =>
        conn.id === id ? { ...conn, isFollowing: !conn.isFollowing } : conn
      )
    );
  };

  // Handle Remove Connection
  const handleRemove = async (id: string) => {
    if (useAPI) {
      if (!confirm('Are you sure you want to remove this connection?')) {
        return;
      }
      try {
        await connectionService.unconnect(Number(user?.id), Number(id));
        fetchConnectionsData(); // Refresh data
      } catch (error) {
        console.error('Error removing connection:', error);
        toast.error('Failed to remove connection');
      }
    } else {
      setConnections(connections.filter((c) => c.id !== id));
    }
  };

  const handleReport = (userId: string) => {
    setReportModalData({ isOpen: true, userId, reason: "" });
  };

  const handleReportSubmit = async () => {
    if (!reportModalData.userId || !reportModalData.reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    setIsReporting(true);
    try {
      const response = await userService.reportUser({
        report_to_user_id: reportModalData.userId,
        reason: reportModalData.reason,
      });
      if (response.status === 200) {
        toast.success("User reported successfully");
        setReportModalData({ isOpen: false, userId: null, reason: "" });
      } else {
        const errorMsg = response.data?.errors?.message?.[0] || response.message || "Failed to report user";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Report user error:", error);
      const errorMsg = error?.response?.data?.data?.errors?.message?.[0] ||
        error?.response?.data?.message ||
        error.message ||
        "Failed to report user";
      toast.error(errorMsg);
    } finally {
      setIsReporting(false);
    }
  };

  // Filter based on search
  const filteredConnections = connections.filter(
    (conn) =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems = [
    { key: 'requests', label: 'Connection Requests', icon: <FiUserPlus /> },
    { key: 'suggestions', label: 'People You May Know', icon: <FiUsers /> },
    { key: 'connections', label: 'My Connections', icon: <FiUserCheck /> },
    { key: 'sent', label: 'Sent Invitations', icon: <FiSend /> },
  ];

  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllSent, setShowAllSent] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const INITIAL_DISPLAY_COUNT = 4;

  return (
    <div className="w-full">
      {/* Standardized Submenu Tabs */}
      <div className="mb-6 md:mb-16 md:mt-12 relative z-40">
        <ProfileSubMenu
          menuItems={menuItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          variant="primary"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className={`${THEME.components.glass} rounded-xl relative z-30 mb-6`}>
        <div className={`p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${THEME.components.input.search} pl-10 bg-white/50 backdrop-blur-sm border-white/40 focus:border-primary/50 h-10`}
            />
          </div>

          <div className="relative">
            {/* <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/40 rounded-xl text-sm font-medium text-gray-700 hover:bg-white/70 transition-colors shadow-sm w-full md:w-auto justify-center backdrop-blur-sm h-10"
            >
              <FiFilter className="w-4 h-4 text-gray-500" />
              <span>Sort by: {sortBy.replace('-', ' ')}</span>
              <FiChevronDown className="w-4 h-4 text-gray-400" />
            </button> */}

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/40 z-20 py-1 overflow-hidden">
                  {[
                    { id: 'recently-added', label: 'Recently added' },
                    { id: 'first-name', label: 'First name' },
                    { id: 'last-name', label: 'Last name' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id as SortType);
                        setShowSortMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50/50 hover:text-purple-600 text-gray-700 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-10 animate-in fade-in duration-500">
        {isLoadingAPI ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiLoader className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading connections...</p>
          </div>
        ) : (
          <>
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <h2 className={THEME.components.typography.sectionTitle}>
                  Connection Requests <span className="text-gray-400 text-sm font-normal ml-2">({requests.length})</span>
                </h2>
                {requests.length === 0 ? (
                  <EmptyState
                    icon={<FiUsers className="w-12 h-12 text-gray-300" />}
                    title="No pending requests"
                    description="You don't have any pending connection requests at the moment."
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 md:gap-6">
                    {requests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        mode="requests"
                        onAccept={handleAccept}
                        onIgnore={handleIgnore}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <Card noPadding>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className={THEME.components.typography.sectionTitle}>
                    My Connections <span className="text-gray-400 text-sm font-normal ml-2">({connections.length})</span>
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredConnections.length > 0 ? (
                    filteredConnections.map((connection) => (
                      <LinkedInConnectionCard
                        key={connection.id}
                        connection={connection}
                        onRemove={handleRemove}
                        onReport={handleReport}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-gray-500">No connections found matching your search.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === 'sent' && (
              <div className="space-y-6">
                <h2 className={THEME.components.typography.sectionTitle}>
                  Sent Invitations <span className="text-gray-400 text-sm font-normal ml-2">({sent.length})</span>
                </h2>
                {sent.length === 0 ? (
                  <EmptyState
                    icon={<FiUserPlus className="w-12 h-12 text-gray-300" />}
                    title="No pending invitations"
                    description="You haven't sent any connection requests recently."
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 md:gap-6">
                    {sent.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        mode="sent"
                        onWithdraw={handleWithdraw}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                <h2 className={THEME.components.typography.sectionTitle}>
                  People You May Know
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 md:gap-6">
                  {suggestions.map((person) => (
                    <RequestCard
                      key={person.id}
                      request={person}
                      mode="suggestions"
                      onConnect={handleConnect}
                      onIgnore={(id) => setSuggestions(suggestions.filter(s => s.id !== id))}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report User Modal */}
      {reportModalData.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-black">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
            <button
              onClick={() => !isReporting && setReportModalData({ ...reportModalData, isOpen: false })}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isReporting}
            >
              <FiX size={18} />
            </button>
            <div className="p-6 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Report User</h3>
              <p className="text-gray-600 text-sm mb-4">
                Please provide a reason for reporting this user.
              </p>
              <textarea
                autoFocus
                value={reportModalData.reason}
                onChange={(e) => setReportModalData({ ...reportModalData, reason: e.target.value })}
                placeholder="e.g. Illegal activities, Spam, Inappropriate behavior"
                className="w-full border border-gray-200 rounded-xl p-4 text-sm min-h-[120px] mb-5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                disabled={isReporting}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReportModalData({ ...reportModalData, isOpen: false })}
                  disabled={isReporting}
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportSubmit}
                  disabled={isReporting || !reportModalData.reason.trim()}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-lg shadow-red-500/30"
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <Card className="flex flex-col items-center justify-center py-16 text-center">
    <div className="bg-gray-50 p-4 rounded-full mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-sm">{description}</p>
  </Card>
);

// LinkedIn-style Connection Card Component
const LinkedInConnectionCard: React.FC<{
  connection: Connection;
  onRemove: (id: string) => void;
  onReport: (id: string) => void;
}> = ({ connection, onRemove, onReport }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-2 md:p-4 hover:bg-gray-50/50 transition-colors group">
      <div className="flex items-center gap-2 md:gap-4">
        {connection.avatar && (
          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
            <Image
              src={connection.avatar || '/images/user_profile_placeholder.jpeg'}
              alt={connection.name ?? ""}
              fill
              className="rounded-full object-cover border border-gray-100"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm md:text-base font-bold text-gray-900 mb-0.5 hover:text-gray-500 transition-colors`}>
            <Link href={`/user/${connection.id}`}>
              {connection.name}
            </Link>
          </h3>
          <p className={`text-xs md:text-sm text-gray-500 line-clamp-1`}>
            {connection.title}
          </p>

        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openMessageWidget', {
              detail: {
                chatUserId: connection.id,
                chatUserName: connection.name,
                chatUserAvatar: connection.avatar,
                chatUserEmail: connection.email
              }
            }))}
            className={`px-2.5 md:px-4 py-1 md:py-1.5 text-[10px] md:text-xs flex items-center gap-1 md:gap-2 !border-purple-200 !text-purple-700 hover:!bg-purple-50 shadow-sm`}
          >
            <MessageIcon size={12} />
            <span className="hidden sm:inline">Message</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 md:p-2 hover:bg-purple-50 rounded-full transition-colors text-purple-700"
            >
              <FiMoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
                  <button
                    onClick={() => {
                      onRemove(connection.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Remove connection
                  </button>
                  <button
                    onClick={() => {
                      onReport(connection.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Report user
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Request Card Component (Redesigned based on Reference Image)
// Unified Connection Card Component
const RequestCard: React.FC<{
  request: any;
  mode: 'requests' | 'sent' | 'suggestions';
  onAccept?: (id: string) => void;
  onIgnore?: (id: string) => void;
  onWithdraw?: (id: string) => void;
  onConnect?: (id: string) => void;
}> = ({ request, mode, onAccept, onIgnore, onWithdraw, onConnect }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const handleGalleryOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (request.media && request.media.length > 0) {
      setShowGallery(true);
      setCurrentImageIndex(0);
    }
  };

  const imageUrl = request.avatar || '/images/user_profile_placeholder.jpeg';

  return (
    <div
      onClick={() => router.push(`/user/${request.id}`)}
      className="relative w-full aspect-[3/5] md:aspect-[2/3] min-h-[120px] md:min-h-[320px] rounded-[10px] md:rounded-[24px] overflow-hidden group shadow-sm md:shadow-lg border border-white/5 bg-gray-100 cursor-pointer"
    >
      {/* Full Image Background */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={request.first_name || request.name || "User"}
          fill
          className="object-cover group-hover:scale-105 transition duration-1000 ease-out"
        />
      )}

      {/* Top Right Badges - Commented out as not available in API */}

      <div className="absolute top-1 md:top-4 right-1 md:right-4 flex flex-col items-end gap-1 md:gap-2.5 z-10">
        <div
          onClick={handleGalleryOpen}
          className="flex items-center gap-1 md:gap-1.5 bg-black/40 backdrop-blur-md px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg text-white text-[10px] md:text-xs font-bold border border-white/10 uppercase tracking-wider cursor-pointer hover:bg-black/60 transition-colors"
        >
          <ImageIcon size={10} className="text-white/80" />
          <span>{request?.media?.length ?? 0}</span>
        </div>
        <div className="flex items-center gap-1 md:gap-1.5 bg-black/40 backdrop-blur-md px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg text-white text-[10px] md:text-xs font-bold border border-white/10 tracking-tight">
          <FiMapPin size={10} className="text-white/80" />
          <span>{request.distance_display}</span>
        </div>
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-3/4 md:h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Profile Info Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-1 md:p-4 text-white pb-20 md:pb-24">
        <div className="space-y-0 md:space-y-1.5 animate-in slide-in-from-bottom-2 duration-500">
          {mode === 'sent' && (
            <p className="text-[10px] md:text-xs font-bold text-white/80 tracking-wide uppercase">
              Pending
            </p>
          )}

          <div className="flex items-center gap-1 md:gap-1.5">
            <h3 className="text-xs md:text-lg font-black font-Montserrat leading-tight uppercase tracking-tight drop-shadow-lg truncate">
              {(request.name || "")}
            </h3>
          </div>

          <div className="text-[10px] md:text-xs font-bold text-white/90 drop-shadow-md line-clamp-1">
            {request.title || "No Designation"}
          </div>

          <div className="text-[10px] md:text-xs font-bold text-white/90 drop-shadow-md">
            {`${request.mutual_count && request.mutual_count > 0 ? request.mutual_count : 0} Mutual`}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-4 md:bottom-6 left-0 right-0 p-0 md:p-3 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-around w-full">
          <div className="flex-1 flex justify-center">
            {mode === 'sent' ? (
              <PlatformActionButton
                icon={FiX}
                label="Withdraw"
                showLabelBelow
                labelClassName="!text-white opacity-90 text-[10px] md:text-xs"
                className="!w-10 !h-10 md:!w-14 md:!h-14"
                onClick={(e) => {
                  e.stopPropagation();
                  onWithdraw?.(request.id);
                }}
              />
            ) : (
              <PlatformActionButton
                icon={mode === 'requests' ? FiCheck : FiUserPlus}
                label={mode === 'requests' ? 'Accept' : 'Connect'}
                showLabelBelow
                labelClassName="!text-white opacity-90 text-[10px] md:text-xs"
                className="!w-10 !h-10 md:!w-14 md:!h-14"
                onClick={(e) => {
                  e.stopPropagation();
                  mode === 'requests' ? onAccept?.(request.id) : onConnect?.(request.id);
                }}
              />
            )}
          </div>

          {mode !== 'sent' && (
            <div className="flex-1 flex justify-center">
              <PlatformActionButton
                icon={FiX}
                label={mode === 'suggestions' ? 'Skip' : 'Ignore'}
                showLabelBelow
                labelClassName="!text-white opacity-90 text-[10px] md:text-xs"
                className="!w-10 !h-10 md:!w-14 md:!h-14"
                onClick={(e) => {
                  e.stopPropagation();
                  onIgnore?.(request.id);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Gallery Popup */}
      {showGallery && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" onClick={(e) => { e.stopPropagation(); setShowGallery(false); }}>
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowGallery(false); }}
              className="absolute top-0 right-0 md:-top-12 md:-right-12 text-white hover:text-gray-300 p-2 border border-white/10 bg-black/50 hover:bg-black/80 rounded-full z-10 transition-all"
            >
              <FiX size={24} />
            </button>

            {request.media && request.media.length > 0 && (
              <div className="relative w-full flex items-center justify-center">
                <div className="relative w-full max-w-3xl aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden bg-black/50 shadow-2xl">
                  <Image
                    src={request.media[currentImageIndex].url}
                    alt="Gallery Image"
                    fill
                    className="object-contain"
                  />
                </div>

                {request.media.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + request.media.length) % request.media.length); }}
                      className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all z-10 border border-white/10"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % request.media.length); }}
                      className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all z-10 border border-white/10"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </>
                )}

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-sm font-bold px-4 py-2 pt-4 drop-shadow-md">
                  {currentImageIndex + 1} / {request.media.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
