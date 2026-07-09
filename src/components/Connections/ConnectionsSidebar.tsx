'use client';
import React from 'react';
import Image from 'next/image';
import { FiChevronRight, FiUserPlus, FiMail, FiFileText, FiSettings, FiSliders } from 'react-icons/fi';
import Button from '../shared/Button';
import ConnectButton from '../shared/ConnectButton';

const ConnectionsSidebar: React.FC = () => {

  const recentActivity = [
    {
      name: 'Priya Sharma',
      avatar: '/images/user_profile_placeholder.jpeg',
      action: 'Started following you',
      time: '2h ago',
    },
    {
      name: 'Amit Kumar',
      avatar: '/images/user_profile_placeholder.jpeg',
      action: 'Accepted your invitation',
      time: '5h ago',
    },
    {
      name: 'Neha Patel',
      avatar: '/images/user_profile_placeholder.jpeg',
      action: 'Viewed your profile',
      time: '1d ago',
    },
  ];

  const popularPages = [
    {
      id: '1',
      name: 'Google',
      logo: '/homePage/google-logo.png',
      followers: '25M',
      category: 'Internet Company',
    },
    {
      id: '2',
      name: 'Microsoft',
      logo: '/homePage/logo1.png',
      followers: '18M',
      category: 'Technology',
    },
    {
      id: '3',
      name: 'Amazon',
      logo: '/homePage/logo1.png',
      followers: '22M',
      category: 'E-commerce',
    },
    {
      id: '4',
      name: 'Meta',
      logo: '/homePage/logo1.png',
      followers: '15M',
      category: 'Social Media',
    },
    {
      id: '5',
      name: 'Apple',
      logo: '/homePage/logo1.png',
      followers: '20M',
      category: 'Consumer Electronics',
    },
  ];

  const connectionsList = [
    {
      id: '1',
      name: 'Riya Goyal',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'HR Manager at appxone.com',
      mutualConnections: 45,
    },
    {
      id: '2',
      name: 'Amit Kumar',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Software Engineer at Tech Solutions',
      mutualConnections: 23,
    },
    {
      id: '3',
      name: 'Neha Patel',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Marketing Director at Digital World',
      mutualConnections: 67,
    },
    {
      id: '4',
      name: 'Karan Malhotra',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Product Designer at Creative Studios',
      mutualConnections: 34,
    },
    {
      id: '5',
      name: 'Pooja Reddy',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Business Analyst at Finance Corp',
      mutualConnections: 28,
    },
  ];

  const suggestedConnections = [
    {
      id: '1',
      name: 'Sneha Gupta',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Frontend Developer at Web Innovations',
      mutualConnections: 18,
      company: 'Web Innovations',
    },
    {
      id: '2',
      name: 'Rohit Sharma',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Sales Manager at Global Trade',
      mutualConnections: 9,
      company: 'Global Trade',
    },
    {
      id: '3',
      name: 'Divya Iyer',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Content Writer at Creative Content',
      mutualConnections: 14,
      company: 'Creative Content',
    },
    {
      id: '4',
      name: 'Manish Tiwari',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Backend Developer at Tech Giants',
      mutualConnections: 22,
      company: 'Tech Giants',
    },
    {
      id: '5',
      name: 'Kavya Reddy',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'HR Specialist at People First',
      mutualConnections: 11,
      company: 'People First',
    },
    {
      id: '6',
      name: 'Sanjay Pillai',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Project Manager at Agile Solutions',
      mutualConnections: 16,
      company: 'Agile Solutions',
    },
    {
      id: '7',
      name: 'Meera Krishnan',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Engineering Manager at Tech Startups',
      mutualConnections: 7,
      company: 'Tech Startups Inc',
    },
    {
      id: '8',
      name: 'Aditya Joshi',
      avatar: '/images/user_profile_placeholder.jpeg',
      title: 'Product Owner at Innovation Labs',
      mutualConnections: 13,
      company: 'Innovation Labs',
    },
  ];

  // Randomly shuffle and pick items
  const getRandomItems = <T,>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomPages = React.useMemo(() => getRandomItems(popularPages, 3), []);
  const randomConnections = React.useMemo(() => getRandomItems(connectionsList, 4), []);
  const randomSuggestions = React.useMemo(() => getRandomItems(suggestedConnections, 5), []);

  const [connectedIds, setConnectedIds] = React.useState<string[]>([]);

  const handleConnect = (id: string) => {
    setConnectedIds([...connectedIds, id]);
  };

  return (
    <div className="space-y-4">

      {/* Recent Activity Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-4 space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <Image
                src={activity.avatar}
                alt={activity.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.name}</span>
                </p>
                <p className="text-xs text-gray-600">{activity.action}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-center text-sm text-primary font-medium hover:text-primary pt-2 hover:bg-light-bg">
            View all activity →
          </Button>
        </div>
      </div>

      {/* Popular Pages */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Popular Pages</h3>
        </div>
        <div className="p-4 space-y-4">
          {randomPages.map((page) => (
            <div key={page.id} className="flex items-start gap-3">
              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Image
                  src={page.logo}
                  alt={page.name}
                  width={48}
                  height={48}
                  style={{ width: 'auto', height: 'auto' }}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900">{page.name}</h4>
                <p className="text-xs text-gray-600 mb-1">{page.category}</p>
                <p className="text-xs text-gray-500">{page.followers} followers</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors h-auto"
              >
                Follow
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-center text-sm text-primary font-medium hover:text-primary pt-2 hover:bg-light-bg">
            Show more →
          </Button>
        </div>
      </div>

      {/* Your Connections */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Your Connections</h3>
          <span className="text-xs text-gray-500">250+</span>
        </div>
        <div className="p-4 space-y-4">
          {randomConnections.map((connection) => (
            <div key={connection.id} className="flex items-start gap-3">
              <Image
                src={connection.avatar}
                alt={connection.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900">{connection.name}</h4>
                <p className="text-xs text-gray-600 line-clamp-1">{connection.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {connection.mutualConnections} mutual connections
                </p>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-center text-sm text-primary font-medium hover:text-primary pt-2 hover:bg-light-bg">
            View all connections →
          </Button>
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">People You May Know</h3>
        </div>
        <div className="p-4 space-y-4">
          {randomSuggestions.map((person) => (
            <div key={person.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <Image
                src={person.avatar}
                alt={person.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">{person.name}</h4>
                <p className="text-xs text-gray-600 line-clamp-2 mb-1">{person.title}</p>
                <p className="text-xs text-gray-500 mb-2">
                  {person.mutualConnections} mutual connections
                </p>
                {connectedIds.includes(person.id) ? (
                  <Button
                    disabled
                    variant="ghost"
                    className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium cursor-not-allowed h-auto"
                  >
                    ✓ Pending
                  </Button>
                ) : (
                  <ConnectButton
                    onClick={() => handleConnect(person.id)}
                    variant="outline"
                    className="px-4 py-1.5 h-auto text-xs shadow-none hover:shadow-sm"
                    icon={<FiUserPlus className="w-3 h-3" />}
                  />
                )}
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-center text-sm text-primary font-medium hover:text-primary pt-2 hover:bg-light-bg">
            Show all recommendations →
          </Button>
        </div>
      </div>

      {/* Ad Space / Premium Suggestion */}
      <div className="bg-gradient-to-br from-primary to-gradient-end rounded-lg p-6 text-white">
        <h3 className="font-semibold mb-2">Unlock Premium Features</h3>
        <p className="text-sm text-white/90 mb-4">
          See who viewed your profile and get unlimited browsing
        </p>
        <Button className="w-full bg-white text-primary py-2 px-4 rounded-lg text-sm font-semibold hover:bg-light-bg transition-colors border-none">
          Try Premium Free
        </Button>
      </div>
    </div>
  );
};

export default ConnectionsSidebar;

