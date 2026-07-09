import React from 'react';
import { FiX, FiBriefcase, FiUser } from 'react-icons/fi';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"
          >
            <FiX size={20} />
          </button>

          <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-br from-purple-50 to-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Sign In or Sign Up
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              Join StaffBook to access jobs, networking, and connections.
            </p>
          </div>

          <div className="p-8">
            <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
              What do you want to do?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/signup?role=seeker"
                onClick={onClose}
                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 hover:border-purple-600 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-purple-100 group-hover:bg-purple-600 text-purple-600 group-hover:text-white rounded-full flex items-center justify-center transition-colors mb-4">
                  <FiUser size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">I want a job</h4>
                <p className="text-xs text-gray-500 mt-1 font-medium text-center">Find the best opportunities</p>
              </Link>

              <Link 
                href="/signup?role=employer"
                onClick={onClose}
                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 hover:border-purple-600 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-full flex items-center justify-center transition-colors mb-4">
                  <FiBriefcase size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">I want to hire</h4>
                <p className="text-xs text-gray-500 mt-1 font-medium text-center">Find the top talent</p>
              </Link>
            </div>

            <div className="mt-8 text-center bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-600 font-medium">
                Already have an account?{' '}
                <Link href="/signin" onClick={onClose} className="text-purple-700 font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
