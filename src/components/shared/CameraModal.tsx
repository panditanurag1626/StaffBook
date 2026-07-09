'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCamera, FiVideo, FiRefreshCcw } from 'react-icons/fi';
import Modal from './Modal';
import Button from './Button';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
    mode?: 'image' | 'video' | 'both';
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture, mode = 'both' }) => {
    const [step, setStep] = useState<'camera' | 'preview'>('camera');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [capturedFile, setCapturedFile] = useState<File | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen && step === 'camera') {
            startCamera(facingMode);
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen, step, facingMode]);

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

    const startCamera = async (fMode: 'user' | 'environment') => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: fMode } },
                audio: mode !== 'image'
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error('Failed to access camera:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
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
                    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setCapturedFile(file);
                    setPreviewUrl(URL.createObjectURL(blob));
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
            const file = new File([blob], `capture_${Date.now()}.${ext}`, { type: mimeType });
            setCapturedFile(file);
            setPreviewUrl(URL.createObjectURL(blob));
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

    const handleConfirm = () => {
        if (capturedFile) {
            onCapture(capturedFile);
            handleClose();
        }
    };

    const handleClose = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setStep('camera');
        setCapturedFile(null);
        setPreviewUrl('');
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <div className="w-[90vw] md:w-[500px] bg-white rounded-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4">
                    <h2 className="text-lg font-bold">Camera</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-4 flex-grow flex flex-col min-h-0 pt-0">
                    {step === 'camera' ? (
                        <div className="space-y-4">
                            <div className="relative flex-grow min-h-0 min-h-[40vh] max-h-[50vh] bg-black rounded-xl overflow-hidden shadow-inner">
                                <video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline />
                                {isRecording && (
                                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-white text-xs font-bold">{formatTime(recordingTime)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    {(mode === 'image' || mode === 'both') && (
                                        <Button 
                                            onClick={takePhoto} 
                                            disabled={isRecording}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                        >
                                            <FiCamera /> Take Photo
                                        </Button>
                                    )}
                                    <Button onClick={toggleCamera} variant="outline" className="flex-1 sm:hidden flex items-center justify-center gap-2">
                                        <FiRefreshCcw /> Switch
                                    </Button>
                                </div>
                                {(mode === 'video' || mode === 'both') && (
                                    <Button 
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white flex items-center justify-center gap-2`}
                                    >
                                        <FiVideo /> {isRecording ? 'Stop Recording' : 'Record Video'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative flex-grow min-h-0 min-h-[40vh] max-h-[50vh] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                                {capturedFile?.type.startsWith('video/') || capturedFile?.name.match(/\.(webm|mp4|mov)$/i) ? (
                                    <video src={previewUrl} controls playsInline className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => setStep('camera')} variant="outline" className="flex-1">Capture Again</Button>
                                <Button onClick={handleConfirm} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">Continue</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CameraModal;
