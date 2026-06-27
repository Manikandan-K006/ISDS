import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  FiFileText, FiSearch, FiDownload, FiX, FiAward, FiUser, FiCalendar,
  FiCheck, FiCopy, FiExternalLink, FiPrinter, FiShare2, FiLinkedin,
  FiMail, FiMessageCircle, FiImage, FiMoreHorizontal, FiBook, FiClock,
  FiDownloadCloud, FiTrash2, FiShield,
} from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { formatDate } from '../../utils/helpers';
import { Card, Input, Button, Badge } from '../../components/ui';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';
import { downloadCertificate } from '../../utils/downloadCertificate';
import { trackDownload, trackShare, getCertificateFileUrl } from '../../api/certificates';
import toast from 'react-hot-toast';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://isds-kappa.vercel.app';

const Certificates = () => {
  const { certificates, loading, error } = useStudentData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleCopy = (text, label = 'Certificate ID copied') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const handleDownloadPDF = useCallback(async (cert, e) => {
    if (e) e.stopPropagation();
    try {
      await downloadCertificate(cert);
      await trackDownload(cert._id).catch(() => {});
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to download PDF');
    }
  }, []);

  const handleDownloadDOCX = async (cert, e) => {
    if (e) e.stopPropagation();
    try {
      const url = getCertificateFileUrl(cert.certificateId, 'docx');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cert.certificateId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await trackDownload(cert._id).catch(() => {});
      toast.success('DOCX downloaded');
    } catch {
      toast.error('Failed to download DOCX');
    }
  };

  const handlePrint = (cert) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Certificate - ${cert.certificateId}</title>
      <style>
        @page { size: landscape; margin: 15mm; }
        body { font-family: 'Times New Roman', serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fafafa; }
        .cert { width: 277mm; height: 190mm; background: #fff; border: 3px solid #d4af37; padding: 20px; box-sizing: border-box; text-align: center; position: relative; }
        .gold-bar { height: 4px; background: #d4af37; margin: -20px -20px 10px -20px; }
        .gold-bar-bottom { height: 4px; background: #d4af37; margin: 10px -20px -20px -20px; position: absolute; bottom: 20px; left: 0; right: 0; }
        h1 { color: #141e30; font-size: 28px; margin-top: 30px; letter-spacing: 2px; }
        .sub { color: #64748b; font-size: 14px; margin: 8px 0; }
        .name { font-size: 36px; font-style: italic; color: #0f172a; margin: 15px 0; font-weight: bold; }
        .course { font-size: 22px; color: #1e40af; font-weight: bold; margin: 10px 0; }
        .details { font-size: 13px; color: #475569; margin: 12px 0; }
        .footer { position: absolute; bottom: 40px; left: 30px; right: 30px; }
        .sig { float: left; text-align: left; }
        .sig-right { float: right; text-align: right; }
        .sig-line { width: 200px; border-top: 1px solid #94a3b8; margin-bottom: 4px; }
        .verify { font-size: 10px; color: #94a3b8; text-align: center; clear: both; padding-top: 20px; }
        table { margin: 15px auto; border-collapse: collapse; }
        td { padding: 4px 20px; font-size: 13px; color: #475569; }
        td:first-child { font-weight: bold; color: #d4af37; font-size: 10px; text-transform: uppercase; }
      </style></head><body>
      <div class="cert">
        <div class="gold-bar"></div>
        <p class="sub">ISDS — Intelligent Student Development System</p>
        <h1>CERTIFICATE OF COMPLETION</h1>
        <p class="sub">This is to certify that</p>
        <p class="name">${cert.studentName}</p>
        <p class="sub">has successfully completed the course</p>
        <p class="course">${cert.courseName}</p>
        ${cert.duration ? `<p class="sub">Duration: ${cert.duration}</p>` : ''}
        <table>
          <tr><td>Grade</td><td>${cert.grade}</td><td>Completion Date</td><td>${formatDate(cert.completionDate || cert.issueDate)}</td></tr>
          <tr><td>Certificate ID</td><td colspan="3">${cert.certificateId}</td></tr>
        </table>
        <div class="footer">
          <div class="sig"><div class="sig-line"></div>Manikandan<br><span style="font-size:11px;color:#94a3b8;">Instructor</span></div>
          <div class="sig-right"><div class="sig-line"></div>Mani K<br><span style="font-size:11px;color:#94a3b8;">Director</span></div>
          <div class="verify">ISDS — Intelligent Student Development System | ${FRONTEND_URL}/verify/${cert.certificateId}</div>
        </div>
        <div class="gold-bar-bottom"></div>
      </div>
      <script>window.print();</script></body></html>
    `);
    win.document.close();
  };

  const handleShare = async (cert, platform) => {
    const url = `${FRONTEND_URL}/verify/${cert.certificateId}`;
    const text = `I earned my "${cert.courseName}" certificate from ISDS! Check it out: ${url}`;

    await trackShare(cert._id).catch(() => {});

    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`My ${cert.courseName} Certificate from ISDS`)}&body=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        await handleCopy(url, 'Verification link copied');
        break;
    }
  };

  if (loading) return <ListSkeleton count={3} />;

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
  );

  const filtered = certificates.filter(cert => {
    const matchesSearch = cert.courseName?.toLowerCase().includes(search.toLowerCase()) ||
      cert.certificateId?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && cert.status !== 'revoked';
    if (activeTab === 'revoked') return matchesSearch && cert.status === 'revoked';
    return matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'All', count: certificates.length },
    { id: 'active', label: 'Active', count: certificates.filter(c => c.status !== 'revoked').length },
    { id: 'revoked', label: 'Revoked', count: certificates.filter(c => c.status === 'revoked').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text">My Certificates</h1>
          <p className="text-sm theme-text-muted mt-1">View, download, and share your earned certificates</p>
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

      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/50 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 shadow-sm theme-text'
                : 'theme-text-muted hover:theme-text'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cert => (
            <Card key={cert._id} hover className={`p-5 cursor-pointer ${cert.status === 'revoked' ? 'opacity-60' : ''}`} onClick={() => setSelected(cert)}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cert.status === 'revoked' ? 'bg-rose-500/10' : 'bg-indigo-500/10'}`}>
                  <FiFileText className={cert.status === 'revoked' ? 'text-rose-400' : 'text-indigo-400'} size={22} />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" icon={FiDownload} onClick={e => handleDownloadPDF(cert, e)} title="Download PDF" />
                  <Button variant="ghost" size="sm" icon={FiShare2} onClick={e => { e.stopPropagation(); setSelected(cert); }} title="Share" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {cert.status === 'revoked' && <Badge color="rose">Revoked</Badge>}
                <Badge color={cert.grade === 'A+' || cert.grade === 'A' ? 'emerald' : cert.grade === 'B+' || cert.grade === 'B' ? 'indigo' : 'amber'}>{cert.grade}</Badge>
              </div>

              <h3 className="text-sm font-semibold theme-text mb-3">{cert.courseName}</h3>
              <div className="space-y-1.5 text-xs theme-text-muted">
                <div className="flex items-center gap-2">
                  <FiCalendar size={12} />
                  <span>{formatDate(cert.completionDate || cert.issueDate || cert.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUser size={12} />
                  <span>{cert.studentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBook size={12} />
                  <span>{cert.duration || 'Self-paced'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield size={12} />
                  <code className="text-[10px] font-mono text-indigo-400">{cert.certificateId}</code>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      ) : (
        <Card className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/5 flex items-center justify-center mx-auto mb-4 border border-indigo-500/10">
            <FiAward className="theme-text-muted" size={32} />
          </div>
          <h3 className="text-lg font-medium theme-text mb-1">No certificates found</h3>
          <p className="text-sm theme-text-muted">
            {search ? 'Try adjusting your search' : 'Complete a course to earn your first certificate'}
          </p>
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 theme-overlay"
          onClick={() => setSelected(null)}
        >
          <Card className="p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold theme-text">Certificate Details</h2>
              <Button variant="ghost" size="sm" icon={FiX} onClick={() => setSelected(null)} />
            </div>

            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <QRCodeSVG
                    value={`${FRONTEND_URL}/verify/${selected.certificateId}`}
                    size={140}
                  />
                </div>
              </div>

              <div className="text-center">
                <h3 className="theme-text font-semibold text-lg">{selected.courseName}</h3>
                <p className="text-xs theme-text-muted mt-1">Certificate of Completion</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge color={selected.grade === 'A+' || selected.grade === 'A' ? 'emerald' : 'indigo'}>{selected.grade}</Badge>
                  {selected.status === 'revoked' && <Badge color="rose">Revoked</Badge>}
                </div>
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

              <div className="theme-subtle rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Student</span>
                  <span className="theme-text font-medium">{selected.studentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Completion Date</span>
                  <span className="theme-text">{formatDate(selected.completionDate || selected.issueDate || selected.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Issue Date</span>
                  <span className="theme-text">{formatDate(selected.issueDate || selected.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Duration</span>
                  <span className="theme-text">{selected.duration || 'Self-paced'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Instructor</span>
                  <span className="theme-text">{selected.instructor || 'Manikandan'}</span>
                </div>
                {selected.percentage && (
                  <div className="flex justify-between text-sm">
                    <span className="theme-text-muted">Score</span>
                    <span className="theme-text font-medium">{selected.percentage}%</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <p className="text-xs font-medium theme-text-muted uppercase tracking-wider">Download</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" size="sm" className="flex-col py-3 h-auto gap-1" onClick={e => handleDownloadPDF(selected, e)} disabled={selected.status === 'revoked'}>
                    <FiDownloadCloud size={16} />
                    <span className="text-[10px]">PDF</span>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-col py-3 h-auto gap-1" onClick={e => handleDownloadDOCX(selected, e)} disabled={selected.status === 'revoked'}>
                    <FiFileText size={16} />
                    <span className="text-[10px]">DOCX</span>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-col py-3 h-auto gap-1" onClick={() => handlePrint(selected)} disabled={selected.status === 'revoked'}>
                    <FiPrinter size={16} />
                    <span className="text-[10px]">Print</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium theme-text-muted uppercase tracking-wider">Share</p>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="secondary" size="sm" className="flex-col py-2.5 h-auto gap-1" onClick={() => handleShare(selected, 'linkedin')}>
                    <FiLinkedin size={15} />
                    <span className="text-[9px]">LinkedIn</span>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-col py-2.5 h-auto gap-1" onClick={() => handleShare(selected, 'whatsapp')}>
                    <FiMessageCircle size={15} />
                    <span className="text-[9px]">WhatsApp</span>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-col py-2.5 h-auto gap-1" onClick={() => handleShare(selected, 'email')}>
                    <FiMail size={15} />
                    <span className="text-[9px]">Email</span>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-col py-2.5 h-auto gap-1" onClick={() => handleShare(selected, 'copy')}>
                    <FiCopy size={15} />
                    <span className="text-[9px]">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href={`${FRONTEND_URL}/verify/${selected.certificateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="secondary" className="w-full" icon={FiExternalLink}>
                    Verify Online
                  </Button>
                </a>
                <Button variant="secondary" className="flex-1" icon={FiDownload} onClick={e => handleDownloadPDF(selected, e)} disabled={selected.status === 'revoked'}>
                  Download
                </Button>
              </div>

              {selected.downloadCount > 0 && (
                <p className="text-[10px] text-center theme-text-muted">
                  Downloaded {selected.downloadCount} time{selected.downloadCount !== 1 ? 's' : ''}
                  {selected.verifiedCount > 0 ? ` · Verified ${selected.verifiedCount} times` : ''}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Certificates;
