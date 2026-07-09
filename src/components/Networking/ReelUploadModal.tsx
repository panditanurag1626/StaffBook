'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiUpload, FiVideo, FiImage } from 'react-icons/fi';
import { uploadReel } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { sendNotificationToConnections } from '@/lib/firebaseNotifications';
import toast from 'react-hot-toast';

interface ReelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const ReelUploadModal: React.FC<ReelUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'select' | 'camera' | 'preview' | 'uploading'>('select');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Ensure the stream is attached to the video element when it's mounted
    useEffect(() => {
        if ((step === 'camera' || isRecording) && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
        }
    }, [step, isRecording, stream]);

    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [stream]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Validate file size
    const validateFile = async (file: File): Promise<boolean> => {
        if (!file.type.startsWith('video/')) {
            toast.error('Only video files are allowed for reels');
            return false;
        }

        // Check file size (50MB max)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            toast.error('File size must be less than 50MB');
            return false;
        }

        return true;
    };

    // Handle file selection
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

        // Reset input value so selecting the same file again works
        e.target.value = '';
    };

    // Open camera for preview
    const openCamera = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'user' } },
                audio: true
            });
            setStream(newStream);
            setStep('camera');
            setError('');
        } catch (err) {
            setError('Failed to access camera. Please check permissions.');
            console.error('Camera error:', err);
        }
    };

    // Start actual recording
    const startActualRecording = () => {
        if (!stream) return;

        try {
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
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                const file = new File([blob], `reel_${Date.now()}.${ext}`, { type: mimeType });

                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(blob));
                setStep('preview');

                // Stop all tracks
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch (err) {
            setError('Failed to start recording.');
            console.error('Recording error:', err);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Handle upload
    const handleUpload = async () => {
        if (!selectedFile) return;

        setStep('uploading');
        setError('');

        try {
            console.log('Uploading reel:', { fileSize: selectedFile.size, fileType: selectedFile.type });

            const response = await uploadReel({
                title: selectedFile.name.split('.')[0] || 'Untitled Reel',
                description: 'Uploaded via StaffBook',
                video: selectedFile
            });

            console.log('Upload response:', response);

            // Check for success (200, 201, or custom status 1)
            if (response.status === 200 || response.status === 201 || response.status === 1 || response.message?.toLowerCase().includes('success')) {
                setUploadProgress(100);
                console.log('✅ Reel uploaded successfully, calling onSuccess');

                if (user) {
                    await sendNotificationToConnections(
                        user.id,
                        `${user.first_name} ${user.last_name}`,
                        user.picture || '',
                        'reel',
                        response.data?.id || Date.now()
                    );
                }

                onSuccess?.(); // Trigger refresh immediately
                setTimeout(() => {
                    handleClose();
                }, 1000);
            } else {
                console.error('Upload failed:', response);
                setError(response.message || 'Upload failed. Please try again.');
                setStep('preview');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed. Please try again.');
            setStep('preview');
        }
    };

    // Close modal and reset
    const handleClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setStep('select');
        setSelectedFile(null);
        setPreviewUrl('');
        setTitle('');
        setDescription('');
        setError('');
        setIsRecording(false);
        setUploadProgress(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap mr-2">
                        {step === 'select' ? 'Create Reel' : step === 'uploading' ? 'Posting Reel' : 'Preview Reel'}
                    </h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Action Buttons in Top Right */}
                        {step === 'select' && !isRecording && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-full transition-colors flex items-center gap-2"
                                >
                                    <FiUpload className="w-4 h-4" />
                                    Upload
                                </button>
                                <button
                                    onClick={openCamera}
                                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-bold rounded-full transition-colors flex items-center gap-2"
                                >
                                    <FiVideo className="w-4 h-4" />
                                    Record
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={step === 'uploading'}
                        >
                            <FiX className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Select Upload Method */}
                    {step === 'select' && !isRecording && (
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <FiUpload className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-600 text-lg">Click the buttons above to get started</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    No duration limit • Max 50MB • All formats accepted
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Camera/Recording View */}
                    {step === 'camera' && (
                        <div className="space-y-4">
                            <div className="relative aspect-[9/16] max-h-[500px] bg-black rounded-xl overflow-hidden mx-auto">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    muted
                                    autoPlay
                                    playsInline
                                />
                                {isRecording && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        {formatTime(recordingTime)}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {!isRecording ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (stream) {
                                                    stream.getTracks().forEach(track => track.stop());
                                                    setStream(null);
                                                }
                                                setStep('select');
                                            }}
                                            className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={startActualRecording}
                                            className="flex-[2] py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <div className="w-3 h-3 bg-white rounded-full" />
                                            Start Recording
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 animate-pulse"
                                    >
                                        <div className="w-3 h-3 bg-white rounded-sm" />
                                        Stop Recording
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preview & Add Details */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="relative w-full max-h-[400px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                                {selectedFile?.type.startsWith('video/') || selectedFile?.name.match(/\.(webm|mp4|mov)$/i) ? (
                                    <video
                                        src={previewUrl}
                                        controls
                                        playsInline
                                        className="max-w-full max-h-[400px] object-contain"
                                    />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setStep('select');
                                        setSelectedFile(null);
                                        setPreviewUrl('');
                                    }}
                                    className="px-4 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-full transition-colors text-sm"
                                >
                                    Capture Again
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors text-sm"
                                >
                                    Post Reel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Uploading */}
                    {step === 'uploading' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-900 font-semibold text-lg mb-2">Uploading your reel...</p>
                            <p className="text-gray-500 text-sm">Please wait</p>
                            {uploadProgress > 0 && (
                                <div className="mt-6 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReelUploadModal;
