'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Award, Calendar, LinkIcon } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteconfig';
import type { Certification } from '../../types/profile';
import CertificationModal from './CertificationModal';
import { THEME } from '../../styles/theme';
import Button from '../shared/Button';
import ConfirmModal from '../shared/ConfirmModal';
import { certificationService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import type { APICertification } from '@/lib/api/types';

const defaultCertification: Certification = {
  name: '',
  role: '',
  startYear: '',
  startMonth: '',
  endYear: '',
  endMonth: '',
  description: '',
  skills: [],
  credentialId: '',
  url: '',
  institution: '',
  location: '',
  issued: '',
  expires: '',
  credentialIdOld: '',
  descriptionOld: '',
  urlOld: '',
};

interface CertificationsSectionProps {
  certifications?: APICertification[];
  readOnly?: boolean;
}

export default function CertificationsSection({ certifications: apiCerts = [], readOnly = false }: CertificationsSectionProps) {
  const convertedCerts: Certification[] = apiCerts.map(c => {
    let startYear = '', startMonth = '';
    if (c.issue_date) {
      const date = new Date(c.issue_date);
      startYear = date.getFullYear().toString();
      startMonth = date.toLocaleString('default', { month: 'short' });
    }

    let endYear = '', endMonth = '';
    if (c.expiration_date) {
      const date = new Date(c.expiration_date);
      endYear = date.getFullYear().toString();
      endMonth = date.toLocaleString('default', { month: 'short' });
    }

    return {
      id: c.id,
      name: c.name,
      role: '',
      startYear,
      startMonth,
      endYear,
      endMonth,
      description: c.description || '',
      skills: [], // Assuming api doesn't store this directly or format is missing from response payload given earlier
      credentialId: c.credential_id || '',
      url: c.credential_url || '',
      institution: c.issuing_organization || '',
      location: '',
      issued: '',
      expires: '',
      credentialIdOld: '',
      descriptionOld: '',
      urlOld: '',
    };
  });

  const [certifications, setCertifications] = useState<Certification[]>(convertedCerts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handler = (e: Event) => {
      const { sectionId } = (e as CustomEvent).detail;
      if (sectionId === 'certifications') {
        setEditingIndex(null);
        setModalOpen(true);
      }
    };
    window.addEventListener('profile:open-modal', handler);
    return () => window.removeEventListener('profile:open-modal', handler);
  }, []);

  React.useEffect(() => {
    // Sync when api certs change
    const reconverted = apiCerts.map(c => {
      let startYear = '', startMonth = '';
      if (c.issue_date) {
        const date = new Date(c.issue_date);
        startYear = date.getFullYear().toString();
        startMonth = date.toLocaleString('default', { month: 'short' });
      }
      let endYear = '', endMonth = '';
      if (c.expiration_date) {
        const date = new Date(c.expiration_date);
        endYear = date.getFullYear().toString();
        endMonth = date.toLocaleString('default', { month: 'short' });
      }

      return {
        id: c.id,
        name: c.name,
        role: '',
        startYear,
        startMonth,
        endYear,
        endMonth,
        description: c.description || '',
        skills: [],
        credentialId: c.credential_id || '',
        url: c.credential_url || '',
        institution: c.issuing_organization || '',
        location: '',
        issued: '',
        expires: '',
        credentialIdOld: '',
        descriptionOld: '',
        urlOld: '',
      };
    });
    setCertifications(reconverted);
  }, [apiCerts]);

  const handleAdd = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setModalOpen(true);
  };

  const handleSave = async (cert: Certification) => {
    const monthMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    let issue_date = '';
    if (cert.startYear && cert.startMonth) {
      const mm = monthMap[cert.startMonth] || '01';
      issue_date = `${cert.startYear}-${mm}-01`;
    }

    let expiration_date = '';
    if (cert.endYear && cert.endMonth) {
      const mm = monthMap[cert.endMonth] || '01';
      expiration_date = `${cert.endYear}-${mm}-01`;
    }

    try {
      if (editingIndex === null) {
        // Add
        await certificationService.addCertification({
          name: cert.name,
          issuing_organization: cert.institution,
          issue_date,
          expiration_date,
          credential_id: cert.credentialId || '',
          credential_url: cert.url || '',
          description: cert.description || ''
        });
      } else {
        // Update
        const originalCert = apiCerts[editingIndex];
        if (!originalCert) return;

        await certificationService.updateCertification({
          id: originalCert.id,
          name: cert.name,
          issuing_organization: cert.institution,
          issue_date,
          expiration_date,
          credential_id: cert.credentialId || '',
          credential_url: cert.url || '',
          description: cert.description || ''
        });
      }
      await refreshUser();
      setModalOpen(false);
      toast.success('Certification saved successfully!');
    } catch (error) {
      console.error('Failed to save certification:', error);
      toast.error('Failed to save certification. Please try again.');
      throw error;
    }
  };

  const handleDeleteClick = () => {
    if (editingIndex !== null) {
      setDeleteConfirmIndex(editingIndex);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmIndex !== null) {
      const originalCert = apiCerts[deleteConfirmIndex];
      if (originalCert) {
        setIsDeleting(true);
        try {
          await certificationService.deleteCertification(originalCert.id);
          await refreshUser();
          setModalOpen(false);
          setDeleteConfirmIndex(null);
          toast.success('Certification deleted successfully!');
        } catch (error) {
          console.error('Failed to delete certification:', error);
          toast.error('Failed to delete certification.');
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  return (
    <div id="certifications" className={`${THEME.components.card.default} flex flex-col gap-4 relative`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={THEME.components.typography.sectionTitle}>{SITE_CONFIG.certificationsSection.section}</h2>
        {!readOnly && (
          <div className="flex gap-2 absolute top-4 right-4">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-9 h-9 hover:bg-purple-100 transition-colors"
              onClick={handleAdd}
              aria-label="Add Certification"
            >
              <Plus size={20} className={`text-[${THEME.colors.primary}]`} />
            </Button>
          </div>
        )}
      </div>
      {certifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm font-medium">No certifications added yet.</p>
        </div>
      ) : certifications.map((cert: Certification, idx: number) => (
        <div key={cert.name + idx} className={`${THEME.colors.background.input} rounded-xl p-4 flex flex-col gap-2 relative`}>
          {!readOnly && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full w-8 h-8"
                onClick={() => handleEdit(idx)}
                aria-label="Edit Certification"
              >
                <Edit2 size={16} className={`text-[${THEME.colors.primary}]`} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full w-8 h-8"
                onClick={() => {
                  setEditingIndex(idx);
                  setDeleteConfirmIndex(idx);
                }}
                aria-label="Delete Certification"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className={THEME.components.typography.cardTitle}>{cert.name}</div>
          </div>
          <div className={`flex items-center gap-2 ${THEME.components.typography.meta} mb-1`}>
            <Award size={14} className="inline-block" />
            <span className="font-medium">{cert.institution}</span>
          </div>
          <div className={`flex items-center gap-2 ${THEME.components.typography.meta} mb-1`}>
            <Calendar size={14} className="inline-block" />
            <span>
              Issued {cert.startMonth} {cert.startYear} {cert.endMonth && cert.endYear ? `• Expires ${cert.endMonth} ${cert.endYear}` : ''}
            </span>
          </div>

          <div className={`mt-2 ${THEME.components.typography.body}`}>
            {cert.description && (
              <div 
                className="mb-3"
                dangerouslySetInnerHTML={{ __html: cert.description }}
              />
            )}

            {(cert.credentialId || cert.url) && (
              <div className="flex flex-col gap-1 text-sm text-gray-600">
                {cert.credentialId && (
                  <div>
                    <span className="font-medium">Credential ID:</span> {cert.credentialId}
                  </div>
                )}
                {cert.url && (
                  <div className="mt-1">
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className={`${THEME.components.typography.link} flex items-center gap-1.5 font-medium`}>
                      <LinkIcon size={14} />
                      View Certificate
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      <CertificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingIndex === null ? defaultCertification : certifications[editingIndex]}
        onSave={handleSave}
        onDelete={editingIndex !== null ? handleDeleteClick : undefined}
      />
      <ConfirmModal
        open={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={confirmDelete}
        title="Delete Certification"
        message="Are you sure you want to delete this certification? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}