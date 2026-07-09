'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiUpload, FiVideo, FiCamera, FiRefreshCcw } from 'react-icons/fi';
import { storyService } from '@/lib/api/services/storyService';
import { useAuth } from '@/context/AuthContext';
import { sendNotificationToConnections } from '@/lib/firebaseNotifications';
import toast from 'react-hot-toast';
import { compressImage } from '@/lib/utils';

interface StoryUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const StoryUploadModal: React.FC<StoryUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'select' | 'preview' | 'uploading' | 'camera'>('select');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [stream]);

    // Ensure the stream is attached to the video element when it's mounted
    useEffect(() => {
        if (step === 'camera' && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
        }
    }, [step, stream]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (!isOpen) return null;

    const validateFile = async (file: File): Promise<boolean> => {
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
        const limitLabel = isVideo ? '50MB' : '20MB';

        if (file.size > maxSize) {
            toast.error(`File size must be less than ${limitLabel}`);
            return false;
        }

        return true;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        const isValid = await validateFile(file);

        if (isValid) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStep('preview');
        }

        e.target.value = '';
    };

    const startCamera = async (mode: 'user' | 'environment' = 'user') => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: mode } },
                audio: true
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                videoRef.current.play();
            }
            setFacingMode(mode);
            setStep('camera');
            setError('');
        } catch (err) {
            setError('Failed to access camera.');
        }
    };

    const toggleCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        startCamera(newMode);
    };

    const takePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `story_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(blob));
                    stopCamera();
                    setStep('preview');
                }
            }, 'image/jpeg');
        }
    };

    const startRecording = () => {
        if (!stream) return;
        
        let mimeType = 'video/webm';
        if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
            if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            }
        }
        
        const options = mimeType ? { mimeType } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: mimeType });
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const file = new File([blob], `story_${Date.now()}.${ext}`, { type: mimeType });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(blob));
            stopCamera();
            setStep('preview');
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };


    const handleUpload = async () => {
        if (!selectedFile) return;

        setStep('uploading');
        setError('');
        setUploadProgress(10);

        try {
            let fileToUpload = selectedFile;
            
            // Compress images if they are too large
            if (selectedFile.type.startsWith('image/') && selectedFile.size > 1 * 1024 * 1024) {
                fileToUpload = await compressImage(selectedFile);
            }

            const uploadRes = await storyService.uploadGallery(fileToUpload);

            if (uploadRes.data?.fileUrl) {
                setUploadProgress(60);
                const fileUrl = uploadRes.data.fileUrl;
                const filename = fileUrl.split('/').pop();
                const isVideo = selectedFile.type.startsWith('video/') || selectedFile.name.toLowerCase().endsWith('.mp4') || selectedFile.name.toLowerCase().endsWith('.webm');

                const res = await storyService.postStories({
                    stories: [{
                        type: isVideo ? 2 : 1,
                        [isVideo ? 'video' : 'image']: filename,
                        description: title || '',
                        background_color: '#000000'
                    }]
                });

                if (user) {
                    await sendNotificationToConnections(
                        user.id,
                        `${user.first_name} ${user.last_name}`,
                        user.picture || '',
                        'story',
                        res?.data?.id || Date.now()
                    );
                }
                
                // Directly trigger the active stories API call as requested
                try {
                    await storyService.getMyActiveStory();
                } catch (e) {
                    console.error('Failed to trigger getMyActiveStory after upload', e);
                }

                setUploadProgress(100);
                setTimeout(() => {
                    onSuccess?.();
                    handleClose();
                }, 1000);
            } else {
                setError('Failed to process file upload');
                setStep('preview');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
            setStep('preview');
        }
    };

    const handleClose = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        stopCamera();
        setStep('select');
        setSelectedFile(null);
        setPreviewUrl('');
        setTitle('');
        setError('');
        setIsRecording(false);
        setUploadProgress(0);
        if (timerRef.current) clearInterval(timerRef.current);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap mr-2">
                        {step === 'select' ? 'Create Story' : step === 'uploading' ? 'Posting Story' : step === 'camera' ? 'Camera' : 'Preview Story'}
                    </h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Action Buttons in Top Right */}
                        {step === 'select' && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-full transition-colors flex items-center gap-2"
                                >
                                    <FiUpload className="w-4 h-4" />
                                    Upload
                                </button>
                                <button
                                    onClick={() => startCamera('user')}
                                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-bold rounded-full transition-colors flex items-center gap-2"
                                >
                                    <FiVideo className="w-4 h-4" />
                                    Record
                                </button>
                            </>
                        )}
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" disabled={step === 'uploading'}>
                            <FiX className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="p-6 flex-grow flex flex-col min-h-0">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                    {step === 'select' && (
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <FiUpload className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-600 text-lg">Click the buttons above to get started</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    No duration limit • Max 50MB • All formats accepted
                                </p>
                            </div>
                            <input ref={fileInputRef} type="file" accept="video/*,image/*" onChange={handleFileSelect} className="hidden" />
                        </div>
                    )}

                    {step === 'camera' && (
                        <div className="flex flex-col flex-grow min-h-0 space-y-4">
                            <div className="flex-grow min-h-0 min-h-[40vh] max-h-[600px] bg-black rounded-xl overflow-hidden relative shadow-inner">
                                {/* playsInline is important for iOS to not open full screen player */}
                                <video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline />
                                {isRecording && (
                                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-white text-sm font-bold">{formatTime(recordingTime)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                                <button onClick={takePhoto} disabled={isRecording} className={`flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-colors ${
                                    isRecording ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}>
                                    <FiCamera className="w-5 h-5" /> Photo
                                </button>
                                <button onClick={toggleCamera} className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors sm:hidden">
                                    <FiRefreshCcw className="w-5 h-5" /> Switch Cam
                                </button>
                                {!isRecording ? (
                                    <button onClick={startRecording} className="col-span-2 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                                        <FiVideo className="w-5 h-5" /> Start Recording
                                    </button>
                                ) : (
                                    <button onClick={stopRecording} className="col-span-2 flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors animate-pulse">
                                        <FiVideo className="w-5 h-5" /> Stop Recording
                                    </button>
                                )}
                                <button onClick={() => {stopCamera(); setStep('select');}} className="col-span-2 py-2 text-gray-500 hover:text-gray-700 font-bold transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="flex flex-col flex-grow min-h-0 space-y-4">
                            <div className="flex-grow min-h-0 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden max-h-[600px] min-h-[40vh]">
                                {selectedFile?.type.startsWith('video/') || selectedFile?.name.match(/\.(webm|mp4|mov)$/i) ? (
                                    <video src={previewUrl} controls playsInline className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                                )}
                            </div>
                            <div className="flex gap-3 pt-2 flex-shrink-0">
                                <button onClick={() => { setStep('select'); setSelectedFile(null); stopCamera(); }} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">Back</button>
                                <button onClick={handleUpload} className="flex-[2] py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Share Story</button>
                            </div>
                        </div>
                    )}

                    {step === 'uploading' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-900 font-bold text-lg">Sharing your story...</p>
                            <div className="mt-6 w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryUploadModal;
