'use client';

import React, { useState, useRef } from 'react';
import { THEME } from '@/styles/theme';
import { UserProfile } from '@/lib/api/types';
import { userService } from '@/lib/api/services/userService';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { FiImage, FiUpload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../shared/Card';
import ImageCropModal from './ImageCropModal';

interface ImageGalleryProps {
    profileData: UserProfile | null;
    readOnly?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ profileData, readOnly = false }) => {
    const { refreshUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [isCropOpen, setIsCropOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [editingMediaId, setEditingMediaId] = useState<number | string | null>(null);

    const mediaList = profileData?.media || [];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select a valid image file.');
            return;
        }

        const url = URL.createObjectURL(file);
        setCropImageSrc(url);
        setIsCropOpen(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        setEditingMediaId(null);
        fileInputRef.current?.click();
    };

    const handleEditExisting = (media: any) => {
        setCropImageSrc(media.url);
        setEditingMediaId(media.id);
        setIsCropOpen(true);
    };

    const closeCropModal = () => {
        setIsCropOpen(false);
        setCropImageSrc(null);
        setEditingMediaId(null);
    };

    const handleSaveCrop = async (croppedFile: File) => {
        setIsUploading(true);
        try {
            const deleteIds = editingMediaId ? [editingMediaId] : undefined;
            const resp = await userService.uploadUserMedia([croppedFile], deleteIds);

            if (resp.status === 200) {
                toast.success(editingMediaId ? 'Image updated successfully' : 'Image uploaded successfully');
                await refreshUser();
                setIsCropOpen(false);
                setCropImageSrc(null);
                setEditingMediaId(null);
                setCurrentIndex(0);
            } else {
                toast.error(resp.message || 'Failed to save image');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong while saving image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteCrop = async () => {
        if (editingMediaId) {
            setIsUploading(true);
            try {
                const resp = await userService.uploadUserMedia([], [editingMediaId]);
                if (resp.status === 200) {
                    toast.success('Image deleted successfully');
                    await refreshUser();
                    setCurrentIndex(0);
                } else {
                    toast.error(resp.message || 'Failed to delete image');
                }
            } catch (error: any) {
                toast.error(error.message || 'Something went wrong while deleting image.');
            } finally {
                setIsUploading(false);
            }
        }
        setIsCropOpen(false);
        setCropImageSrc(null);
        setEditingMediaId(null);
    };

    const handleNext = () => {
        if (mediaList.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % mediaList.length);
        }
    };

    const handlePrev = () => {
        if (mediaList.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
        }
    };

    return (
        <Card id="portfolio" className="flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-purple-600 pl-3">Portfolio</h2>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className={`${THEME.components.button.outline} px-4 py-2 text-sm flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiUpload size={16} />
                            )}
                            <span>{isUploading ? 'Uploading...' : 'Upload Images'}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="py-2">
                {mediaList.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 shadow-sm">
                            <FiImage size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Images Uploaded</h3>
                        <p className="text-gray-500 max-w-sm mb-6">
                            Showcase your work, events, or portfolio by adding images to your gallery.
                        </p>
                        {!readOnly && (
                            <button
                                onClick={handleUploadClick}
                                className={`${THEME.components.button.primary} px-6 py-2.5 rounded-full flex items-center gap-2`}
                            >
                                <FiUpload size={16} />
                                <span>Browse Photos</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl bg-black/5 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center aspect-video group shadow-sm bg-gray-50">
                            {mediaList[currentIndex] && (
                                <Image
                                    src={mediaList[currentIndex].url}
                                    alt={mediaList[currentIndex].filename || "Gallery Image"}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    className="object-contain"
                                />
                            )}

                            {/* Edit Overlay Button */}
                            {mediaList[currentIndex] && !readOnly && (
                                <button
                                    onClick={() => handleEditExisting(mediaList[currentIndex])}
                                    className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 px-3 py-2 rounded-lg shadow-md backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 opacity-70 group-hover:opacity-100 flex items-center gap-2"
                                >
                                    <FiImage size={16} />
                                    <span className="text-sm font-semibold">Edit</span>
                                </button>
                            )}

                            {mediaList.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 opacity-70 group-hover:opacity-100"
                                    >
                                        <FiChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 opacity-70 group-hover:opacity-100"
                                    >
                                        <FiChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                                {currentIndex + 1} / {mediaList.length}
                            </div>
                        </div>

                        {mediaList.length > 1 && (
                            <div className="flex items-center gap-2 w-full max-w-xs sm:max-w-lg md:max-w-2xl overflow-x-auto py-4 mt-2 scrollbar-hide snap-x">
                                {mediaList.map((media, idx) => (
                                    <button
                                        key={media.id || idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`relative min-w-[64px] h-[64px] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 snap-center ${currentIndex === idx ? 'border-purple-600 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={media.url}
                                            alt={"Thumbnail"}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isCropOpen && (
                <ImageCropModal
                    isOpen={isCropOpen}
                    onClose={closeCropModal}
                    imageSrc={cropImageSrc}
                    onSave={handleSaveCrop}
                    onDelete={handleDeleteCrop}
                    onChangeImage={() => fileInputRef.current?.click()}
                    aspectRatio={4 / 3}
                    title={editingMediaId ? "Edit Image" : "Upload Image"}
                />
            )}
        </Card>
    );
};

export default ImageGallery;
