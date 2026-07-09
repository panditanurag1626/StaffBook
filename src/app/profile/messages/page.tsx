"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiMessageCircle,
  FiSend,
  FiPaperclip,
  FiSearch,
  FiMoreVertical,
  FiBriefcase,
  FiChevronRight,
  FiX,
  FiSmile,
  FiCheck,
  FiCalendar,
  FiChevronLeft,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import {
  ref as dbRef,
  onValue,
  push,
  set,
  serverTimestamp,
  update,
  increment,
  onDisconnect,
} from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { userService } from "@/lib/api/services/userService";
import { notifyMessageReceived } from "@/lib/firebaseNotifications";
import MeetingModal from "@/components/shared/MeetingModal";
import { THEME } from "@/styles/theme";

export interface ChatMessage {
  id: string;
  sender: string;
  senderUid?: string;
  text: string;
  time: string;
  timestamp?: number;
  isOwn: boolean;
  isRead?: boolean;
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

interface Chat {
  id: string;
  participantId?: string;
  name: string;
  avatar: string;
  role?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  timestamp?: number;
  isNewUser?: boolean;
  email?: string;
}

function MessagesContent() {
  const { user } = useAuth();
  const [myUid, setMyUid] = useState<string | null>(null);

  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [searchResults, setSearchResults] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalProfiles, setGlobalProfiles] = useState<Record<string, any>>({});

  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null); // The true chat_ ID
  const [showMobileChat, setShowMobileChat] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    userId: string | null;
    reason: string;
  }>({ isOpen: false, userId: null, reason: "" });
  const [isReporting, setIsReporting] = useState(false);

  // Active Chat Content State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isOnline, setIsOnline] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedBy, setBlockedBy] = useState<string | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const chatWithHandledRef = useRef<string | null>(null);

  // Handle chatWith URL param
  const searchParams = useSearchParams();

  // Time formatter
  const formatChatTime = (timestamp: number | undefined) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;

    const day = date.getDate();
    const monthStr = date.toLocaleString("default", { month: "short" }).toLowerCase();
    return `${day} ${monthStr}, ${timeStr}`;
  };

  const getDateLabel = (timestamp: number): string | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const getChatId = (otherUid: string) => {
    if (!myUid) return "";
    return myUid < otherUid ? `chat_${myUid}_${otherUid}` : `chat_${otherUid}_${myUid}`;
  };

  // Close Emoji Picker on Outside Click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize MyUid Sync
  useEffect(() => {
    if (!user || !user.id) return;
    const internalUid = String(user.id);
    setMyUid(internalUid);

    const syncMyUid = async () => {
      try {
        const userRef = dbRef(db, `users/${internalUid}`);
        await update(userRef, {
          id: internalUid,
          originalId: String(user.id),
          email: user.email || "",
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User",
          avatar: user.picture || "/images/user_profile_placeholder.jpeg",
          lastOnline: serverTimestamp(),
          is_online: true,
        });

        const connectedRef = dbRef(db, ".info/connected");
        onValue(connectedRef, (snap) => {
          if (snap.val() === true) {
            const myOnlineRef = dbRef(db, `users/${internalUid}/is_online`);
            onDisconnect(myOnlineRef).set(false);
            set(myOnlineRef, true);
          }
        });
      } catch (error) {
        console.error("Firebase setup error:", error);
      }
    };
    syncMyUid();
  }, [user]);

  // Track global user profiles smoothly
  useEffect(() => {
    const unsub = onValue(dbRef(db, "users"), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalProfiles(snapshot.val());
      }
    });
    return () => unsub();
  }, []);

  // Load user recent chats
  useEffect(() => {
    if (!myUid) return;
    const userChatsRef = dbRef(db, `users/${myUid}/chats`);
    const unsubscribe = onValue(userChatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        const chatsList: Chat[] = Object.keys(chatsData).map((key) => ({
          id: key,
          participantId: chatsData[key].participantId,
          name: chatsData[key].participantName || "Unknown User",
          role: chatsData[key].participantRole || "",
          avatar: chatsData[key].participantAvatar || "/images/user_profile_placeholder.jpeg",
          lastMessage: chatsData[key].lastMessage || "",
          lastMessageTime: chatsData[key].lastMessageTime || "",
          unreadCount: chatsData[key].unreadCount || 0,
          timestamp: chatsData[key].timestamp || 0,
        }));
        chatsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setRecentChats(chatsList);
      } else {
        setRecentChats([]);
      }
    });
    return () => unsubscribe();
  }, [myUid]);

  // Resolve "Unknown User" names when globalProfiles loads
  useEffect(() => {
    if (Object.keys(globalProfiles).length === 0) return;
    setRecentChats(prev => prev.map(chat => {
      const pId = chat.participantId;
      if (pId && globalProfiles[pId]?.name && (!chat.name || chat.name === 'Unknown User' || chat.name === 'User')) {
        return { ...chat, name: globalProfiles[pId].name, avatar: globalProfiles[pId].avatar || chat.avatar };
      }
      return chat;
    }));
  }, [globalProfiles]);

  // Auto-open chat when chatWith param is present
  useEffect(() => {
    const chatWithId = searchParams.get('chatWith');
    if (!chatWithId || !myUid || chatWithHandledRef.current === chatWithId) return;

    // Check if this user is already in recent chats
    const existingChat = recentChats.find(c => c.participantId === chatWithId);
    if (existingChat) {
      chatWithHandledRef.current = chatWithId;
      handleSelectChat(existingChat);
      return;
    }

    // Check if user exists in global profiles (Firebase)
    const profile = globalProfiles[chatWithId];
    if (profile) {
      chatWithHandledRef.current = chatWithId;
      const newChat: Chat = {
        id: chatWithId,
        participantId: chatWithId,
        name: profile.name || 'User',
        avatar: profile.avatar || '/images/user_profile_placeholder.jpeg',
        lastMessage: 'Say hi!',
        lastMessageTime: '',
        unreadCount: 0,
        isNewUser: true,
      };
      handleSelectChat(newChat);
      return;
    }

    // If not in global profiles yet, create a minimal entry and open chat
    // This covers the case where user hasn't chatted before and Firebase hasn't synced yet
    if (Object.keys(globalProfiles).length > 0) {
      chatWithHandledRef.current = chatWithId;
      const newChat: Chat = {
        id: chatWithId,
        participantId: chatWithId,
        name: 'User',
        avatar: '/images/user_profile_placeholder.jpeg',
        lastMessage: 'Say hi!',
        lastMessageTime: '',
        unreadCount: 0,
        isNewUser: true,
      };
      handleSelectChat(newChat);
    }
  }, [searchParams, myUid, recentChats, globalProfiles]);

  // Search users functionality
  useEffect(() => {
    if (!searchQuery.trim() || !myUid) {
      setSearchResults([]);
      return;
    }
    const usersRefObj = dbRef(db, "users");
    const unsubscribe = onValue(usersRefObj, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const queryLower = searchQuery.toLowerCase();
        const results: Chat[] = Object.keys(usersData)
          .filter(
            (uid) =>
              uid !== myUid &&
              (usersData[uid].name?.toLowerCase().includes(queryLower) ||
                usersData[uid].email?.toLowerCase().includes(queryLower))
          )
          .map((uid) => ({
            id: uid,
            name: usersData[uid].name || "Unknown User",
            role: "",
            avatar: usersData[uid].avatar || "/images/user_profile_placeholder.jpeg",
            lastMessage: "Say hi!",
            lastMessageTime: "",
            unreadCount: 0,
            isNewUser: true,
            participantId: uid,
          }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    });
    return () => unsubscribe();
  }, [searchQuery, myUid]);

  // Select a Chat logic
  const handleSelectChat = async (participantChat: Chat) => {
    if (!myUid) return;

    const pId = participantChat.participantId || participantChat.id;
    const isNew = participantChat.isNewUser || !recentChats.find(c => c.participantId === pId || c.id === pId);
    const computedChatId = isNew ? getChatId(pId) : (participantChat.id.startsWith("chat_") ? participantChat.id : getChatId(pId));

    // Resolve global names
    const displayName = participantChat.name && participantChat.name !== 'Unknown User' && participantChat.name !== 'User' ? participantChat.name : (globalProfiles[pId]?.name || 'Unknown User');
    const displayAvatar = participantChat.avatar && participantChat.avatar !== '/images/user_profile_placeholder.jpeg' ? participantChat.avatar : (globalProfiles[pId]?.avatar || '/images/user_profile_placeholder.jpeg');

    const mappedChat = {
      ...participantChat,
      participantId: pId,
      name: displayName,
      avatar: displayAvatar,
      id: computedChatId
    };

    setActiveChat(mappedChat);
    setActiveChatId(computedChatId);

    // If new user, create their node softly just to sync DB entry
    if (isNew && pId) {
      try {
        const receiverRef = dbRef(db, `users/${pId}`);
        const validName = displayName !== 'Unknown User' && displayName !== 'User' ? displayName : undefined;
        await update(receiverRef, {
          id: pId,
          ...(validName ? { name: validName } : {}),
          avatar: displayAvatar,
          originalId: pId
        });
      } catch (error) {
        console.error("Firebase update user error:", error);
      }
    }

    setShowMobileChat(true);
  };

  // ----- ACTIVE CHAT LISTENERS (Online, Blocking, Messages) -----

  useEffect(() => {
    if (!activeChat || !activeChat.participantId) return;
    const onlineRef = dbRef(db, `users/${activeChat.participantId}/is_online`);
    const unsub = onValue(onlineRef, (snapshot) => {
      setIsOnline(!!snapshot.val());
    });
    return () => unsub();
  }, [activeChat]);

  useEffect(() => {
    if (!activeChatId) return;
    const blockRef = dbRef(db, `chats/${activeChatId}`);
    const unsub = onValue(blockRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        setIsBlocked(!!chatData.isBlocked);
        setBlockedBy(chatData.blockedBy || null);
      } else {
        setIsBlocked(false);
        setBlockedBy(null);
      }
    });
    return () => unsub();
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId || !myUid) return;

    const messagesRef = dbRef(db, `chats/${activeChatId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgsData = snapshot.val();
        const msgsList: ChatMessage[] = Object.keys(msgsData).map((key) => {
          const msg = msgsData[key];
          if (msg.senderUid !== myUid && !msg.isRead) {
            update(dbRef(db, `chats/${activeChatId}/messages/${key}`), { isRead: true }).catch(() => { });
          }
          return {
            id: key,
            sender: msg.senderName || "User",
            senderUid: msg.senderUid,
            text: msg.text || "",
            time: msg.time || "",
            timestamp: msg.timestamp || 0,
            isOwn: msg.senderUid === myUid,
            isRead: msg.isRead || false,
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
          };
        });
        msgsList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(msgsList);
      } else {
        setMessages([]);
      }
    });

    // Clear unreads
    const userChatRef = dbRef(db, `users/${myUid}/chats/${activeChatId}`);
    update(userChatRef, { unreadCount: 0 }).catch(() => { });

    // Listen to typing
    const typingRef = dbRef(db, `chats/${activeChatId}/typing/${activeChat?.participantId}`);
    const typeUnsub = onValue(typingRef, (snapshot) => {
      setOtherTyping(!!snapshot.val());
    });

    return () => {
      unsubscribe();
      typeUnsub();
    };
  }, [activeChatId, myUid, activeChat]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherTyping]);

  // ----- MESSAGE SENDING & UI -----

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedMedia(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  const checkNonPremiumRestrictions = (currentText: string) => {
    if (user?.is_premium) return false;

    const numberWords: Record<string, string> = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
    };

    const isContactInfo = (text: string) => {
      let processedText = text.toLowerCase();
      Object.keys(numberWords).forEach(word => {
        processedText = processedText.replace(new RegExp(`\\b${word}\\b`, 'g'), numberWords[word]);
      });

      const textWithoutSpaces = processedText.replace(/\s+/g, '');

      // Block specific email provider keywords (handles 'gmail', 'yahoo', '@gmail', etc.)
      const blockedWords = ['gmail', 'yahoo', 'hotmail', 'outlook', 'protonmail', 'icloud', 'aol'];
      for (const word of blockedWords) {
        if (textWithoutSpaces.includes(word)) return true;
      }

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
      if (emailRegex.test(processedText) || emailRegex.test(textWithoutSpaces)) return true;

      const phoneRegex = /(\d[\s.\-\(\)_]*){10,}/;
      if (phoneRegex.test(processedText) || phoneRegex.test(textWithoutSpaces)) return true;

      return false;
    };

    // 1. Check current message alone
    if (isContactInfo(currentText)) return true;

    // 2. Check combined with last 15 messages
    const last15OwnMessages = messages.filter((m) => m.isOwn).slice(-15).map((m) => m.text);
    
    const combinedTextSpace = [...last15OwnMessages, currentText].join(' ');

    if (isContactInfo(combinedTextSpace)) {
      return true;
    }

    // 3. Stop if user is sending numbers one by one (3 consecutive number-only messages)
    const isOnlyNumber = (text: string) => {
      let processedText = text.toLowerCase();
      Object.keys(numberWords).forEach(word => {
        processedText = processedText.replace(new RegExp(`\\b${word}\\b`, 'g'), '0');
      });
      const leftover = processedText.replace(/[\d\s.\-\(\)_,+]/g, '');
      const hasDigits = /\d/.test(processedText);
      return leftover.length === 0 && hasDigits;
    };

    if (isOnlyNumber(currentText)) {
      const ownMsgs = messages.filter((m) => m.isOwn);
      let consecutiveNumbers = 1;
      for (let i = ownMsgs.length - 1; i >= 0; i--) {
        if (isOnlyNumber(ownMsgs[i].text)) {
          consecutiveNumbers++;
        } else {
          break;
        }
      }
      if (consecutiveNumbers >= 3) {
        return true;
      }
    }

    return false;
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedMedia) || !myUid || !activeChat?.participantId || !user || !activeChatId) return;

    if (checkNonPremiumRestrictions(inputText)) {
      toast.error("Please buy premium to send phone number and email", {
        duration: 4000,
        position: "top-center",
      });
      return;
    }

    setIsUploading(true);
    let uploadedMediaUrl = null;
    let uploadedMediaType = null;

    if (selectedMedia) {
      try {
        const fileExt = selectedMedia.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const imgReference = storageRef(storage, `chat_media/${myUid}/${fileName}`);
        await uploadBytes(imgReference, selectedMedia);
        uploadedMediaUrl = await getDownloadURL(imgReference);
        uploadedMediaType = selectedMedia.type.startsWith("image/") ? "image" : "video";
      } catch (err) {
        console.error("Failed to upload media:", err);
      }
    }

    const text = inputText.trim();
    setInputText("");
    setSelectedMedia(null);
    setMediaPreview(null);
    setShowEmojiPicker(false);
    setIsUploading(false);

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const t = audioCtx.currentTime;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(2000, t);
        oscillator.frequency.exponentialRampToValueAtTime(1000, t + 0.01);
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.5, t + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        oscillator.start(t);
        oscillator.stop(t + 0.05);
      }
    } catch (e) {
      // Sound error
    }

    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeString = `${hours}:${minutes} ${ampm}`;

    const myTypingRef = dbRef(db, `chats/${activeChatId}/typing/${myUid}`);
    set(myTypingRef, false);

    const senderNameExtracted = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User";

    const newMsgRef = push(dbRef(db, `chats/${activeChatId}/messages`));
    const msgPayload: any = {
      senderUid: myUid,
      senderName: senderNameExtracted,
      text,
      time: timeString,
      timestamp: serverTimestamp(),
      isRead: false,
    };

    if (uploadedMediaUrl) {
      msgPayload.mediaUrl = uploadedMediaUrl;
      msgPayload.mediaType = uploadedMediaType;
    }

    await set(newMsgRef, msgPayload);
    const lastMsgDisplay = uploadedMediaType === "image" ? "📷 Image" : uploadedMediaType === "video" ? "🎥 Video" : text;

    const resolvedName = activeChat.name !== 'Unknown User' && activeChat.name !== 'User' ? activeChat.name : (activeChat.participantId ? globalProfiles[activeChat.participantId]?.name : null) || activeChat.name;
    await update(dbRef(db, `users/${myUid}/chats/${activeChatId}`), {
      participantId: activeChat.participantId,
      participantName: resolvedName,
      participantAvatar: activeChat.avatar,
      lastMessage: lastMsgDisplay,
      lastMessageTime: timeString,
      timestamp: serverTimestamp(),
    });

    const currentAvatar = user.picture || "/images/user_profile_placeholder.jpeg";
    await update(dbRef(db, `users/${activeChat.participantId}/chats/${activeChatId}`), {
      participantId: myUid,
      participantName: senderNameExtracted,
      participantAvatar: currentAvatar,
      lastMessage: lastMsgDisplay,
      lastMessageTime: timeString,
      timestamp: serverTimestamp(),
      unreadCount: increment(1),
    });

    if (myUid && activeChat.participantId && String(myUid) !== String(activeChat.participantId)) {
      notifyMessageReceived(activeChat.participantId, Number(myUid), senderNameExtracted, currentAvatar, activeChatId);
    }
  };

  // ----- USER REPORTS AND BLOCKS -----

  const handleReportUserClick = (e: React.MouseEvent, pId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setReportModalData({ isOpen: true, userId: pId, reason: "" });
  };

  const handleReportSubmit = async () => {
    if (!reportModalData.userId || !reportModalData.reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    setIsReporting(true);
    try {
      await userService.reportUser({
        report_to_user_id: reportModalData.userId,
        reason: reportModalData.reason,
      });
      toast.success("User reported successfully");
      setReportModalData({ isOpen: false, userId: null, reason: "" });
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
      const chatIdToBlock = getChatId(pId);
      const chatRefObj = dbRef(db, `chats/${chatIdToBlock}`);
      await update(chatRefObj, {
        isBlocked: true,
        blockedBy: myUid,
      });
      toast.success("User blocked successfully");
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  const displayChats = searchQuery.trim() ? searchResults : recentChats;

  return (
    <div className="min-h-screen p-2 md:p-4 lg:p-8 mt-[60px]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <nav className="flex items-center text-sm font-medium" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link
                  href="/networking"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight className="mx-2 text-gray-400 group-hover:text-primary transition-colors duration-200" size={16} />
              </li>
              <li>
                <Link
                  href="/profile"
                  className="group flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-light-bg hover:to-light-bg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative">
                    Profile
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </li>
              <li>
                <FiChevronRight className="mx-2 text-gray-400" size={16} />
              </li>
              <li>
                <span className="flex items-center px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-purple-500 to-indigo-500 font-semibold shadow-sm border border-[#E5E3FF]">
                  <FiBriefcase className="mr-2" size={16} />
                  Messages
                </span>
              </li>
            </ol>
          </nav>
        </div>
        {/* 
        <div className="mb-8 items-center flex justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-Montserrat text-primary mb-2">
              Messages
            </h1>
            <p className="text-lg text-[#666] font-Montserrat">
              Connect and communicate with your professional network
            </p>
          </div>
        </div> */}

        {/* Unified Chat Box Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[650px] md:h-[650px]">
          <div className="flex h-full">
            {/* Conversations Sidebar List */}
            <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-[#E8E4FF] flex flex-col md:min-w-[300px] transition-all duration-300`}>
              <div className="p-4 border-b border-[#E8E4FF] bg-gray-50/50">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 placeholder-gray-400 bg-white text-gray-700 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {displayChats.map((chat) => {
                  const pId = chat.participantId || (chat.id.startsWith('chat_') ? (chat.id.split('_')[1] === myUid ? chat.id.split('_')[2] : chat.id.split('_')[1]) : chat.id);
                  const isUserOnline = !!globalProfiles[pId]?.is_online;
                  const displayName = chat.name && chat.name !== 'Unknown User' && chat.name !== 'User' ? chat.name : (globalProfiles[pId]?.name || 'Unknown User');
                  const displayAvatar = chat.avatar && chat.avatar !== '/images/user_profile_placeholder.jpeg' ? chat.avatar : (globalProfiles[pId]?.avatar || '/images/user_profile_placeholder.jpeg');

                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-purple-50/50 transition-colors duration-200 ${activeChat?.participantId === pId ? "bg-purple-50 border-l-4 border-l-purple-500" : ""
                        }`}
                    >
                      <div className="flex gap-3 relative">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full border border-gray-100 shadow-sm overflow-hidden">
                            <Image src={displayAvatar} alt={displayName} width={48} height={48} className="object-cover w-full h-full" />
                          </div>
                          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full`}></span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-gray-900 truncate pr-2 text-sm">{displayName}</h3>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">{formatChatTime(chat.timestamp) || chat.lastMessageTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs truncate ${(chat.unreadCount && chat.unreadCount > 0) ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                              {chat.lastMessage}
                            </p>
                            {chat.unreadCount ? (
                              <div className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Main Chat Interface */}
            <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col bg-white overflow-hidden relative transition-all duration-300`}>
              {activeChat ? (
                <>
                  <div className="p-4 border-b border-[#E8E4FF] flex justify-between items-center bg-white z-10">
                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-purple-600 transition-colors"
                      >
                        <FiChevronLeft size={24} />
                      </button>
                      <Link href={`/user/${activeChat.participantId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                            <Image src={activeChat.avatar} alt={activeChat.name} width={48} height={48} className="object-cover w-full h-full" />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full`}></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors">{activeChat.name}</h3>
                          <p className={`text-xs font-semibold ${isOnline ? "text-green-600" : "text-gray-500"}`}>
                            {isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </Link>
                    </div>
                    <div className="flex gap-2 items-center text-gray-500">
                      <button className="p-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors" onClick={() => setIsMeetingModalOpen(true)}>
                        <FiCalendar size={18} />
                      </button>
                      <div className="relative">
                        <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setOpenMenuId(openMenuId === activeChat.id ? null : activeChat.id)}>
                          <FiMoreVertical size={18} />
                        </button>
                        {openMenuId === activeChat.id && (
                          <div className="absolute right-0 top-12 bg-white border border-gray-100 shadow-2xl rounded-xl py-2 z-50 min-w-[160px]">
                            <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); activeChat.participantId && handleReportUserClick(e, activeChat.participantId); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                              Report User
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); activeChat.participantId && handleBlockUser(e, activeChat.participantId); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                              Block User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#f8f9fa] scrollbar-thin scroll-smooth">
                    {messages.map((msg, idx) => {
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const prevDate = prevMsg?.timestamp ? new Date(prevMsg.timestamp).toDateString() : null;
                      const currDate = msg.timestamp ? new Date(msg.timestamp).toDateString() : null;
                      const showDateSeparator = prevDate && currDate && prevDate !== currDate;
                      const dateLabel = msg.timestamp ? getDateLabel(msg.timestamp) : null;
                      return (
                        <React.Fragment key={msg.id}>
                          {(idx === 0 || showDateSeparator) && dateLabel && (
                            <div className="flex justify-center">
                              <span className="px-3 py-1 bg-white/80 backdrop-blur-sm text-[11px] font-semibold text-gray-500 rounded-full border border-gray-200/60 shadow-sm">
                                {dateLabel}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm flex flex-col ${msg.isOwn ? "bg-white text-purple-800 border-2 border-purple-50 shadow-md rounded-tr-sm" : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm"}`}>
                              {msg.mediaUrl && (
                                <div className="mb-2">
                                  {msg.mediaType === "image" ? (
                                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                                      <img src={msg.mediaUrl} alt="attachment" className="rounded-xl max-h-64 w-auto object-contain cursor-pointer border border-gray-100 shadow-sm" />
                                    </a>
                                  ) : (
                                    <video src={msg.mediaUrl} controls className="rounded-xl max-h-64 w-auto bg-black shadow-sm" />
                                  )}
                                </div>
                              )}
                              {msg.text && (
                                <p className={`whitespace-pre-wrap ${(() => {
                                  if (!msg.text) return false;
                                  const stripped = msg.text.replace(/[\s\n]/g, '');
                                  if (stripped.length === 0) return false;
                                  return /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(stripped);
                                })() ? 'text-4xl leading-normal py-1' : 'text-[15px] leading-relaxed'
                                  }`}>
                                  {msg.text}
                                </p>
                              )}
                              <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${msg.isOwn ? 'text-purple-400' : 'text-gray-400'}`}>
                                <p className="text-[10px] text-right font-medium">{msg.timestamp ? formatChatTime(msg.timestamp) : msg.time}</p>
                                {msg.isOwn && (
                                  <div className="flex -space-x-1.5 mb-[1px]">
                                    <FiCheck size={12} className={msg.isRead ? 'text-[#34B7F1]' : 'text-gray-300'} />
                                    <FiCheck size={12} className={msg.isRead ? 'text-[#34B7F1]' : 'text-gray-300'} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    {otherTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 text-gray-500 px-4 py-3 rounded-2xl text-xs rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {mediaPreview && (
                    <div className="px-5 pt-3 bg-white border-t border-gray-100 relative">
                      <div className="relative inline-block border-2 border-gray-100 rounded-xl p-1.5 bg-gray-50 shadow-sm">
                        {selectedMedia?.type.startsWith("video/") ? (
                          <video src={mediaPreview} className="h-24 rounded-lg object-cover" />
                        ) : (
                          <img src={mediaPreview} alt="preview" className="h-24 rounded-lg object-cover" />
                        )}
                        <button
                          onClick={() => { setSelectedMedia(null); setMediaPreview(null); }}
                          className="absolute -top-2.5 -right-2.5 bg-red-500 hover:bg-red-600 shadow-md text-white rounded-full p-1 transition-colors"
                          type="button"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {isBlocked ? (
                    <div className="p-6 bg-gray-50 text-center border-t border-gray-100 flex flex-col items-center justify-center">
                      <p className="text-sm font-semibold text-gray-500 mb-2">
                        {blockedBy === myUid ? "You have blocked this user." : "Messaging is unavailable."}
                      </p>
                      {blockedBy === myUid && (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to unblock this user?")) {
                              if (activeChatId) update(dbRef(db, `chats/${activeChatId}`), { isBlocked: false, blockedBy: null });
                            }
                          }}
                          className="text-sm font-bold text-purple-600 hover:underline px-3 py-1.5 rounded-lg border border-purple-200 bg-white shadow-sm"
                          type="button"
                        >
                          Unblock User
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 border-t border-[#E8E4FF] bg-white relative">
                      <div className="flex gap-2 items-end bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                        <button
                          className="p-3 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <FiSmile size={20} />
                        </button>
{/* 
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,video/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />

                        <button
                          className="p-3 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FiPaperclip size={20} />
                        </button> */}

                        <div className="flex-1 relative flex items-center">
                          <textarea
                            value={inputText}
                            onChange={(e) => {
                              setInputText(e.target.value);
                              if (myUid && activeChatId) {
                                const myTypingRef = dbRef(db, `chats/${activeChatId}/typing/${myUid}`);
                                set(myTypingRef, true);
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = setTimeout(() => {
                                  set(myTypingRef, false);
                                }, 1500);
                                onDisconnect(myTypingRef).set(false);
                              }
                            }}
                            placeholder="Type your message"
                            className="w-full bg-transparent text-sm text-gray-800 resize-none px-3 py-3 max-h-32 min-h-[44px]"
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={isUploading}
                          />
                        </div>

                        <button
                          className={`p-3.5 rounded-xl flex items-center justify-center transition-all transform ${((inputText.trim() || selectedMedia) && !isUploading) ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:scale-105' : 'bg-gray-200 text-gray-400'}`}
                          onClick={handleSendMessage}
                          disabled={(!inputText.trim() && !selectedMedia) || isUploading}
                        >
                          {isUploading ? <Loader2 size={18} className="animate-spin text-white" /> : <FiSend size={18} className="ml-0.5" />}
                        </button>
                      </div>

                      {showEmojiPicker && (
                        <div ref={emojiPickerRef} className="absolute bottom-24 left-4 z-50 drop-shadow-2xl shadow-black shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme={Theme.LIGHT}
                            height={350}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                  <div className="text-center animate-fadeIn">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-300 to-purple-400 text-white flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
                      <FiMessageCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 font-Montserrat tracking-tight">
                      Your Messages
                    </h3>
                    <p className="text-gray-500 font-medium">
                      Select a conversation on the left to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {reportModalData.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-black">
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

      {/* Meeting Modal */}
      {activeChat && (
        <MeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          initialCandidateName={activeChat.name}
          initialCandidateId={activeChat.participantId ? Number(activeChat.participantId) : null}
          mode={user?.user_type === 'employer' ? 'employer' : 'networking'}
        />
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading messages...</span>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
