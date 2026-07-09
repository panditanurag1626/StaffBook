import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Share2, Copy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { skillGroups } from '../../data/profile';
import { SITE_CONFIG } from '../../constants/siteconfig';
import type { SkillGroup } from '../../types/profile';
import type { Skill } from '@/lib/api/types';
import ProfilePerformance from './ProfilePerformance';
import SkillModal from './SkillModal';
import { skillService } from '@/lib/api';

import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

interface SkillsSidebarProps {
  readOnly?: boolean;
  skills?: Skill[];
  title?: string;
}

const SkillsSidebar: React.FC<SkillsSidebarProps> = ({ readOnly = false, skills = [], title }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const { sectionId } = (e as CustomEvent).detail;
      if (sectionId === 'skills') {
        setEditingSkill(null);
        setModalOpen(true);
      }
    };
    window.addEventListener('profile:open-modal', handler);
    return () => window.removeEventListener('profile:open-modal', handler);
  }, []);

  const displayedSkills = showAll ? skills : skills.slice(0, 5);

  // Group skills by level if API data is available
  const groupedSkills = React.useMemo(() => {
    if (!displayedSkills || displayedSkills.length === 0) {
      // Return mapped fallback data locally if needed, but for API integration we focus on API data
      return [];
    }

    // Group skills by their proficiency level
    const grouped: { [key: string]: Skill[] } = {};
    displayedSkills.forEach(skill => {
      const lvl = skill.level || 'Beginner';
      if (!grouped[lvl]) {
        grouped[lvl] = [];
      }
      grouped[lvl].push(skill);
    });

    // Convert to array format
    return Object.entries(grouped).map(([level, groupedSkills]) => ({
      category: level,
      skills: groupedSkills
    }));
  }, [displayedSkills]);

  const handleAdd = () => {
    setEditingSkill(null);
    setModalOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    if (readOnly) return;
    setEditingSkill(skill);
    setModalOpen(true);
  };

  const handleSave = async (data: { title: string; level: string }) => {
    try {
      if (editingSkill) {
        // Update
        await skillService.updateSkill({
          id: editingSkill.id,
          title: data.title,
          level: data.level
        });
      } else {
        // Add
        await skillService.addSkill({
          title: data.title,
          level: data.level
        });
      }
      setModalOpen(false);
      toast.success('Skill saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to save skill:', error);
      toast.error('Failed to save skill.');
    }
  };

  const handleDelete = async () => {
    if (editingSkill) {
      try {
        await skillService.deleteSkill(editingSkill.id);
        setModalOpen(false);
        toast.success('Skill deleted successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete skill:', error);
        toast.error('Failed to delete skill.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div id="skills" className={`${THEME.components.card.default} flex flex-col gap-4`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={THEME.components.typography.sectionTitle}>{title || SITE_CONFIG.skills.section}</h3>
          {!readOnly && (
            <div className="flex gap-2">
              <button onClick={handleAdd} className={THEME.components.button.icon}>
                <Plus size={20} className={`text-purple-900`} />
              </button>
              {/* <div className={THEME.components.button.icon}>
                <Edit2 size={20} className={`text-purple-900`} />
              </div> */}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {groupedSkills.length > 0 ? (
            <>
              {groupedSkills.map((group, idx) => (
                <div key={group.category + idx}>
                  <div className={`${THEME.components.typography.cardTitle} mb-2 text-sm text-gray-500 uppercase tracking-wider`}>{group.category}</div>
                  <div className="flex flex-wrap gap-3 mb-2">
                    {group.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={`${THEME.components.badge.skill} cursor-pointer hover:bg-purple-100 transition-colors`}
                        onClick={() => handleEdit(skill)}
                      >
                        {skill.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {skills.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors mt-1 text-left w-fit"
                >
                  {showAll ? 'Show less' : `Show all ${skills.length} skills`}
                </button>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-sm">No skills added yet.</div>
          )}
        </div>
      </div>
      {!readOnly && (
        <div className="flex flex-col gap-2">


          <div className="w-full">
            <ProfilePerformance />
          </div>
        </div>
      )}

      <SkillModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingSkill}
        onSave={handleSave}
        onDelete={editingSkill ? handleDelete : undefined}
      />
    </div>
  );
};

export default SkillsSidebar;
