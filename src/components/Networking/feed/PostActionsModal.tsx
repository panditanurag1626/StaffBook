import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiEdit, FiShare, FiBell, FiTrash2, FiFlag } from 'react-icons/fi';
import { SITE_CONFIG } from '../../../constants/siteconfig';
import { deletePost, updatePost, reportPost } from '../../../lib/api/services/postService';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface PostActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  authorId: string;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onPostUpdate?: () => void;
  initialContent?: string;
}

const PostActionsModal: React.FC<PostActionsModalProps> = ({ isOpen, onClose, postId, authorId, buttonRef, onPostUpdate, initialContent = "" }) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
   const [isReporting, setIsReporting] = useState(false);
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isAuthor = user && (String(user.id) === String(authorId));

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 5,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen, buttonRef]);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newTitle, setNewTitle] = useState(initialContent.replace(/<br\s*\/?>/gi, '\n'));
  const [reportReason, setReportReason] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setNewTitle(initialContent.replace(/<br\s*\/?>/gi, '\n'));
    }
  }, [isOpen, initialContent]);

  const handleAction = async (action: string) => {
    if (action === 'delete') {
      setShowDeleteDialog(true);
    } else if (action === 'report') {
      setShowReportDialog(true);
    } else if (action === 'edit') {
      setShowEditDialog(true);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await deletePost(parseInt(postId));
      setShowDeleteDialog(false);
      onClose();
      if (onPostUpdate) onPostUpdate();
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportPost = async () => {
    if (!reportReason.trim()) return;
    setIsReporting(true);
    try {
      await reportPost({ post_id: parseInt(postId), reason: reportReason });
      setShowReportDialog(false);
      setReportReason("");
      toast.success("Post has been reported successfully");
      onClose();
    } catch (error) {
      console.error("Failed to report post:", error);
      toast.error("Failed to report post");
    } finally {
      setIsReporting(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!newTitle.trim()) return;
    setIsUpdating(true);
    try {
      const htmlContent = newTitle.trim().replace(/\n/g, '<br />');
      await updatePost({ id: parseInt(postId), title: htmlContent });
      setShowEditDialog(false);
      setNewTitle("");
      onClose();
      if (onPostUpdate) onPostUpdate();
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen && !showEditDialog && !showReportDialog && !showDeleteDialog) return null;
  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      {(isOpen || showEditDialog || showReportDialog || showDeleteDialog) && (
        <div
          className={`fixed inset-0 z-[9998] ${showEditDialog || showReportDialog || showDeleteDialog ? 'bg-black/20 backdrop-blur-[2px]' : ''}`}
          onClick={() => {
            if (showEditDialog) setShowEditDialog(false);
            if (showReportDialog) setShowReportDialog(false);
            if (showDeleteDialog) setShowDeleteDialog(false);
            onClose();
          }}
        />
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 pointer-events-auto border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Post</h3>
            <textarea
              placeholder="Enter new post content"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4 text-gray-900 placeholder:text-gray-400 min-h-[150px] resize-y"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePost}
                disabled={!newTitle.trim() || isUpdating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
              >
                {isUpdating && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 pointer-events-auto border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Post</h3>
            <textarea
              placeholder="Why are you reporting this post?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4 text-gray-900 placeholder:text-gray-400 min-h-[100px]"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                disabled={isReporting}
              >
                Cancel
              </button>
              <button
                onClick={handleReportPost}
                disabled={!reportReason.trim() || isReporting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
              >
                {isReporting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isReporting ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 pointer-events-auto border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <FiTrash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Post?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete this post? This action cannot be undone and it will be removed from everyone's feed.
              </p>
              <div className="flex flex-col w-full gap-2">
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isDeleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-bold text-sm"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Modal */}
      {isOpen && !showEditDialog && !showReportDialog && !showDeleteDialog && (
        <div
          className="fixed bg-white rounded-lg border border-gray-200 shadow-lg z-[9999] min-w-[200px] py-2"
          style={{
            top: position.top,
            right: position.right,
          }}
        >
          <div className="py-2">
            {isAuthor && (
              <button
                onClick={() => handleAction('edit')}
                disabled={isUpdating}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FiEdit className="w-4 h-4" />
                <span className="text-sm">{isUpdating ? 'Updating...' : SITE_CONFIG.networking.postActions.editPost}</span>
              </button>
            )}
            {/* 
            <button
              onClick={() => handleAction('share')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <FiShare className="w-4 h-4" />
              <span className="text-sm">{SITE_CONFIG.networking.postActions.sharePost}</span>
            </button> */}

            {/* <button
              onClick={() => handleAction('mute')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <FiBell className="w-4 h-4" />
              <span className="text-sm">{SITE_CONFIG.networking.postActions.muteNotifications}</span>
            </button> */}

            {!isAuthor && (
              <button
                onClick={() => handleAction('report')}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiFlag className="w-4 h-4" />
                <span className="text-sm">Report Post</span>
              </button>
            )}

            {isAuthor && (
              <button
                onClick={() => handleAction('delete')}
                disabled={isDeleting}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" />
                <span className="text-sm">{isDeleting ? 'Deleting...' : SITE_CONFIG.networking.postActions.deletePost}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default PostActionsModal;
