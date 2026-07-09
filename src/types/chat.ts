export interface Chat {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
  isRead?: boolean;
}

export interface ActionButton {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface SearchFilter {
  label: string;
  placeholder: string;
  type?: 'text' | 'select' | 'date';
  options?: string[];
} 