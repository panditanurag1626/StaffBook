'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiMinus, FiSend } from 'react-icons/fi';
import MessageIcon from '@/components/icons/MessageIcon';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const initialBotMessages = [
  "Hello! I'm your StaffBook AI assistant. How can I help you today?",
  "I can help you with job searches, resume tips, networking advice, and more!",
  "Feel free to ask me anything about career development or job hunting."
];

import { THEME } from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';


export default function ChatbotWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with bot greeting when opened for the first time
  useEffect(() => {
    if (open && messages.length === 0) {
      const botGreeting: ChatMessage = {
        id: Date.now().toString(),
        text: initialBotMessages[0],
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([botGreeting]);
    }
  }, [open, messages.length]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('job') || input.includes('career')) {
      return "I can help you find jobs that match your skills! Try using our job search feature or check out recommended positions in your profile.";
    } else if (input.includes('resume') || input.includes('cv')) {
      return "For resume tips, make sure your profile is complete and highlight your key achievements. You can also upload your resume in the profile section!";
    } else if (input.includes('network') || input.includes('connect')) {
      return "Networking is key! Check out the networking section to connect with professionals in your field and expand your opportunities.";
    } else if (input.includes('help')) {
      return "I'm here to assist with job searches, resume advice, networking tips, and career guidance. What would you like to know more about?";
    } else {
      return "That's an interesting question! I'm still learning, but I can help you with job searches, resume tips, and networking advice. What would you like to explore?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (['/signin', '/signup'].includes(pathname)) return null;
  if (!user) return null;

  return (
    <div className={`fixed bottom-20 md:bottom-6 right-6 ${open ? 'z-[70]' : 'z-50'}`}>
      {/* Chatbot Toggle Button - Only when widget is closed */}
      {!open && (
        // <div className="flex flex-col items-end gap-1">
        //   {/* Speech Bubble with Text */}
        //   <div className="relative">
        //     <div className="bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-2xl rounded-br-none shadow-lg border-2 border-purple-300/30 relative">
        //       <p className="text-[10px] font-semibold text-gray-900 whitespace-nowrap">
        //         How may I help?
        //       </p>
        //       {/* Speech bubble tail pointing down */}
        //       <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white/60 backdrop-blur-md border-r-2 border-b-2 border-purple-300/30 transform rotate-45"></div>
        //     </div>
        //   </div>

        //   {/* Chatbot Icon Button */}
        //   <button
        //     aria-label="Open chatbot"
        //     className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl bg-gradient-to-br from-purple-600/70 to-indigo-600/70 backdrop-blur-xl text-white hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center overflow-hidden border-2 border-white/30 ring-1 ring-white/20`}
        //     onClick={() => setOpen(true)}
        //   >
        //     <img src="/images/3d-cartoon-style-character.png" alt="Chat" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
        //   </button>
        // </div>
        <button
          aria-label="Open chatbot"
          className="relative cursor-pointer w-15 h-15 rounded-full hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center overflow-hidden"
          onClick={() => setOpen(true)}
        >
          <img src="/images/chatbot-icon.jpeg" alt="Chat" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* Widget Panel */}
      {open && (
        <div ref={widgetRef} className="w-[90vw] md:w-[320px] bg-white rounded-xl overflow-hidden flex flex-col shadow-lg border border-gray-200 transform transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="px-6 py-4 bg-purple-700">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  <img src="/images/3d-cartoon-style-character.png" alt="AI Agent" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">AI Assistant</h3>
                  <p className="text-xs text-white/90">Online & Ready to Help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  onClick={() => setMinimized(m => !m)}
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          {!minimized ? (
            <div className="flex flex-col h-[350px] md:h-[400px] bg-gray-50">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-5 py-3.5 rounded-2xl shadow-sm relative ${message.sender === 'user'
                        ? 'bg-purple-700 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                        }`}
                    >
                      <p className="text-xs leading-relaxed font-medium">{message.text}</p>
                      <div className={`flex items-center gap-1 mt-1.5 ${message.sender === 'user' ? 'justify-end text-white/70' : 'justify-start text-gray-400'
                        }`}>
                        <span className="text-[10px] font-medium">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1.5 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-transparent border-none focus:outline-none text-xs text-gray-700 placeholder-gray-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-3 rounded-full bg-purple-700 text-white hover:bg-purple-800 transition-colors disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 text-sm font-medium text-gray-500 bg-white border-t border-gray-200 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Chat minimized
            </div>
          )}
        </div>
      )}
    </div>
  );
}
