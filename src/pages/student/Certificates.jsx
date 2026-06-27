import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FiFileText, FiSearch, FiDownload, FiX, FiAward, FiUser, FiCalendar, FiCheck, FiCopy, FiExternalLink } from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { formatDate } from '../../utils/helpers';
import { Card, Input, Button } from '../../components/ui';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';

const Certificates = () => {
  const { certificates, loading, error } = useStudentData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Certificate ID copied');
  };

  if (loading) return <ListSkeleton count={3} />;

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
  );

  const filtered = certificates.filter(cert =>
    cert.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text">Certificates</h1>
          <p className="text-sm theme-text-muted mt-1">Your earned certificates</p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            icon={FiSearch}
            placeholder="Search certificates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cert => (
            <Card key={cert._id} hover className="p-5 cursor-pointer" onClick={() => setSelected(cert)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <FiFileText className="text-indigo-400" size={22} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiDownload}
                  onClick={e => { e.stopPropagation(); }}
                />
              </div>
              <h3 className="text-sm font-semibold theme-text mb-3">{cert.courseName}</h3>
              <div className="space-y-1.5 text-xs theme-text-muted">
                <div className="flex items-center gap-2">
                  <FiCalendar size={12} />
                  <span>Issued {formatDate(cert.issuedAt || cert.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward size={12} />
                  <span>Grade: <span className="text-indigo-400 font-medium">{cert.grade}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUser size={12} />
                  <span>{cert.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck size={12} />
                  <span className="text-emerald-400">QR Verified</span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <FiFileText className="mx-auto theme-text-muted mb-4" size={48} />
          <h3 className="text-lg font-medium theme-text mb-1">No certificates found</h3>
          <p className="text-sm theme-text-muted">Try adjusting your search</p>
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 theme-overlay"
          onClick={() => setSelected(null)}
        >
          <Card className="p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold theme-text">Certificate Details</h2>
              <Button variant="ghost" size="sm" icon={FiX} onClick={() => setSelected(null)} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-xl">
                  <QRCodeSVG
                    value={selected.qrData || `${window.location.origin}/verify/${selected.certificateId}`}
                    size={140}
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="theme-text font-semibold">{selected.courseName}</h3>
                <p className="text-xs theme-text-muted mt-1">Certificate of Completion</p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <code className="text-xs font-mono theme-text-muted bg-theme-hover px-3 py-1.5 rounded-lg">
                  {selected.certificateId}
                </code>
                <button
                  onClick={() => handleCopy(selected.certificateId)}
                  className="p-1.5 rounded-lg hover:bg-theme-hover theme-text-muted transition-colors"
                  title="Copy certificate ID"
                >
                  <FiCopy size={14} />
                </button>
              </div>

              <div className="theme-subtle rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Issue Date</span>
                  <span className="theme-text">{formatDate(selected.issuedAt || selected.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Grade Achieved</span>
                  <span className="text-indigo-400 font-medium">{selected.grade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Instructor</span>
                  <span className="theme-text">{selected.instructor}</span>
                </div>
                {selected.creditPoints > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="theme-text-muted">Credit Points</span>
                    <span className="theme-text">{selected.creditPoints}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" icon={FiDownload}>
                  Download
                </Button>
                <a
                  href={selected.qrData || `/verify/${selected.certificateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="secondary" className="w-full" icon={FiExternalLink}>
                    Verify
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Certificates;
