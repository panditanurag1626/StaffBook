'use client';

import React, { useState } from 'react';
import ProfileLayout from '../../components/shared/ProfileLayout';
import { FiUser, FiBriefcase, FiMessageCircle, FiBookmark, FiMail, FiDollarSign, FiPhone, FiPaperclip, FiMic } from 'react-icons/fi';
import { mockChats, mockMessages } from '../../data/chats';
import type { Chat, Message, ActionButton, SearchFilter } from '../../types/chat';

const LiveChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [message, setMessage] = useState('');

  const actionButtons: ActionButton[] = [
    { icon: <FiUser className="w-5 h-5" />, label: 'Hire' },
    { icon: <FiBriefcase className="w-5 h-5" />, label: 'Get Hired' },
    { icon: <FiMessageCircle className="w-5 h-5" />, label: 'Live Chat' },
    { icon: <FiBookmark className="w-5 h-5" />, label: 'Saved Jobs' },
    { icon: <FiMail className="w-5 h-5" />, label: 'Subscribe' },
    { icon: <FiDollarSign className="w-5 h-5" />, label: 'Ads' },
  ];

  const searchFilters: SearchFilter[] = [
    { label: 'Job Title/Role', placeholder: 'Enter preferred Role' },
    { label: 'Skills', placeholder: 'Enter preferred Role' },
    { label: 'Experience', placeholder: 'Enter preferred Role' },
    { label: 'Company', placeholder: 'Enter preferred Role' },
    { label: 'Location', placeholder: 'Enter preferred Role' },
    { label: 'Date Posted', placeholder: 'Enter preferred Role' },
  ];

  const chats = mockChats;
  const messages = mockMessages[selectedChat] || [];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <ProfileLayout>
      <div className="mx-auto ">
        {/* Chat Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row h-[600px]">
            {/* Chat List */}
            <div className="w-full lg:w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Chats</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Chats..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B8DF2] focus:border-transparent"
                  />
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
                             <div className="flex-1 overflow-y-auto">
                 {chats.map((chat) => (
                   <div
                     key={chat.id}
                     onClick={() => setSelectedChat(chat.id)}
                     className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                       selectedChat === chat.id ? 'bg-[#F3EFFF] border-r-2 border-primary' : ''
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <img
                         src={chat.avatar}
                         alt={chat.name}
                         className="w-12 h-12 rounded-full object-cover"
                       />
                       <div>
                         <h3 className="font-medium text-gray-900">{chat.name}</h3>
                         <p className="text-sm text-gray-500">{chat.role}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={chats.find(chat => chat.id === selectedChat)?.avatar}
                    alt={chats.find(chat => chat.id === selectedChat)?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{chats.find(chat => chat.id === selectedChat)?.name}</h3>
                    <p className="text-sm text-gray-500">{chats.find(chat => chat.id === selectedChat)?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiPhone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiMessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isOwn
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${
                        msg.isOwn ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs opacity-70">{msg.time}</span>
                        {msg.isOwn && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message"
                      className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B8DF2] focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                        <FiPaperclip className="w-5 h-5" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                        <FiMic className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-gradient-end text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </ProfileLayout>
  );
};

export default LiveChatPage; 