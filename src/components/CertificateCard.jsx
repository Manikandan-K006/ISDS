import { FiDownload, FiShare2, FiAward } from 'react-icons/fi';
import { useRef } from 'react';
import { formatDate } from '../utils/helpers';

const CertificateCard = ({ certificate, onDownload }) => {
  const cardRef = useRef(null);

  return (
    <div ref={cardRef} className="glass rounded-xl p-6 border theme-border relative overflow-hidden group hover:border-indigo-500/30 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-y-12 -translate-x-12" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
            <FiAward className="theme-text" size={22} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => onDownload?.(certificate)} className="p-2 rounded-lg theme-input hover:bg-white/10 theme-text-muted hover:theme-text transition-colors">
              <FiDownload size={16} />
            </button>
            <button className="p-2 rounded-lg theme-input hover:bg-white/10 theme-text-muted hover:theme-text transition-colors">
              <FiShare2 size={16} />
            </button>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="text-2xl font-bold theme-text mb-1">Certificate of Completion</div>
          <div className="theme-text-muted text-sm mb-4">This certifies that</div>
          <div className="text-xl font-semibold text-indigo-400 mb-4">Arjun Sharma</div>
          <div className="theme-text text-sm mb-1">has successfully completed the course</div>
          <div className="text-lg font-semibold theme-text mb-4">{certificate.courseName}</div>
          <div className="flex justify-center gap-6 text-xs theme-text-muted mb-4">
            <span>Date: {formatDate(certificate.issuedAt)}</span>
            <span>Grade: {certificate.grade}</span>
            {certificate.creditPoints > 0 && <span>Credits: {certificate.creditPoints}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between border-t theme-border pt-4">
          <div className="text-xs theme-text-muted">
            <div className="font-medium theme-text-muted">{certificate.instructor}</div>
            <div>Instructor</div>
          </div>
          <div className="text-right text-xs theme-text-muted">
            <div className="font-medium theme-text-muted">ISDS</div>
            <div>School Seal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
