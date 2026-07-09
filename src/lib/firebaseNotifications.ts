import { db } from './firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { connectionService } from './api/services/connectionService';

export type NotificationType = 'post' | 'reel' | 'story' | 'comment' | 'recommendation' | 'mention'
    | 'connection_request'
    | 'connection_accepted'
    | 'job_application'
    | 'meeting'
    | 'like'
    | 'repost'
    | 'profile_view'
    | 'resume_download'
    | 'job_invite'
    | 'contact_view'
    | 'message'
    | 'meeting_scheduled'
    | 'meeting_invite'
    | 'meeting_upcoming'
    | 'meeting_reminder'
    | 'job_match'
    | 'email_view';

export interface FirebaseNotification {
    id?: string;
    type: NotificationType;
    senderId: number | string;
    senderName: string;
    senderAvatar: string;
    referenceId: string | number;
    read: boolean;
    createdAt: number;
    message: string;
    metadata?: any;
}

/**
 * Sends a notification to all connections of a specific user using Firebase Realtime Database.
 */
export const sendNotificationToConnections = async (
    userId: number,
    userName: string,
    userAvatar: string,
    type: 'post' | 'reel' | 'story',
    referenceId: string | number
) => {
    try {
        const response = await connectionService.getMyConnections(1, userId);
        const connections = response.data?.myconnections?.items || [];
        console.log('FBN: My Connections response:', response, 'Connections extracted:', connections);

        if (connections.length === 0) {
            console.warn('FBN: No connections found for user', userId);
            return;
        }

        const notificationData = {
            type,
            senderId: userId,
            senderName: userName,
            senderAvatar: userAvatar || '/images/user_profile_placeholder.jpeg',
            referenceId,
            read: false,
            createdAt: serverTimestamp(),
            message: `${userName} posted a new ${type}`
        };

        const promises = connections.map((conn: any) => {
            const connectionUserId = conn.id || conn.connectionUser?.id || conn.connection_user_id;
            if (!connectionUserId) {
                console.warn('FBN: Could not find connectionUserId for:', conn);
                return Promise.resolve();
            }

            const notifRef = ref(db, `users/${connectionUserId}/notifications`);
            const newNotifRef = push(notifRef);
            return set(newNotifRef, notificationData);
        });

        await Promise.all(promises);
        console.log(`Successfully sent ${type} notification to ${connections.length} connections.`);
    } catch (error) {
        console.error("Failed to send firebase notifications", error);
    }
};

/**
 * Sends a notification directly to a specific user.
 */
export const sendNotificationToUser = async (
    targetUserId: number | string,
    senderId: number | string,
    senderName: string,
    senderAvatar: string,
    type: NotificationType,
    message: string,
    referenceId: string | number = '',
    metadata: any = {}
) => {
    try {
        if (!targetUserId) return;

        const notificationData = {
            type,
            senderId,
            senderName,
            senderAvatar: senderAvatar || '/images/user_profile_placeholder.jpeg',
            referenceId,
            read: false,
            createdAt: serverTimestamp(),
            message,
            metadata
        };

        const notifRef = ref(db, `users/${targetUserId}/notifications`);
        const newNotifRef = push(notifRef);
        await set(newNotifRef, notificationData);

        console.log(`Successfully sent ${type} notification to user ${targetUserId}.`);
    } catch (error) {
        console.error(`Failed to send ${type} notification to user ${targetUserId}`, error);
    }
};

/**
 * Helper explicitly for Post Interactions: comment, like, repost
 */
export const notifyPostInteraction = (targetUserId: number | string, senderId: number | string, senderName: string, senderAvatar: string, action: 'commented on' | 'liked' | 'reposted', referenceId: string | number) => {
    const typeMap = {
        'commented on': 'comment',
        'liked': 'like',
        'reposted': 'repost'
    } as const;
    return sendNotificationToUser(targetUserId, senderId, senderName, senderAvatar, typeMap[action], `${senderName} ${action} your post`, referenceId);
}

/**
 * Helper explicitly for Profile and Data Activity: view, download, contact view
 */
export const notifyProfileActivity = (targetUserId: number | string, senderId: number | string, senderName: string, senderAvatar: string, type: 'profile_view' | 'resume_download' | 'contact_view' | 'email_view') => {
    let message = '';
    if (type === 'profile_view') message = `${senderName} viewed your profile`;
    else if (type === 'resume_download') message = `${senderName} downloaded your resume`;
    else if (type === 'contact_view') message = `${senderName} viewed your contact details`;
    else if (type === 'email_view') message = `${senderName} viewed your email address`;
    
    return sendNotificationToUser(targetUserId, senderId, senderName, senderAvatar, type, message, senderId);
}

/**
 * Helper for Job Invites
 */
export const notifyJobInvite = (targetUserId: number | string, senderId: number | string, senderName: string, senderAvatar: string, referenceId: string | number) => {
    return sendNotificationToUser(targetUserId, senderId, senderName, senderAvatar, 'job_invite', `${senderName} sent you a job invite`, referenceId);
}

/**
 * Helper for Direct Messages
 */
export const notifyMessageReceived = (targetUserId: number | string, senderId: number | string, senderName: string, senderAvatar: string, referenceId: string | number) => {
    return sendNotificationToUser(targetUserId, senderId, senderName, senderAvatar, 'message', `${senderName} sent you a message`, referenceId);
}

/**
 * Helper for Meeting/Scheduling Updates
 * dateTimeString should be pre-formatted like "Oct 12, 2:45 pm" or "15 mins" (for reminders)
 */
export const notifyMeetingActivity = (targetUserId: number | string, senderId: number | string, senderName: string, senderAvatar: string, type: 'meeting_scheduled' | 'meeting_invite' | 'meeting_upcoming' | 'meeting_reminder', dateTimeString: string, referenceId: string | number) => {
    let message = '';
    if (type === 'meeting_scheduled') message = `Your meeting with ${senderName} is scheduled on ${dateTimeString}`;
    else if (type === 'meeting_invite') message = `${senderName} invited you to a meeting on ${dateTimeString}`;
    else if (type === 'meeting_upcoming') message = `You have an upcoming meeting with ${senderName} at ${dateTimeString}`;
    else if (type === 'meeting_reminder') message = `Reminder: Your meeting starts in ${dateTimeString}`;

    return sendNotificationToUser(targetUserId, senderId, senderName, senderAvatar, type, message, referenceId);
}

/**
 * Helper for Match Job Skills With Candidates
 */
export const notifyJobMatch = (
    targetUserId: number | string,
    senderId: number | string,
    senderName: string,
    senderAvatar: string,
    jobTitle: string,
    jobId: string | number
) => {
    return sendNotificationToUser(
        targetUserId,
        senderId,
        senderName,
        senderAvatar,
        'job_match',
        `A new job matching your skills has been posted: ${jobTitle}`,
        jobId,
        { jobTitle, jobId }
    );
};

/**
 * Marks a specific notification as read.
 */
export const markNotificationAsRead = async (userId: string | number, notificationId: string) => {
    try {
        const notifRef = ref(db, `users/${userId}/notifications/${notificationId}/read`);
        await set(notifRef, true);
    } catch (error) {
        console.error("Failed to mark notification as read", error);
    }
};
