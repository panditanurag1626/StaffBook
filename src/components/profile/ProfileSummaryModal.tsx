import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { userService } from '@/lib/api/services/userService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface ProfileSummaryModalProps {
  open: boolean;
  onClose: () => void;
  initialData: string;
}

const ProfileSummaryModal: React.FC<ProfileSummaryModalProps> = ({ open, onClose, initialData }) => {
  const [summary, setSummary] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (open) {
      setSummary(initialData);
    }
  }, [open, initialData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await userService.editProfile({ bio: summary });
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshUser();
      toast.success('Profile Summary updated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to update summary:', error);
      let errorMessage = 'Failed to update summary';
      const responseData = error?.response?.data?.data;
      if (responseData?.errors) {
        const firstKey = Object.keys(responseData.errors)[0];
        if (firstKey && Array.isArray(responseData.errors[firstKey]) && responseData.errors[firstKey].length > 0) {
          errorMessage = responseData.errors[firstKey][0];
        }
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSave} className="bg-white rounded-2xl w-[90vw] md:w-[80vw] lg:w-[800px] max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Professional Summary</div>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          maxLength={4000}
          rows={14}
          className="w-full text-gray-700 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none mb-4"
          placeholder="Brief bio about yourself"
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileSummaryModal; 