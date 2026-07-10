'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiX, FiCalendar, FiClock, FiUser, FiPlus } from 'react-icons/fi';
import { THEME } from '@/styles/theme';
import { meetService } from '@/lib/api/services/meetService';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { sendNotificationToUser } from '@/lib/firebaseNotifications';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCandidateName?: string;
  initialCandidateId?: number | null;
  initialJobPostId?: number | null;
  mode?: 'networking' | 'seeker' | 'employer';
  isFromNavbar?: boolean;
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  initialCandidateName = "",
  initialCandidateId = null,
  initialJobPostId = null,
  mode = 'seeker',
  isFromNavbar = false
}) => {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'scheduled' | 'past' | 'schedule'>(isFromNavbar ? 'requests' : 'schedule');

  const [meetingRequests, setMeetingRequests] = useState<any[]>([]);
  const [scheduledMeetings, setScheduledMeetings] = useState<any[]>([]);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    candidateName: initialCandidateName || '',
    datetime: '',
    notes: ''
  });

  // Set tab and name when opening with initial data
  useEffect(() => {
    if (isOpen) {
      if (initialCandidateName) {
        setNewMeeting(prev => ({
          ...prev,
          candidateName: initialCandidateName,
          title: prev.title || `Meeting with ${initialCandidateName}`
        }));
      }
      if (!isFromNavbar) {
        setActiveTab('schedule');
      } else {
        setActiveTab('requests');
      }
    }
  }, [isOpen, initialCandidateName, isFromNavbar]);

  // Fetch meeting logs
  const fetchMeetingLogs = async () => {
    setLoadingMeetings(true);
    try {
      if (activeTab === 'requests' || activeTab === 'scheduled') {
        const res = await meetService.getMeetingLogs({ status: 'upcoming', page: 1, per_page: 50 });
        console.log('[MeetingModal] getMeetingLogs response:', res);
        if (res.status === 200) {
          const allUpcoming = res.data?.data || [];
          if (allUpcoming.length > 0) {
            console.log('[MeetingModal] first meeting item keys:', Object.keys(allUpcoming[0]));
            console.log('[MeetingModal] raw title field:', allUpcoming[0]?.title);
            console.log('[MeetingModal] raw description field:', allUpcoming[0]?.description);
            console.log('[MeetingModal] raw meeting_title field:', allUpcoming[0]?.meeting_title);
            console.log('[MeetingModal] raw notes field:', allUpcoming[0]?.notes);
            console.log('[MeetingModal] first meeting item:', allUpcoming[0]);
            console.log('[MeetingModal] nested meet:', allUpcoming[0]?.meet);
            console.log('[MeetingModal] nested meeting:', allUpcoming[0]?.meeting);
            console.log('[MeetingModal] job_post:', allUpcoming[0]?.job_post);
            // recursively search for any title/name fields in the response
            const findKeys = (obj: any, depth = 0): string[] => {
              if (!obj || typeof obj !== 'object' || depth > 3) return [];
              return Object.entries(obj).flatMap(([k, v]) =>
                (k.toLowerCase().includes('title') || k.toLowerCase().includes('name')) && typeof v === 'string'
                  ? [`${k}: "${v}"`]
                  : findKeys(v, depth + 1)
              );
            };
            console.log('[MeetingModal] title/name fields found:', findKeys(allUpcoming[0]));
          }
          setMeetingRequests(allUpcoming.filter((m: any) => m.meeting_status === 'pending'));
          setScheduledMeetings(allUpcoming.filter((m: any) => m.meeting_status === 'accepted'));
        }
      } else if (activeTab === 'past') {
        const res = await meetService.getMeetingLogs({ status: 'past', page: 1, per_page: 50 });
        console.log('[MeetingModal] past meetings response:', res);
        if (res.status === 200) {
          const pastData = res.data?.data || [];
          if (pastData.length > 0) {
            console.log('[MeetingModal] first past meeting item:', pastData[0]);
            // recursively search for any title/name fields
            const findKeys = (obj: any, depth = 0): string[] => {
              if (!obj || typeof obj !== 'object' || depth > 3) return [];
              return Object.entries(obj).flatMap(([k, v]) =>
                (k.toLowerCase().includes('title') || k.toLowerCase().includes('name')) && typeof v === 'string'
                  ? [`${k}: "${v}"`]
                  : findKeys(v, depth + 1)
              );
            };
            console.log('[MeetingModal] past meeting title/name fields found:', findKeys(pastData[0]));
          }
          setPastMeetings(pastData);
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    if (isOpen && (activeTab === 'requests' || activeTab === 'scheduled' || activeTab === 'past')) {
      fetchMeetingLogs();
    }
  }, [isOpen, activeTab]);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleAddMeeting = async () => {
    if (!newMeeting.datetime) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setSubmitting(true);

      const dateObj = new Date(newMeeting.datetime);
      const scheduledAt = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

      let payload: any = {
        title: newMeeting.title || "Meeting",
        meeting_title: newMeeting.title || "Meeting",
        description: newMeeting.notes,
        notes: newMeeting.notes,
        preferred_region: "ap-south-1",
        job_post_id: initialJobPostId || null,
        viewed_user_id: initialCandidateId || null,
        count: 1,
        preset_name: "group_call_participant",
        scheduled_at: scheduledAt
      };

      if (mode === 'employer') {
        payload.contact_flow = "meeting_employer_to_job_seeker";
      } else {
        payload.record_on_start = false;
      }

      console.log('[MeetingModal] createMeeting payload:', payload);
      const res = await meetService.createMeeting(payload);
      console.log('[MeetingModal] createMeeting response:', JSON.stringify(res, null, 2));

      toast.success(res?.message || 'Meeting scheduled successfully');

      // Send Firebase notification to receiver
      if (initialCandidateId && user) {
        await sendNotificationToUser(
          initialCandidateId,
          user.id,
          `${user.first_name} ${user.last_name}`,
          user.picture || user.image || '',
          'meeting_scheduled',
          `${user.first_name} ${user.last_name} has scheduled a meeting "${newMeeting.title || 'Meeting'}" with you for ${scheduledAt}${newMeeting.notes ? `. Notes: ${newMeeting.notes}` : ''}`,
          res.data?.id || '',
          { job_post_id: initialJobPostId, mode, notes: newMeeting.notes }
        );
      }

      setNewMeeting({ title: '', candidateName: initialCandidateName || '', datetime: '', notes: '' });
      setActiveTab('requests');
    } catch (error: any) {
      console.error('Error scheduling meeting:', error);
      const errors = error?.response?.data?.data?.errors;
      if (errors && typeof errors === 'object') {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && Array.isArray(errors[firstErrorKey]) && errors[firstErrorKey].length > 0) {
          toast.error(errors[firstErrorKey][0]);
          return;
        }
      }
      toast.error(error?.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (id: number, action: 'accept' | 'decline') => {
    try {
      const res = await meetService.respondMeeting({ meeting_log_id: id, action, notes: '' });
      toast.success(res?.message || `Meeting ${action}ed`);

      // Fire notification in background (don't block UI)
      const meeting = [...meetingRequests, ...scheduledMeetings].find(m => m.id === id);
      if (meeting && user) {
        const creatorId = meeting.sender_user?.id;
        if (creatorId && creatorId !== user.id) {
          sendNotificationToUser(
            creatorId,
            user.id,
            `${user.first_name} ${user.last_name}`,
            user.picture || user.image || '',
            'meeting_scheduled',
            `${user.first_name} ${user.last_name} has ${action}ed your meeting request for "${getMeetingTitle(meeting)}"`,
            id,
            { action, meeting_id: meeting.meeting_id }
          ).catch(err => console.error('Notification failed:', err));
        }
      }

      // Refresh meetings in background
      fetchMeetingLogs();
    } catch (error: any) {
      console.error('Error responding to meeting:', error);
      toast.error(error?.response?.data?.message || `Failed to ${action} meeting`);
    }
  };

  const handleJoinMeeting = (meeting: any) => {
    if (meeting.meeting_status === 'pending') {
      const otherUser = getOtherUserName(meeting) || 'the other party';
      toast.error(`Waiting for ${otherUser} to accept the meet request`);
      return;
    }
    const meetingId = meeting.meeting_id;
    if (!meetingId) {
      toast.error('Meeting ID not found');
      return;
    }
    // Open the meeting in a new tab
    window.open(`/meeting/${meetingId}`, '_blank');
  };

  const getMeetingTitle = (m: any) => {
    const candidates = [
      m?.meeting_title, m?.title, m?.name,
      m?.meet?.meeting_title, m?.meet?.title, m?.meet?.name,
      m?.meeting?.meeting_title, m?.meeting?.title, m?.meeting?.name,
      m?.meeting?.meet?.meeting_title, m?.meeting?.meet?.title, m?.meeting?.meet?.name,
      m?.meet?.meeting?.meeting_title, m?.meet?.meeting?.title, m?.meet?.meeting?.name,
      m?.job_post?.job_title, m?.job_post?.title
    ];
    const title = candidates.find(c => c && typeof c === 'string' && c.trim());
    return title || 'Meeting';
  };

  const getOtherUserName = (meeting: any) => {
    const otherUser = meeting.sender_user?.id === user?.id ? meeting.receiver_user : meeting.sender_user;
    if (otherUser) {
      const fullName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim();
      return fullName || otherUser.name || 'User';
    }
    return meeting.viewed_user?.name || meeting.employer?.company_name || meeting.employer?.name || 'Applicant';
  };

  const getOtherUserProfileLink = (meeting: any): { id: number | string | null; name: string } => {
    const otherUser = meeting.sender_user?.id === user?.id ? meeting.receiver_user : meeting.sender_user;
    if (otherUser) {
      const fullName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim();
      return { id: otherUser.id, name: fullName || otherUser.name || 'User' };
    }
    return { id: meeting.viewed_user?.id || meeting.employer?.id || null, name: meeting.viewed_user?.name || meeting.employer?.company_name || meeting.employer?.name || 'Applicant' };
  };

  const getMeetingNotes = (m: any): string | null => {
    const candidates = [
      m?.notes, m?.description,
      m?.meet?.notes, m?.meet?.description,
      m?.meeting?.notes, m?.meeting?.description,
      m?.meeting?.meet?.notes, m?.meeting?.meet?.description,
      m?.meet?.meeting?.notes, m?.meet?.meeting?.description
    ];
    return candidates.find(c => c && typeof c === 'string' && c.trim()) || null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center md:items-start md:justify-end md:pt-[75px] md:pr-6 pointer-events-none">
      <div ref={modalRef} className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 md:mx-0 max-h-[80vh] flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r from-indigo-300 to-purple-300 text-white`}>
              <FiCalendar size={20} />
            </div>
            <h2 className={`${THEME.components.typography.sectionTitle} text-lg`}>Meetings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {isFromNavbar ? (
            <>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Requests
                {activeTab === 'requests' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'scheduled' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Scheduled
                {activeTab === 'scheduled' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'past' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Past
                {activeTab === 'past' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative text-purple-600`}
            >
              Schedule
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {loadingMeetings ? (
                <p className="text-center text-gray-400 py-8">Loading...</p>
              ) : meetingRequests.length > 0 ? meetingRequests.map(req => (
                <div key={req.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {getMeetingTitle(req)}
                      </h4>
                      {getMeetingNotes(req) && (
                        <p className="text-xs text-gray-600 mt-1 mb-1 italic">
                          {getMeetingNotes(req)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {(() => { const o = getOtherUserProfileLink(req); return o.id ? <Link href={`/profile/find-candidates/${o.id}`} className="text-purple-600 hover:underline">{o.name}</Link> : <span>{o.name}</span>; })()}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                      {req.meeting_status || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <FiClock size={14} className="text-gray-400" />
                    <span>{req.scheduled_at_formatted || 'TBD'}</span>
                  </div>
                  <div className="flex gap-2">
                    {req.sender_user?.id === user?.id ? (
                      <button
                        disabled
                        className="w-full text-center px-4 py-1.5 text-xs font-medium bg-gray-100 text-gray-400 rounded-full cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Join Meeting (Pending)
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleRespond(req.id, 'accept')} className={`w-auto px-4 py-1.5 text-xs font-medium ${THEME.components.button.primary} rounded-full transition-colors`}>
                          Accept
                        </button>
                        <button onClick={() => handleRespond(req.id, 'decline')} className="w-auto px-4 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 py-8">No pending requests</p>
              )}
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-3">
              {loadingMeetings ? (
                <p className="text-center text-gray-400 py-8">Loading...</p>
              ) : scheduledMeetings.length > 0 ? scheduledMeetings.map(req => (
                <div key={req.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {getMeetingTitle(req)}
                      </h4>
                      {getMeetingNotes(req) && (
                        <p className="text-xs text-gray-600 mt-1 mb-1 italic">
                          {getMeetingNotes(req)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {(() => { const o = getOtherUserProfileLink(req); return o.id ? <Link href={`/profile/find-candidates/${o.id}`} className="text-purple-600 hover:underline">{o.name}</Link> : <span>{o.name}</span>; })()}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full">
                      {req.meeting_status || 'accepted'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <FiClock size={14} className="text-gray-400" />
                    <span>{req.scheduled_at_formatted || 'TBD'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleJoinMeeting(req)}
                      className={`w-full text-center px-4 py-1.5 text-xs font-medium ${THEME.components.button.primary} rounded-full transition-colors`}
                    >
                      Join Meeting
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 py-8">No scheduled meetings</p>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="space-y-3">
              {loadingMeetings ? (
                <p className="text-center text-gray-400 py-8">Loading...</p>
              ) : pastMeetings.length > 0 ? pastMeetings.map(meeting => (
                <div key={meeting.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 opacity-75">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {getMeetingTitle(meeting)}
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                      {meeting.meeting_status || meeting.status || 'completed'}
                    </span>
                  </div>
                  {getMeetingNotes(meeting) && (
                    <p className="text-xs text-gray-600 mb-1 italic">
                      {getMeetingNotes(meeting)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-2">
                    {(() => { const o = getOtherUserProfileLink(meeting); return o.id ? <Link href={`/profile/find-candidates/${o.id}`} className="text-purple-600 hover:underline">{o.name}</Link> : <span>{o.name}</span>; })()}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <FiCalendar size={14} className="text-gray-400" />
                    <span>{meeting.scheduled_at_formatted || meeting.created_at_formatted || 'TBD'}</span>
                  </div>
                  {!meeting.is_expired && meeting.meeting_id && (
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className={`w-full text-center px-4 py-1.5 text-xs font-medium ${THEME.components.button.primary} rounded-full transition-colors`}
                    >
                      Join Meeting
                    </button>
                  )}
                </div>
              )) : (
                <p className="text-center text-gray-400 py-8">No past meetings</p>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-4">
                Schedule a Meeting
              </h3>
              <input
                type="text"
                placeholder="Meeting Title"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-gray-900 placeholder-gray-400"
                value={newMeeting.title}
                onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Participant Name"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-gray-900 placeholder-gray-400"
                value={newMeeting.candidateName}
                onChange={e => setNewMeeting({ ...newMeeting, candidateName: e.target.value })}
              />
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-gray-900 placeholder-gray-400"
                value={newMeeting.datetime}
                onChange={e => setNewMeeting({ ...newMeeting, datetime: e.target.value })}
              />
              <textarea
                placeholder="Message / Notes"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 min-h-[80px] text-gray-900 placeholder-gray-400"
                value={newMeeting.notes}
                onChange={e => setNewMeeting({ ...newMeeting, notes: e.target.value })}
              />
              <button
                onClick={handleAddMeeting}
                disabled={submitting}
                className={`w-auto mt-2 px-6 py-2.5 ${THEME.components.button.primary} rounded-full shadow-sm text-sm font-medium ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Scheduling...' : 'Send Request'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MeetingModal;
