'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiX, FiMinus, FiChevronUp, FiChevronDown, FiEdit, FiSearch, FiMoreVertical } from 'react-icons/fi';
import { Chat } from '@/data/chats';
import MessageIcon from '@/components/icons/MessageIcon';
import ChatWindow from './ChatWindow';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import { ref, onValue, set, update, serverTimestamp, onDisconnect } from 'firebase/database';
import toast from 'react-hot-toast';
import { userService } from '@/lib/api/services/userService';



export default function MessageWidget() {
  const { user, isOnline } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatIds, setActiveChatIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [searchResults, setSearchResults] = useState<Chat[]>([]);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [globalProfiles, setGlobalProfiles] = useState<Record<string, any>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [reportModalData, setReportModalData] = useState<{ isOpen: boolean; userId: string | null; reason: string }>({ isOpen: false, userId: null, reason: '' });
  const [isReporting, setIsReporting] = useState(false);

  const formatChatTime = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;

    const day = date.getDate();
    const monthStr = date.toLocaleString('default', { month: 'short' }).toLowerCase();
    return `${day} ${monthStr}, ${timeStr}`;
  };

  const handleReportUserClick = (e: React.MouseEvent, pId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setReportModalData({ isOpen: true, userId: pId, reason: '' });
  };

  const handleReportSubmit = async () => {
    if (!reportModalData.userId || !reportModalData.reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    setIsReporting(true);
    try {
      await userService.reportUser({ report_to_user_id: reportModalData.userId, reason: reportModalData.reason });
      toast.success("User reported successfully");
      setReportModalData({ isOpen: false, userId: null, reason: '' });
    } catch (error) {
      toast.error("Failed to report user");
    } finally {
      setIsReporting(false);
    }
  };

  const handleBlockUser = async (e: React.MouseEvent, pId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (!window.confirm("Are you sure you want to block this user? They will not be able to message you anymore.")) return;
    try {
      const chatId = getChatId(pId);
      const chatRef = ref(db, `chats/${chatId}`);
      await update(chatRef, {
        isBlocked: true,
        blockedBy: myUid
      });
      toast.success("User blocked successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to block user");
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch or generate myUid for Firebase RTDB based on actual user API ID
  useEffect(() => {
    if (!user || !user.id) return;
    const internalUid = String(user.id);
    setMyUid(internalUid);

    const syncMyUid = async () => {
      try {
        // Force update my status/details in this Firebase user node
        const userRef = ref(db, `users/${internalUid}`);
        await update(userRef, {
          id: internalUid, // using API id natively
          originalId: String(user.id),
          email: user.email || '',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'User',
          avatar: user.picture || '/images/user_profile_placeholder.jpeg',
          lastOnline: serverTimestamp(),
          is_online: isOnline
        });

        // Setup real-time presence handled in AuthContext
      } catch (error) {
        console.error("Firebase setup error:", error);
      }
    };
    syncMyUid();
  }, [user]);

  useEffect(() => {
    const handleOpen = async (e: Event) => {
      setIsOpen(true);
      const customEvent = e as CustomEvent<{ chatUserId?: string; chatUserName?: string; chatUserAvatar?: string, chatUserEmail?: string }>;

      const targetEmail = customEvent.detail?.chatUserEmail;
      const targetId = customEvent.detail?.chatUserId;

      if (targetId && myUid) {
        setIsOpen(true);
        const otherUid = String(targetId);
        const otherName = customEvent.detail?.chatUserName || 'User';
        const otherAvatar = customEvent.detail?.chatUserAvatar || '/images/user_profile_placeholder.jpeg';

        try {
          // Force create or update the receiver's root profile in RTDB 
          // to ensure they can see this chat when they log in to the system.
          const receiverRef = ref(db, `users/${otherUid}`);
          await update(receiverRef, {
            id: otherUid,
            email: targetEmail || '',
            name: otherName,
            avatar: otherAvatar,
            originalId: String(targetId)
          });
        } catch (error) {
          console.error("Firebase creation error when locating connection:", error);
        }

        const chatId = myUid < otherUid ? `chat_${myUid}_${otherUid}` : `chat_${otherUid}_${myUid}`;

        const newChat = {
          id: otherUid,
          name: otherName,
          avatar: otherAvatar,
          role: '',
          isNewUser: true,
          email: targetEmail
        };

        setSearchResults(prev => {
          if (!prev.find(r => r.id === otherUid)) {
            return [...prev, newChat];
          }
          return prev;
        });

        setActiveChatIds(prev => {
          if (!prev.includes(chatId)) {
            const maxChats = isMobile ? 1 : 3;
            if (isMobile) {
              setTimeout(() => setIsOpen(false), 50);
            }
            return [chatId, ...prev].slice(0, maxChats);
          }
          return prev;
        });

      } else if (!myUid) {
        toast.error("Your Chat Profile is still loading...");
      }
    };
    window.addEventListener('openMessageWidget', handleOpen);
    return () => window.removeEventListener('openMessageWidget', handleOpen);
  }, [myUid, isMobile]);

  // Load user chats
  useEffect(() => {
    if (!myUid) return;
    const userChatsRef = ref(db, `users/${myUid}/chats`);
    const unsubscribe = onValue(userChatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        const chatsList: (Chat & { timestamp?: number; participantId?: string })[] = Object.keys(chatsData).map(key => ({
          id: key,
          participantId: chatsData[key].participantId,
          name: chatsData[key].participantName || 'Unknown User',
          role: chatsData[key].participantRole || '',
          avatar: chatsData[key].participantAvatar || '/images/user_profile_placeholder.jpeg',
          lastMessage: chatsData[key].lastMessage || '',
          lastMessageTime: chatsData[key].lastMessageTime || '',
          unreadCount: chatsData[key].unreadCount || 0,
          timestamp: chatsData[key].timestamp || 0
        }));
        chatsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setRecentChats(chatsList);
      } else {
        setRecentChats([]);
      }
    });
    return () => unsubscribe();
  }, [myUid]);

  // Search users in Firebase RTDB
  useEffect(() => {
    if (!searchQuery.trim() || !myUid) {
      setSearchResults([]);
      return;
    }
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const queryLower = searchQuery.toLowerCase();
        const results: (Chat & { isNewUser?: boolean })[] = Object.keys(usersData)
          .filter(uid => uid !== myUid && (
            usersData[uid].name?.toLowerCase().includes(queryLower) ||
            usersData[uid].email?.toLowerCase().includes(queryLower)
          ))
          .map(uid => ({
            id: uid, // participant ID is now UID
            name: usersData[uid].name || 'Unknown User',
            role: '',
            avatar: usersData[uid].avatar || '/images/user_profile_placeholder.jpeg',
            lastMessage: 'Say hi!',
            lastMessageTime: '',
            unreadCount: 0,
            isNewUser: true,
            participantId: uid
          }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    });

    return () => unsubscribe();
  }, [searchQuery, myUid]);

  const getChatId = (otherUid: string) => {
    if (!myUid) return '';
    return myUid < otherUid ? `chat_${myUid}_${otherUid}` : `chat_${otherUid}_${myUid}`;
  };

  const toggleChat = (participantChat: Chat & { isNewUser?: boolean; participantId?: string }) => {
    if (!myUid) return;
    const isNew = participantChat.isNewUser;
    const chatId = isNew ? getChatId(participantChat.id) : participantChat.id;

    // Auto add chat to state so window opens correctly
    if (!activeChatIds.includes(chatId)) {
      const maxChats = isMobile ? 1 : 3;
      const newActive = [chatId, ...activeChatIds].slice(0, maxChats);
      setActiveChatIds(newActive);

      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  const closeChat = (chatId: string) => {
    setActiveChatIds(activeChatIds.filter(id => id !== chatId));
  };

  // Track global user profiles smoothly (for online state, real-name / avatar fetching)
  useEffect(() => {
    const unsub = onValue(ref(db, 'users'), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalProfiles(snapshot.val());
      }
    });
    return () => unsub();
  }, []);

  const displayChats = searchQuery.trim() ? searchResults : recentChats;

  if (['/signin', '/signup'].includes(pathname)) return null;
  if (!user || !myUid) return null;

  const totalUnread = recentChats.filter(chat => (chat.unreadCount || 0) > 0).length;

  return (
    <div className={`fixed bottom-0 right-4 z-[100] flex items-end gap-4 pointer-events-none ${isMobile ? 'right-0 left-0' : ''}`}>
      {/* Side-by-side Chat Windows */}
      <div className={`flex items-end gap-4 pointer-events-auto ${isMobile ? 'w-full px-2' : ''}`}>
        {activeChatIds.map(chatId => {
          let chatData = recentChats.find(c => c.id === chatId);

          let pId = chatData?.participantId;
          if (!pId) {
            const parts = chatId.split('_');
            if (parts.length === 3) pId = parts[1] === myUid ? parts[2] : parts[1];
          }

          if (!chatData && pId) {
            const searchedUser = searchResults.find(r => r.id === pId);

            chatData = {
              id: chatId,
              name: searchedUser?.name || globalProfiles[pId]?.name || 'Unknown User',
              avatar: searchedUser?.avatar || globalProfiles[pId]?.avatar || '/images/user_profile_placeholder.jpeg',
              role: '',
            } as Chat;
          } else if (chatData && pId) {
            // Override generic names with explicit global profile definitions if available
            if (!chatData.name || chatData.name === 'Unknown User' || chatData.name === 'User') {
              chatData.name = globalProfiles[pId]?.name || chatData.name;
            }
            if (!chatData.avatar || chatData.avatar === '/images/user_profile_placeholder.jpeg') {
              chatData.avatar = globalProfiles[pId]?.avatar || chatData.avatar;
            }
          }

          const chatWithParticipant = {
            ...chatData,
            participantId: pId
          } as Chat & { isNewUser?: boolean; participantId?: string };

          return (
            <ChatWindow
              key={chatId}
              chat={chatWithParticipant}
              myUid={myUid}
              onClose={() => closeChat(chatId)}
              isActiveChats={activeChatIds.length > 0}
            />
          );
        })}
      </div>

      {/* Main Messaging Trigger/List Container */}
      <div
        className={`pointer-events-auto flex flex-col items-end transition-all duration-300 ${isOpen
          ? (isMobile ? 'w-full max-w-full' : 'w-80')
          : (isMobile ? 'mr-2 mb-20 md:mb-6' : 'mr-28 mb-6')
          }`}
      >
        {isOpen ? (
          <div className={`bg-white/70 backdrop-blur-xl border border-gray-200/40 border-b-0 rounded-t-xl shadow-2xl flex flex-col animate-slideUp ${isMobile ? 'w-full max-w-full' : 'w-full'
            }`}>
            {/* Bar Header */}
            <div
              className="px-4 py-2.5 flex items-center justify-between cursor-pointer border-b border-gray-100/40 bg-white/40 backdrop-blur-sm rounded-t-xl hover:bg-white/60 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-purple-100/80 flex items-center justify-center text-purple-600">
                    <MessageIcon size={18} />
                  </div>
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm text-gray-800">Messaging</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FiChevronDown size={18} />
              </div>
            </div>

            {/* Messaging Body */}
            <div className={`flex flex-col bg-white/50 backdrop-blur-md ${isMobile ? 'h-[60vh] max-h-[500px]' : 'h-[400px]'}`}>
              {/* Search */}
              <div className="px-4 py-3 border-b border-gray-50/40">
                <div className="relative flex items-center bg-gray-50/60 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-purple-200 transition-all border border-transparent focus-within:bg-white/80 focus-within:border-gray-100">
                  <FiSearch className="text-gray-400 mr-2" size={14} />
                  <input
                    type="text"
                    placeholder="Search users by name or email"
                    className="bg-transparent border-none focus:ring-0 text-xs text-gray-700 w-full p-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {displayChats.map((chat: any) => {
                  const pId = chat.participantId || (chat.id.startsWith('chat_') ? (chat.id.split('_')[1] === myUid ? chat.id.split('_')[2] : chat.id.split('_')[1]) : chat.id);
                  const isOnline = !!globalProfiles[pId]?.is_online;
                  const displayName = chat.name && chat.name !== 'Unknown User' && chat.name !== 'User' ? chat.name : (globalProfiles[pId]?.name || 'Unknown User');
                  const displayAvatar = chat.avatar && chat.avatar !== '/images/user_profile_placeholder.jpeg' ? chat.avatar : (globalProfiles[pId]?.avatar || '/images/user_profile_placeholder.jpeg');

                  return (
                    <div
                      key={chat.id}
                      onClick={() => toggleChat(chat)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-white/40 cursor-pointer transition-colors border-b border-gray-50/40 last:border-0 ${activeChatIds.includes(chat.isNewUser ? getChatId(chat.id) : chat.id) ? 'bg-purple-50/30 border-l-2 border-l-purple-600' : ''
                        }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center'>
                          <Image src={displayAvatar} alt={displayName} width={48} height={48} className="rounded-full w-full h-full object-cover" />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full`}></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate pr-2">{displayName}</h4>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatChatTime(chat.timestamp) || chat.lastMessageTime}</span>
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setOpenMenuId(openMenuId === chat.id ? null : chat.id)} className="p-0.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <FiMoreVertical size={14} />
                              </button>
                              {openMenuId === chat.id && (
                                <div className="absolute right-0 top-5 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-50 min-w-[120px]">
                                  <button onClick={(e) => handleReportUserClick(e, pId)} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-50 flex items-center gap-2">
                                    Report User
                                  </button>
                                  <button onClick={(e) => handleBlockUser(e, pId)} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-50 flex items-center gap-2">
                                    Block User
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className={`text-[11px] truncate ${(chat.unreadCount && chat.unreadCount > 0) ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          totalUnread > 0 && (
            <button
              aria-label="Open messages"
              className={`hidden md:flex items-center gap-2 px-6 py-2.5 bg-purple-600/70 backdrop-blur-xl text-white rounded-full font-bold shadow-2xl hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-white/30 ring-1 ring-white/20 ${isMobile ? 'text-xs px-4 py-2' : 'text-sm'
                }`}
              onClick={() => setIsOpen(true)}
            >
              <MessageIcon size={18} />
              <div className="relative">
                {!isMobile && 'Messages'}
                <span className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-purple-600/50 shadow-lg">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              </div>
            </button>
          )
        )}
      </div>

      {reportModalData.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4 pointer-events-auto text-black">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => !isReporting && setReportModalData({ ...reportModalData, isOpen: false })}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isReporting}
            >
              <FiX size={18} />
            </button>
            <div className="p-6 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Report User</h3>
              <p className="text-gray-600 text-xs mb-4">
                Please provide a reason for reporting this user.
              </p>
              <textarea
                autoFocus
                value={reportModalData.reason}
                onChange={(e) => setReportModalData({ ...reportModalData, reason: e.target.value })}
                placeholder="e.g. Illegal activities, Spam, Inappropriate behavior"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[100px] mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                disabled={isReporting}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReportModalData({ ...reportModalData, isOpen: false })}
                  disabled={isReporting}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportSubmit}
                  disabled={isReporting || !reportModalData.reason.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}