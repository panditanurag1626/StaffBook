import React, { useState } from 'react';
import { THEME } from '../../styles/theme';
import Card from '../shared/Card';
import { FiCopy, FiCheck, FiLinkedin, FiTwitter, FiMail, FiGlobe, FiShare2, FiDownload } from 'react-icons/fi';

const ResumeShare: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const profileUrl = "https://staffbook.com/profile/johndoe/resume";
  const shareText = "Check out my resume on Staffbook!";

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-6 ${THEME.layout.spacing.xl}`}>
      <div className="flex items-center justify-between">
        <h2 className={THEME.components.typography.sectionTitle}>
          Share Resume
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Share Options */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <div className={`p-2 bg-purple-50 ${THEME.components.icon.primary} rounded-lg`}>
                  <FiGlobe size={20} />
                </div>
                <h3 className={THEME.components.typography.cardTitle}>
                  Public Profile Link
                </h3>
              </div>
            </Card.Header>
            <Card.Content>
              <p className={`${THEME.components.typography.body} mb-4`}>
                Share this link with recruiters or add it to your social profiles. Anyone with the link can view your default resume.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 font-mono truncate">
                  {profileUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className={`${THEME.components.button.primary} px-6 flex items-center gap-2 min-w-[120px] justify-center`}
                >
                  {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FiShare2 size={20} />
                </div>
                <h3 className={THEME.components.typography.cardTitle}>
                  Social Share
                </h3>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                >
                  <FiLinkedin size={20} className="text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium text-gray-700 group-hover:text-blue-600">LinkedIn</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 transition-all group"
                >
                  <FiTwitter size={20} className="text-gray-400 group-hover:text-sky-600" />
                  <span className="font-medium text-gray-700 group-hover:text-sky-600">Twitter</span>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent("My Resume on Staffbook")}&body=${encodeURIComponent(shareText + " " + profileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                  <FiMail size={20} className="text-gray-400 group-hover:text-red-600" />
                  <span className="font-medium text-gray-700 group-hover:text-red-600">Email</span>
                </a>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* QR Code & Download */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center">
            <Card.Content>
              <div className="w-48 h-48 bg-gray-100 mx-auto rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-gray-400 text-sm">QR Code Placeholder</span>
              </div>
              <h3 className={`${THEME.components.typography.cardTitle} mb-2`}>
                Scan to View
              </h3>
              <p className={`${THEME.components.typography.body} mb-6`}>
                 recruiters can scan this code to instantly view your resume on their mobile device.
              </p>
              <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                <FiDownload size={16} />
                Download QR Code
              </button>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeShare;
