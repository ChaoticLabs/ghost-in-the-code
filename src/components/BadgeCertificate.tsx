/**
 * BadgeCertificate component - generates printable badge certificate
 * Provides print-friendly HTML template with ghost-themed design
 */

import { useRef } from 'react';
import type { Badge } from '../engine/types';
import { BADGE_DEFINITIONS } from '../data/badges';
import './BadgeCertificate.css';

interface BadgeCertificateProps {
  playerName: string;
  badges: Badge[];
  totalChallenges: number;
  onClose: () => void;
}

export const BadgeCertificate = ({ 
  playerName, 
  badges, 
  totalChallenges,
  onClose 
}: BadgeCertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate HTML content for download
    const certificateElement = certificateRef.current;
    if (!certificateElement) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ghost In The Code Certificate - ${playerName}</title>
  <style>
    ${getCertificateStyles()}
  </style>
</head>
<body>
  ${certificateElement.innerHTML}
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghost-in-the-code-certificate-${playerName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Group badges by category
  const conceptBadges = badges.filter(b => {
    const def = BADGE_DEFINITIONS.find(d => d.id === b.id);
    return def?.category === 'concept';
  });

  const achievementBadges = badges.filter(b => {
    const def = BADGE_DEFINITIONS.find(d => d.id === b.id);
    return def?.category === 'achievement';
  });

  const specialBadges = badges.filter(b => {
    const def = BADGE_DEFINITIONS.find(d => d.id === b.id);
    return def?.category === 'special';
  });

  return (
    <div className="certificate-modal-overlay" onClick={onClose}>
      <div className="certificate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="certificate-actions no-print">
          <button 
            className="certificate-button certificate-button--print" 
            onClick={handlePrint}
            aria-label="Print certificate"
          >
            🖨️ Print
          </button>
          <button 
            className="certificate-button certificate-button--download" 
            onClick={handleDownload}
            aria-label="Download certificate"
          >
            💾 Download
          </button>
          <button 
            className="certificate-button certificate-button--close" 
            onClick={onClose}
            aria-label="Close certificate"
          >
            ✕ Close
          </button>
        </div>

        <div ref={certificateRef} className="certificate-container">
          {/* Ghost-themed decorative border */}
          <div className="certificate-border">
            <div className="certificate-corner certificate-corner--tl">👻</div>
            <div className="certificate-corner certificate-corner--tr">👻</div>
            <div className="certificate-corner certificate-corner--bl">👻</div>
            <div className="certificate-corner certificate-corner--br">👻</div>
          </div>

          <div className="certificate-content">
            {/* Header */}
            <div className="certificate-header">
              <div className="certificate-ghost-icon">👻</div>
              <h1 className="certificate-title">Ghost In The Code Certificate</h1>
            </div>

            {/* Main content */}
            <div className="certificate-body">
              <p className="certificate-presented-to">This certificate is proudly presented to</p>
              <h2 className="certificate-player-name">{playerName}</h2>
              
              <p className="certificate-achievement">
                For successfully debugging haunted code and earning
              </p>
              
              <div className="certificate-badge-count">
                <span className="certificate-badge-number">{badges.length}</span>
                <span className="certificate-badge-label">Ghost In The Code Badge{badges.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Badge sections */}
              {conceptBadges.length > 0 && (
                <div className="certificate-badge-section">
                  <h3 className="certificate-section-title">Concept Mastery</h3>
                  <ul className="certificate-badge-list">
                    {conceptBadges.map(badge => (
                      <li key={badge.id} className="certificate-badge-item">
                        <span className="certificate-badge-icon">🏆</span>
                        <span className="certificate-badge-name">{badge.name}</span>
                        <span className="certificate-badge-date">{formatDate(badge.earnedDate)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {achievementBadges.length > 0 && (
                <div className="certificate-badge-section">
                  <h3 className="certificate-section-title">Achievements</h3>
                  <ul className="certificate-badge-list">
                    {achievementBadges.map(badge => (
                      <li key={badge.id} className="certificate-badge-item">
                        <span className="certificate-badge-icon">⭐</span>
                        <span className="certificate-badge-name">{badge.name}</span>
                        <span className="certificate-badge-date">{formatDate(badge.earnedDate)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {specialBadges.length > 0 && (
                <div className="certificate-badge-section">
                  <h3 className="certificate-section-title">Special Recognition</h3>
                  <ul className="certificate-badge-list">
                    {specialBadges.map(badge => (
                      <li key={badge.id} className="certificate-badge-item">
                        <span className="certificate-badge-icon">✨</span>
                        <span className="certificate-badge-name">{badge.name}</span>
                        <span className="certificate-badge-date">{formatDate(badge.earnedDate)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statistics */}
              <div className="certificate-stats">
                <div className="certificate-stat">
                  <span className="certificate-stat-value">{totalChallenges}</span>
                  <span className="certificate-stat-label">Challenges Completed</span>
                </div>
                <div className="certificate-stat">
                  <span className="certificate-stat-value">{badges.length}</span>
                  <span className="certificate-stat-label">Badges Earned</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="certificate-footer">
              <div className="certificate-date">
                <p>Certificate Generated</p>
                <p className="certificate-date-value">{currentDate}</p>
              </div>
              
              <div className="certificate-signature">
                <div className="certificate-signature-line"></div>
                <p className="certificate-signature-label">Educator Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Get certificate styles for standalone HTML download
 */
function getCertificateStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: white;
      padding: 20px;
    }

    .certificate-container {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 40px;
      position: relative;
    }

    .certificate-border {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 4px solid #6B46C1;
      border-radius: 8px;
      pointer-events: none;
    }

    .certificate-corner {
      position: absolute;
      font-size: 32px;
      line-height: 1;
    }

    .certificate-corner--tl { top: -16px; left: -16px; }
    .certificate-corner--tr { top: -16px; right: -16px; }
    .certificate-corner--bl { bottom: -16px; left: -16px; }
    .certificate-corner--br { bottom: -16px; right: -16px; }

    .certificate-content {
      position: relative;
      z-index: 1;
      text-align: center;
    }

    .certificate-header {
      margin-bottom: 40px;
    }

    .certificate-ghost-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .certificate-title {
      font-size: 36px;
      color: #6B46C1;
      margin-bottom: 8px;
      font-weight: bold;
    }

    .certificate-subtitle {
      font-size: 18px;
      color: #666;
    }

    .certificate-body {
      margin-bottom: 40px;
    }

    .certificate-presented-to {
      font-size: 18px;
      color: #666;
      margin-bottom: 16px;
    }

    .certificate-player-name {
      font-size: 42px;
      color: #1A1F2E;
      margin-bottom: 24px;
      font-weight: bold;
      border-bottom: 2px solid #6B46C1;
      display: inline-block;
      padding-bottom: 8px;
    }

    .certificate-achievement {
      font-size: 18px;
      color: #666;
      margin-bottom: 24px;
    }

    .certificate-badge-count {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 32px;
    }

    .certificate-badge-number {
      font-size: 72px;
      color: #6B46C1;
      font-weight: bold;
      line-height: 1;
    }

    .certificate-badge-label {
      font-size: 20px;
      color: #666;
      margin-top: 8px;
    }

    .certificate-badge-section {
      margin-bottom: 32px;
      text-align: left;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .certificate-section-title {
      font-size: 20px;
      color: #6B46C1;
      margin-bottom: 16px;
      text-align: center;
      font-weight: bold;
    }

    .certificate-badge-list {
      list-style: none;
    }

    .certificate-badge-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .certificate-badge-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .certificate-badge-name {
      flex: 1;
      font-size: 16px;
      color: #1A1F2E;
      font-weight: 500;
    }

    .certificate-badge-date {
      font-size: 14px;
      color: #666;
      flex-shrink: 0;
    }

    .certificate-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 2px solid #eee;
    }

    .certificate-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .certificate-stat-value {
      font-size: 36px;
      color: #6B46C1;
      font-weight: bold;
    }

    .certificate-stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .certificate-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 48px;
      padding-top: 32px;
      border-top: 2px solid #eee;
    }

    .certificate-date {
      text-align: left;
    }

    .certificate-date p {
      font-size: 14px;
      color: #666;
    }

    .certificate-date-value {
      font-size: 16px;
      color: #1A1F2E;
      font-weight: 500;
      margin-top: 4px;
    }

    .certificate-signature {
      text-align: right;
    }

    .certificate-signature-line {
      width: 200px;
      height: 2px;
      background: #1A1F2E;
      margin-bottom: 8px;
    }

    .certificate-signature-label {
      font-size: 14px;
      color: #666;
    }

    @media print {
      body {
        padding: 0;
      }

      .certificate-container {
        max-width: 100%;
        min-height: 100vh;
        page-break-after: always;
      }
    }
  `;
}
