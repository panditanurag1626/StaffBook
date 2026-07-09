'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '../shared/Button';
import { THEME } from '../../styles/theme';
import type { Skill } from '@/lib/api/types';

interface SkillModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: Skill | null;
    onSave: (skill: { title: string; level: string }) => void;
    onDelete?: () => void;
}

const levels = ['Beginner', 'Intermediate', 'Expert', 'Master'];

export default function SkillModal({ open, onClose, initialData, onSave, onDelete }: SkillModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        level: 'Beginner',
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                level: initialData.level || 'Beginner',
            });
        } else {
            setFormData({
                title: '',
                level: 'Beginner',
            });
        }
    }, [initialData, open]);

    if (!open || !mounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className={`${THEME.colors.background.card} rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Skill' : 'Add Skill'}
                    </h2>
                    <button onClick={onClose} className={THEME.components.button.icon}>
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Skill Name</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={THEME.components.input.default}
                                placeholder="Ex: React, Python, Project Management"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Proficiency Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className={THEME.components.input.default}
                            >
                                {levels.map((lvl) => (
                                    <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex justify-between gap-3 bg-gray-50">
                    {initialData && onDelete ? (
                        <Button variant="danger" onClick={onDelete}>Delete Skill</Button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={() => handleSubmit({ preventDefault: () => { } } as any)}>Save Skill</Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
