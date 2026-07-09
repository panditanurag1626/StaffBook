'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Trash2, Image as ImageIcon } from 'lucide-react';
import getCroppedImg from '@/lib/cropImage';
import { THEME } from '@/styles/theme';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onSave: (croppedImageFile: File) => void;
  onDelete: () => void;
  onChangeImage?: () => void;
  aspectRatio?: number;
  title?: string;
  isCover?: boolean;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onSave,
  onDelete,
  onChangeImage,
  aspectRatio = 1,
  title = "Edit Image",
  isCover = false
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedFile) {
        onSave(croppedFile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className={`text-lg font-bold ${THEME.colors.text.heading}`}>{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className={`relative w-full ${isCover ? 'h-[250px]' : 'h-[400px]'} bg-gray-900`}>
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              objectFit={isCover ? 'horizontal-cover' : 'contain'}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              No image selected
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <ZoomOut size={20} className="text-gray-500" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 outline-none"
            />
            <ZoomIn size={20} className="text-gray-500" />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium border border-red-100"
              >
                <Trash2 size={18} />
                Delete
              </button>
              {onChangeImage && (
                <button
                  onClick={onChangeImage}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors font-medium border border-purple-100"
                >
                  <ImageIcon size={18} />
                  Update
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing || !imageSrc}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
