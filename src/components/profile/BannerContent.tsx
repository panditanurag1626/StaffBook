'use client';

import React, { useState, useEffect, useRef } from 'react';
import { THEME } from '@/styles/theme';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiMoreHorizontal,
  FiEye,
  FiEyeOff,
  FiMapPin,
  FiLink,
  FiImage,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { bannerService, Banner } from '@/lib/api/services/bannerService';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';
import TextInput from '@/components/shared/TextInput';
import ImageCropModal from './ImageCropModal';

export default function BannerContent() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Create/Update Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: '',
    target_url: '',
    latitude: '',
    longitude: '',
    location_name: '',
  });

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Image Crop State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const fetchBanners = async (p = page) => {
    try {
      setIsLoading(true);
      const response = await bannerService.getMyBanners(p, 10);
      if (response && response.data && response.data.banners && Array.isArray(response.data.banners.items)) {
        setBanners(response.data.banners.items);
        if (response.data.banners._meta) {
          setTotalPages(response.data.banners._meta.pageCount);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch banners:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [page]);

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setForm({
        title: banner.title,
        target_url: banner.target_url,
        latitude: banner.latitude,
        longitude: banner.longitude,
        location_name: banner.location_name,
      });
      setImageSrc(banner.imageUrl);
    } else {
      setEditingBanner(null);
      setForm({
        title: '',
        target_url: '',
        latitude: '',
        longitude: '',
        location_name: '',
      });
      setImageFile(null);
      setImageSrc(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setEditingBanner(null);
      setImageFile(null);
      setImageSrc(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropSave = (croppedFile: File) => {
    setImageFile(croppedFile);
    const url = URL.createObjectURL(croppedFile);
    setImageSrc(url);
    setShowCropModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Title is required');
      return;
    }
    if (!editingBanner && !imageFile) {
      toast.error('Image is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editingBanner) {
        formData.append('id', editingBanner.id.toString());
      } else {
        formData.append('status', '10');
      }
      formData.append('name', form.title);
      formData.append('target_url', form.target_url);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('location_name', form.location_name);

      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      let response;
      if (editingBanner) {
        response = await bannerService.updateBanner(formData);
      } else {
        response = await bannerService.createBanner(formData);
      }

      if (response && (response.status === 200 || response.status === 201 || response.status === 1 || response.message?.toLowerCase().includes('success'))) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
        handleCloseModal();
        fetchBanners();
      } else {
        toast.error(response?.message || 'Failed to save banner');
      }
    } catch (error: any) {
      console.error('Failed to save banner:', error);
      toast.error(error?.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setBannerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    try {
      setIsDeleting(true);
      const response = await bannerService.deleteBanner(bannerToDelete);
      if (response && (response.status === 200 || response.status === 201 || response.status === 1 || response.message?.toLowerCase().includes('success'))) {
        toast.success('Banner deleted successfully');
        setShowDeleteModal(false);
        setBannerToDelete(null);
        fetchBanners();
      } else {
        toast.error(response?.message || 'Failed to delete banner');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete banner');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 10 ? 'Deactivate' : 'Activate';
    try {
      const response = await bannerService.toggleBannerStatus(id, newStatus);
      if (response && (response.status === 200 || response.status === 201 || response.status === 1 || response.message?.toLowerCase().includes('success'))) {
        toast.success(`Banner ${newStatus.toLowerCase()}d successfully`);
        fetchBanners();
      } else {
        toast.error(response?.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-outfit">My Banners</h2>
          <p className="text-gray-500 text-xs font-medium">Manage your promotional banners</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#8b2cf5] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          <FiPlus size={18} />
          Create Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b2cf5]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {banners.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
              <FiImage size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-bold text-lg">No banners found</p>
              <p className="text-gray-400 text-sm mt-1">Start by creating your first promotional banner</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative overflow-visible"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/9] rounded-t-[24px] overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Status Badge Over Image */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${banner.status === 10
                    ? 'bg-green-500/90 text-white'
                    : 'bg-gray-900/60 text-white'
                    }`}>
                    {banner.status == 10 ? "Active" : "Deactivated"}
                  </div>
                </div>

                {/* Actions Overlay (Moved outside to avoid clipping) */}
                <div className="absolute top-4 right-4 flex gap-2 z-30">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === banner.id ? null : banner.id);
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-all duration-300 ${activeMenuId === banner.id ? 'bg-[#8b2cf5] text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                        }`}
                    >
                      <FiMoreHorizontal size={20} />
                    </button>

                    {activeMenuId === banner.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] py-2 overflow-hidden animate-fadeIn"
                      >
                        <button
                          onClick={() => {
                            handleOpenModal(banner);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-xs font-bold text-gray-700 hover:bg-purple-50 hover:text-[#8b2cf5] transition-colors"
                        >
                          <FiEdit3 size={16} />
                          Edit Details
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(banner.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 size={16} />
                          Delete Banner
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#8b2cf5] transition-colors" title={banner.title}>
                      {banner.title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FiMapPin className="text-gray-400 shrink-0" size={14} />
                        <span className="truncate">{banner.location_name || 'No location set'}</span>
                      </div>
                    </div>
                  </div>

                  {banner.target_url && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100 overflow-hidden">
                      <FiLink className="text-gray-400 shrink-0" size={14} />
                      <a
                        href={banner.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8b2cf5] hover:underline truncate font-medium"
                      >
                        {banner.target_url}
                      </a>
                    </div>
                  )}

                  {/* Proper Activate/Deactivate Buttons */}
                  <div className="flex gap-3 pt-2 mt-auto">
                    <button
                      onClick={() => handleToggleStatus(banner.id, banner.status)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${banner.status === 10
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'
                        }`}
                    >
                      {banner.status === 10 ? (
                        <>
                          <FiEyeOff size={16} />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <FiEye size={16} />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenModal(banner)}
                      className="w-12 h-12 rounded-xl bg-purple-50 text-[#8b2cf5] hover:bg-[#8b2cf5] hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm"
                      title="Quick Edit"
                    >
                      <FiEdit3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === p
                ? 'bg-[#8b2cf5] text-white shadow-lg shadow-purple-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <div className="p-6 md:p-8 w-[800px] max-w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-outfit">
              {editingBanner ? 'Update Banner' : 'Create New Banner'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <TextInput
                  id='banner-title'
                  label="Banner Title*"
                  placeholder="e.g. Summer Sale 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  inputClassName="text-gray-900"
                />
                <TextInput
                  id='target-url'
                  label="Target URL"
                  placeholder="https://example.com"
                  value={form.target_url}
                  onChange={(e) => setForm({ ...form, target_url: e.target.value })}
                  inputClassName="text-gray-900"
                />
                <TextInput
                  id='location-name'
                  label="Location Name"
                  placeholder="Mumbai, India"
                  value={form.location_name}
                  onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                  inputClassName="text-gray-900"
                />
                {/* <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    id='latitude'
                    label="Latitude"
                    placeholder="19.0760"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    inputClassName="text-gray-900"
                  />
                  <TextInput
                    id='longitude'
                    label="Longitude"
                    placeholder="72.8777"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    inputClassName="text-gray-900"
                  />
                </div> */}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Banner Image*</label>
                <div
                  className={`relative aspect-[16/9] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${imageSrc ? 'border-purple-500' : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                    }`}
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  {imageSrc ? (
                    <>
                      <img src={imageSrc} className="w-full h-full object-cover" alt="Banner preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <FiImage size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upload Banner</p>
                    </div>
                  )}
                </div>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-[10px] text-gray-400 text-center">Recommended aspect ratio 16:9</p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl h-12 bg-[#8b2cf5] hover:bg-purple-700 shadow-lg shadow-purple-200"
                type="submit"
                isLoading={isSubmitting}
              >
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={imageSrc}
        onSave={onCropSave}
        onDelete={() => {
          setImageFile(null);
          setImageSrc(null);
        }}
        aspectRatio={16 / 9}
        title="Crop Banner Image"
        isCover={true}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => !isDeleting && setShowDeleteModal(false)}>
        <div className="p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiTrash2 className="text-red-500" size={36} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 font-outfit">Delete Banner?</h3>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Are you sure you want to delete this banner? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
