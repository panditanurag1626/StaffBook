'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FiImage, FiVideo, FiX, FiCamera, FiEdit3, FiFilm } from 'react-icons/fi';
import { THEME } from '../../../styles/theme';
import { createPost } from '@/lib/api/services/postService';
import { sendNotificationToConnections } from '@/lib/firebaseNotifications';
import { useAuth } from '@/context/AuthContext';
import Modal from '../../shared/Modal';
import ReelUploadModal from '../ReelUploadModal';
import StoryUploadModal from '../StoryUploadModal';
import toast from 'react-hot-toast';
import { compressImage } from '@/lib/utils';
import CameraModal from '../../shared/CameraModal';

interface CreatePostWidgetProps {
  onPostCreated?: () => void;
}

const CreatePostWidget: React.FC<CreatePostWidgetProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReelUploadModal, setShowReelUploadModal] = useState(false);
  const [showStoryUploadModal, setShowStoryUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
        const limitLabel = isVideo ? '50MB' : '20MB';

        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds the ${limitLabel} size limit`);
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
      // Reset input value so selecting the same file triggers onChange
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* New state to track post mode */
  const [postMode, setPostMode] = useState<'post' | 'blog'>('post');

  const openModal = (mode: 'post' | 'blog') => {
    setPostMode(mode);
    setIsModalOpen(true);
  };

  const handlePost = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;

    try {
      setIsSubmitting(true);
      
      // Perform image compression before uploading
      const processedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          if (file.type.startsWith('image/') && file.size > 1 * 1024 * 1024) {
            return await compressImage(file);
          }
          return file;
        })
      );

      const htmlContent = content.trim().replace(/\n/g, '<br />');
      const res = await createPost({
        content: htmlContent,
        media: processedFiles.length > 0 ? processedFiles : undefined,
        visibility: 'public'
      });

      if (user) {
        await sendNotificationToConnections(
          user.id,
          `${user.first_name} ${user.last_name}`,
          user.picture || '',
          'post',
          res?.data?.id || Date.now() // assuming post id is in response, or fallback
        );
      }

      // Cleanup and close
      setContent('');
      setSelectedFiles([]);
      setIsModalOpen(false);

      // Refresh feed
      if (onPostCreated) onPostCreated();

    } catch (err: any) {
      console.error('Failed to post', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userImage = user?.picture || "/images/user_profile_placeholder.jpeg";
  const userName = user ? `${user.first_name} ${user.last_name}` : "User";

  return (
    <>
      {/* Trigger Widget - Collapsed View (LinkedIn Style) */}
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4`}>
        <div className="flex gap-3">
          <Image
            src={userImage}
            alt="Profile"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
          <button
            onClick={() => openModal('blog')}
            className="flex-1 text-left px-5 py-3 bg-white border border-gray-300 rounded-[35px] hover:bg-gray-100 transition-colors text-gray-500 text-sm"
          >
            Start a post
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2">
          <button
            onClick={() => openModal('post')}
            className="flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <FiImage className="w-5 h-5 text-gray-600 group-hover:text-black" />
            <span className="text-sm font-semibold text-gray-700">Upload Post</span>
          </button>
          <button
            onClick={() => setShowReelUploadModal(true)}
            className="flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <FiFilm className="w-5 h-5 text-gray-600 group-hover:text-black" />
            <span className="text-sm font-semibold text-gray-700">Reel</span>
          </button>
          <button
            onClick={() => setShowStoryUploadModal(true)}
            className="flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <FiVideo className="w-5 h-5 text-gray-600 group-hover:text-black" />
            <span className="text-sm font-semibold text-gray-700">Story</span>
          </button>
        </div>
      </div>

      <ReelUploadModal
        isOpen={showReelUploadModal}
        onClose={() => setShowReelUploadModal(false)}
        onSuccess={() => {
          setShowReelUploadModal(false)
        }}
      />
      <StoryUploadModal
        isOpen={showStoryUploadModal}
        onClose={() => setShowStoryUploadModal(false)}
        onSuccess={() => {
          setShowStoryUploadModal(false)
        }}
      />

      <CameraModal 
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(file) => {
          setSelectedFiles(prev => [...prev, file]);
          setShowCameraModal(false);
        }}
      />

      {/* Main Creation Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-[90vw] md:w-[600px] flex flex-col bg-white rounded-xl h-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50">
            <h2 className="text-xl font-medium text-gray-900">
              {postMode === 'blog' ? 'Write a Post' : 'Create a post'}
            </h2>

          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* User Info & Visibility */}
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={userImage}
                alt={userName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900 text-lg leading-tight">{userName}</span>

              </div>
            </div>

            {/* Content Area */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full min-h-[150px] text-lg text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
              autoFocus
            />

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                      {file.type.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiVideo className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Toolbar */}
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              {postMode !== 'blog' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative"
                    title="Add media"
                  >
                    <FiImage size={24} />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </button>
                  <button
                    onClick={() => setShowCameraModal(true)}
                    className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    title="Use camera"
                  >
                    <FiCamera size={24} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePost}
                disabled={!content.trim() && selectedFiles.length === 0 || isSubmitting}
                className={`px-6 py-1.5 rounded-full font-semibold text-white transition-all ${content.trim() || selectedFiles.length > 0
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreatePostWidget;
