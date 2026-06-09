import { useState } from 'react';
import { FiFileText, FiSearch, FiDownload, FiX, FiAward, FiUser, FiCalendar } from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { formatDate } from '../../utils/helpers';
import { Card, Input, Button } from '../../components/ui';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';

const Certificates = () => {
  const { certificates, loading, error } = useStudentData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

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
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-sm text-slate-500 mt-1">Your earned certificates</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <h3 className="text-sm font-semibold text-white mb-3">{cert.courseName}</h3>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <FiCalendar size={12} />
                  <span>Issued {formatDate(cert.issuedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward size={12} />
                  <span>Grade: <span className="text-indigo-400 font-medium">{cert.grade}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUser size={12} />
                  <span>{cert.instructor}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FiFileText className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-white mb-1">No certificates found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search</p>
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setSelected(null)}
        >
          <Card className="p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Certificate Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
              >
                <FiX className="text-slate-400" size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
                <FiFileText className="text-indigo-400" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold">{selected.courseName}</h3>
                <p className="text-sm text-slate-400 mt-1">Certificate of Completion</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Issue Date</span>
                  <span className="text-white">{formatDate(selected.issuedAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Grade Achieved</span>
                  <span className="text-indigo-400 font-medium">{selected.grade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Instructor</span>
                  <span className="text-white">{selected.instructor}</span>
                </div>
                {selected.creditPoints > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Credit Points</span>
                    <span className="text-white">{selected.creditPoints}</span>
                  </div>
                )}
              </div>
              <Button variant="secondary" className="w-full" icon={FiDownload}>
                Download Certificate
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Certificates;
