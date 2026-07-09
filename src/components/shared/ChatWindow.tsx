'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiMinus, FiSend, FiCalendar, FiCheck, FiSmile, FiPaperclip } from 'react-icons/fi';
import { Chat } from '@/data/chats';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import { ref as dbRef, onValue, push, set, serverTimestamp, update, increment, onDisconnect } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { Loader2 } from 'lucide-react';
import MeetingModal from '@/components/shared/MeetingModal';
import { notifyMessageReceived } from '@/lib/firebaseNotifications';
import toast from 'react-hot-toast';

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
  mediaType?: 'image' | 'video';
}

interface ChatWindowProps {
  chat: Chat & { participantId?: string }; // participantId here is their true UID
  myUid: string;
  onClose: () => void;
  isActiveChats: boolean;
}

export default function ChatWindow({ chat, myUid, onClose, isActiveChats }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chat.participantId) {
      const onlineRef = dbRef(db, `users/${chat.participantId}/is_online`);
      const unsub = onValue(onlineRef, (snapshot) => {
        setIsOnline(!!snapshot.val());
      });
      return () => unsub();
    }
  }, [chat.participantId]);

  useEffect(() => {
    if (!chat.id) return;
    const blockRef = dbRef(db, `chats/${chat.id}`);
    const unsub = onValue(blockRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        setIsBlocked(!!chatData.isBlocked);
        setBlockedBy(chatData.blockedBy || null);
      }
    });
    return () => unsub();
  }, [chat.id]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized, otherTyping]);

  useEffect(() => {
    if (!chat.id || !myUid) return;

    const messagesRef = dbRef(db, `chats/${chat.id}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgsData = snapshot.val();
        const msgsList: ChatMessage[] = Object.keys(msgsData).map(key => {
          const msg = msgsData[key];

          // If this message belongs to the other person and it's unread, mark it as read!
          // ONLY IF the window is not minimized currently.
          if (msg.senderUid !== myUid && !msg.isRead && !isMinimized) {
            update(dbRef(db, `chats/${chat.id}/messages/${key}`), { isRead: true }).catch(() => { });
          }

          return {
            id: key,
            sender: msg.senderName || 'User',
            senderUid: msg.senderUid,
            text: msg.text || '',
            time: msg.time || '',
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

    // Clear unread count when window opens or new message is received
    // ONLY IF the window is maximized.
    if (!isMinimized || isActiveChats) {
      const userChatRef = dbRef(db, `users/${myUid}/chats/${chat.id}`);
      update(userChatRef, { unreadCount: 0 }).catch(() => { });
    }

    // Listen for typing indicator
    if (chat.participantId) {
      const typingRef = dbRef(db, `chats/${chat.id}/typing/${chat.participantId}`);
      onValue(typingRef, (snapshot) => {
        setOtherTyping(!!snapshot.val());
      });
    }

    return () => unsubscribe();
  }, [chat.id, myUid, chat.participantId, isMinimized, isActiveChats, chat.lastMessage]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedMedia) || !myUid || !chat.participantId || !user) return;

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
        const fileExt = selectedMedia.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const imgReference = storageRef(storage, `chat_media/${myUid}/${fileName}`);
        await uploadBytes(imgReference, selectedMedia);
        uploadedMediaUrl = await getDownloadURL(imgReference);
        uploadedMediaType = selectedMedia.type.startsWith('image/') ? 'image' : 'video';
      } catch (err) {
        console.error("Failed to upload media:", err);
      }
    }

    const text = inputText.trim();
    setInputText('');
    setSelectedMedia(null);
    setMediaPreview(null);
    setShowEmojiPicker(false);
    setIsUploading(false);

    // Play a tick sound immediately
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const t = audioCtx.currentTime;
        oscillator.type = 'sine';

        // A sharper, quicker frequency drop for that clicking bubble pop
        oscillator.frequency.setValueAtTime(2000, t);
        oscillator.frequency.exponentialRampToValueAtTime(1000, t + 0.01);

        // Instant sharp attack, very quick decay
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.5, t + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        oscillator.start(t);
        oscillator.stop(t + 0.05);
      }
    } catch (e) {
      console.error("Audio play failed:", e);
    }

    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeString = `${hours}:${minutes} ${ampm}`;

    // Clear my typing indicator when sending
    const myTypingRef = dbRef(db, `chats/${chat.id}/typing/${myUid}`);
    set(myTypingRef, false);

    // Push new message
    const senderNameExtracted = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'User';

    const newMsgRef = push(dbRef(db, `chats/${chat.id}/messages`));
    const msgPayload: any = {
      senderUid: myUid,
      senderName: senderNameExtracted,
      text,
      time: timeString,
      timestamp: serverTimestamp(),
      isRead: false
    };

    if (uploadedMediaUrl) {
      msgPayload.mediaUrl = uploadedMediaUrl;
      msgPayload.mediaType = uploadedMediaType;
    }

    await set(newMsgRef, msgPayload);

    const lastMsgDisplay = uploadedMediaType === 'image' ? '📷 Image' : (uploadedMediaType === 'video' ? '🎥 Video' : text);

    // Update chats for Current User strictly in users node
    await update(dbRef(db, `users/${myUid}/chats/${chat.id}`), {
      participantId: chat.participantId, // other user's uid
      participantName: chat.name,
      participantAvatar: chat.avatar,
      lastMessage: lastMsgDisplay,
      lastMessageTime: timeString,
      timestamp: serverTimestamp(),
      // Unread count is reset above
    });

    // Check if the recipient currently has 0 unread messages from us, prior to this send
    // We check via the prop. If they have 0 unread messages stored in OUR local view of their chat, wait, we don't know their unread count.
    
    // Update chats for Receiver strictly in users node
    const currentAvatar = user.picture || '/images/user_profile_placeholder.jpeg';

    await update(dbRef(db, `users/${chat.participantId}/chats/${chat.id}`), {
      participantId: myUid,
      participantName: senderNameExtracted,
      participantAvatar: currentAvatar,
      lastMessage: lastMsgDisplay,
      lastMessageTime: timeString,
      timestamp: serverTimestamp(),
      unreadCount: increment(1)
    });

    if (myUid && chat.participantId && String(myUid) !== String(chat.participantId)) {
      notifyMessageReceived(chat.participantId, Number(myUid), senderNameExtracted, currentAvatar, chat.id);
    }
  };

  if (isMinimized) {
    return (
      <div className={`bg-white border border-gray-200 border-b-0 rounded-t-xl shadow-lg flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 ${isMobile ? 'w-full' : 'w-64'
        }`} onClick={() => setIsMinimized(false)}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image src={chat.avatar} alt={chat.name} width={24} height={24} className="rounded-full object-cover" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border border-white rounded-full`}></span>
          </div>
          <span className="text-xs font-bold text-gray-800 truncate">{chat.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <FiX size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 border-b-0 rounded-t-xl shadow-xl flex flex-col relative ${isMobile ? 'w-full h-[70vh] max-h-[600px]' : 'w-80 h-[450px]'
      }`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-shrink-0">
            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center'>
              <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="rounded-full object-cover h-full w-full" />
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full`}></span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate leading-tight">{chat.name}</p>
            <p className={`text-[10px] font-medium ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-gray-400">
          <button
            className="p-1.5 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors"
            onClick={() => setIsMeetingModalOpen(true)}
          >
            <FiCalendar size={14} />
          </button>
          {!isMobile && (
            <button className="p-1.5 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors" onClick={() => setIsMinimized(true)}>
              <FiMinus size={14} />
            </button>
          )}
          <button className="p-1.5 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors" onClick={onClose}>
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f9fa]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs flex flex-col ${msg.isOwn
              ? 'bg-white text-purple-700 border border-purple-100 shadow-sm rounded-tr-none'
              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
              }`}>
              {msg.mediaUrl && (
                <div className="mb-1.5">
                  {msg.mediaType === 'image' ? (
                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                      <img src={msg.mediaUrl} alt="attachment" className="rounded-lg max-h-48 w-auto object-contain cursor-pointer border border-gray-100 shadow-sm" />
                    </a>
                  ) : (
                    <video src={msg.mediaUrl} controls className="rounded-lg max-h-48 w-auto bg-black shadow-sm" />
                  )}
                </div>
              )}
              {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
              <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isOwn ? 'text-purple-400' : 'text-gray-400'}`}>
                <p className="text-[9px] text-right">
                  {msg.time}
                </p>
                {msg.isOwn && (
                  <div className="flex -space-x-1 mb-[1px]">
                    <FiCheck size={10} className={msg.isRead ? 'text-[#34B7F1]' : 'text-gray-400'} />
                    <FiCheck size={10} className={msg.isRead ? 'text-[#34B7F1]' : 'text-gray-400'} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl text-xs rounded-tl-none flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview before send */}
      {mediaPreview && (
        <div className="px-3 pt-2 bg-white border-t border-gray-100 relative">
          <div className="relative inline-block border rounded-md p-1 bg-gray-50">
            {selectedMedia?.type.startsWith('video/') ? (
              <video src={mediaPreview} className="h-16 rounded object-cover" />
            ) : (
              <img src={mediaPreview} alt="preview" className="h-16 rounded object-cover" />
            )}
            <button
              onClick={() => { setSelectedMedia(null); setMediaPreview(null); }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 shadow-sm text-white rounded-full p-0.5 transition-colors"
              type="button"
            >
              <FiX size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {isBlocked ? (
        <div className="p-4 bg-gray-50 text-center border-t border-gray-100 rounded-b-xl flex flex-col items-center justify-center min-h-[56px]">
           <p className="text-xs font-semibold text-gray-500 mb-1">
             {blockedBy === myUid ? "You have blocked this user." : "Messaging is unavailable."}
           </p>
           {blockedBy === myUid && (
             <button
               onClick={() => {
                 if (window.confirm("Are you sure you want to unblock this user?")) {
                   update(dbRef(db, `chats/${chat.id}`), { isBlocked: false, blockedBy: null });
                 }
               }}
               className="text-xs font-bold text-purple-600 hover:underline px-2 py-1 rounded"
               type="button"
             >
               Unblock
             </button>
           )}
        </div>
      ) : (
      <form onSubmit={handleSendMessage} className="p-2 bg-white relative">
        <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-1.5 border border-gray-100 focus-within:ring-1 focus-within:ring-purple-200 focus-within:border-purple-200 transition-all">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-purple-600 p-1 rounded-lg transition-colors"
          >
            <FiSmile size={18} />
          </button>
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-purple-600 p-1 rounded-lg transition-colors"
          >
            <FiPaperclip size={18} />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (myUid && chat.id) {
                const myTypingRef = dbRef(db, `chats/${chat.id}/typing/${myUid}`);
                set(myTypingRef, true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                  set(myTypingRef, false);
                }, 1500);
                onDisconnect(myTypingRef).set(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-gray-700 resize-none max-h-20 min-h-[24px] py-1.5 px-2"
            rows={1}
            disabled={isUploading}
          />

          <button
            type="submit"
            disabled={(inputText.trim() === '' && !selectedMedia) || isUploading}
            className={`p-1.5 rounded-lg transition-colors ${(inputText.trim() || selectedMedia) && !isUploading
              ? 'text-purple-600 hover:bg-purple-50'
              : 'text-gray-300'
              }`}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin text-purple-600" /> : <FiSend size={16} />}
          </button>
        </div>

        {/* Emoji Picker Dropdown */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-16 left-0 z-50 drop-shadow-xl" style={{ width: '100%' }}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.LIGHT}
              searchDisabled={true}
              skinTonesDisabled={true}
              width="100%"
              height={300}
            />
          </div>
        )}
      </form>
      )}

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        initialCandidateName={chat.name}
        initialCandidateId={chat.participantId ? Number(chat.participantId) : null}
        mode={user?.user_type === 'employer' ? 'employer' : 'networking'}
      />
    </div>
  );
}
