'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useDyteClient, DyteProvider } from '@dytesdk/react-web-core';
import { DyteMeeting } from '@dytesdk/react-ui-kit';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { FiLoader, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { meetService } from '@/lib/api/services/meetService';

function MeetingContent() {
  const params = useParams();
  const meetingId = params?.meetingId as string;
  const { user, isInitialized } = useAuth();
  const authLoading = !isInitialized;
  const [meeting, initMeeting] = useDyteClient();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isMeetingActive, setIsMeetingActive] = useState(false);

  useEffect(() => {
    const getAuthToken = async () => {
      if (authLoading) return;
      if (!user) {
        setError('Please login to join the meeting');
        setLoading(false);
        return;
      }
      if (!meetingId) {
        setError('Invalid meeting ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const accessRes = await meetService.accessMeeting(meetingId);
        console.log('[MeetingPage] accessMeeting response:', JSON.stringify(accessRes, null, 2));

        if (accessRes?.status !== 200 && accessRes?.status !== 201) {
          setError(accessRes?.message || 'Meeting has expired or is invalid');
          setLoading(false);
          return;
        }

        const meetingData =
          accessRes?.data?.data ||
          accessRes?.data?.meeting ||
          accessRes?.data;

        console.log('[MeetingPage] meetingData:', JSON.stringify(meetingData, null, 2));

        if (meetingData?.is_expired) {
          setError('This meeting has expired.');
          setLoading(false);
          return;
        }

        const message = (accessRes?.message || '').toLowerCase();
        if (!message.includes('granted') && !message.includes('success')) {
          console.log('[MeetingPage] access denied, message:', accessRes?.message);
          setError(accessRes?.message || 'Unable to access meeting.');
          setLoading(false);
          return;
        }

        const token =
          meetingData?.participant_auth_token ||
          meetingData?.auth_token ||
          meetingData?.token ||
          meetingData?.authToken;

        console.log('[MeetingPage] token found:', !!token);

        if (token) {
          setAuthToken(token);
        } else {
          console.log('[MeetingPage] full accessRes:', JSON.stringify(accessRes, null, 2));
          setError('Failed to get meeting access token');
        }
      } catch (err: any) {
        console.error('Meeting access check failed:', err);
        const errMsg = err?.response?.data?.message || err?.message || 'Meeting has expired or is invalid';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    getAuthToken();
  }, [meetingId, user, authLoading]);

  useEffect(() => {
    if (authToken) {
      console.log('[MeetingPage] initializing Dyte with token length:', authToken.length);
      initMeeting({
        authToken,
        defaults: {
          audio: true,
          video: true,
        },
      }).catch((err: any) => {
        console.error('[MeetingPage] Dyte init failed:', err);
        setError('Failed to initialize meeting: ' + (err?.message || 'unknown error'));
      });
    }
  }, [authToken, initMeeting]);

  useEffect(() => {
    if (meeting?.self) {
      setIsMeetingActive(true);
      console.log('[MeetingPage] Dyte meeting ready, participant joined');
      const handleRoomLeft = () => {
        toast.success('You have left the meeting');
        router.push('/networking');
      };
      meeting.self.on('roomLeft', handleRoomLeft);
      return () => {
        meeting.self.off('roomLeft', handleRoomLeft);
        setIsMeetingActive(false);
      };
    }
  }, [meeting, router]);

  useEffect(() => {
    if (!isMeetingActive) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isMeetingActive]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-white">
        <FiLoader className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-xl font-medium">Preparing your meeting room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <FiAlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold">Cannot Join Meeting</h1>
        <p className="text-gray-400 max-w-md">{error}</p>
        <button
          onClick={() => router.push('/networking')}
          className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold transition-all flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Networking
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <FiAlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold">Authentication Required</h1>
        <p className="text-gray-400 max-w-md">You must be logged in to participate in this meeting. Please log in and try again.</p>
        <button
          onClick={() => router.push('/signin')}
          className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <FiLoader className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-xl font-medium">Connecting to Dyte...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex flex-col">
      <DyteProvider value={meeting}>
        <DyteMeeting meeting={meeting} showSetupScreen={true} />
      </DyteProvider>
    </div>
  );
}

export default function MeetingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><FiLoader className="animate-spin" /></div>}>
      <MeetingContent />
    </Suspense>
  )
}
