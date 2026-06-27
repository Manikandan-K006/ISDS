import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FiCheckCircle, FiXCircle, FiSearch, FiExternalLink, FiAward, FiUser, FiCalendar, FiBook, FiMail, FiStar, FiShield, FiClock, FiHash } from 'react-icons/fi';
import { verifyCertificate } from '../../api/certificates';
import { formatDate } from '../../utils/helpers';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualId, setManualId] = useState(certificateId || '');
  const [error, setError] = useState(null);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    if (certificateId) {
      setLoading(true);
      setError(null);
      verifyCertificate(certificateId)
        .then(r => { setResult(r); setTimeout(() => setAnim(true), 100); })
        .catch(err => setError(err.response?.data?.message || err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [certificateId]);

  const handleVerify = async () => {
    if (!manualId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAnim(false);
    try {
      const r = await verifyCertificate(manualId.trim());
      setResult(r);
      setTimeout(() => setAnim(true), 100);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col">
      <header className="border-b theme-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-[10px]">IS</span>
            </div>
            <span className="text-sm font-semibold theme-text">ISDS</span>
          </Link>
          <div className="flex items-center gap-2">
            <FiShield className="text-emerald-400" size={14} />
            <span className="text-xs theme-text-muted">Certificate Verification</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center mx-auto mb-4 border border-indigo-500/10">
              <FiAward className="text-indigo-400" size={30} />
            </div>
            <h1 className="text-2xl font-bold theme-text">Certificate Verification</h1>
            <p className="text-sm theme-text-muted mt-1.5">Verify the authenticity of an ISDS certificate</p>
          </div>

          {!certificateId && (
            <div className="theme-card border theme-border rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder="Enter certificate ID (e.g. ISDS-2026-FSWD-000001)"
                  className="flex-1 px-4 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-theme-muted"
                />
                <button
                  onClick={handleVerify}
                  disabled={loading || !manualId.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSearch size={15} />}
                  Verify
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm theme-text-muted">Verifying certificate...</p>
            </div>
          )}

          {error && !loading && (
            <div className="theme-card border border-rose-500/20 rounded-xl p-10 text-center shadow-sm">
              <FiXCircle className="mx-auto text-rose-400 mb-4" size={52} />
              <h2 className="text-xl font-semibold theme-text mb-2">Verification Failed</h2>
              <p className="text-sm theme-text-muted">{error}</p>
              {certificateId && (
                <Link to="/verify" className="inline-flex items-center gap-1.5 mt-6 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  <FiExternalLink size={14} />
                  Try another certificate
                </Link>
              )}
            </div>
          )}

          {result && !loading && (
            <div className={`theme-card border-2 rounded-xl overflow-hidden shadow-lg transition-all duration-500 ${result.valid ? 'border-emerald-500/20' : 'border-rose-500/20'} ${anim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`p-6 text-center ${result.valid ? 'bg-gradient-to-b from-emerald-500/5 to-transparent' : 'bg-gradient-to-b from-rose-500/5 to-transparent'}`}>
                {result.valid ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20">
                      <FiCheckCircle className="text-emerald-400" size={36} />
                    </div>
                    <h2 className="text-lg font-bold text-emerald-400">Verified</h2>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border-2 border-rose-500/20">
                      <FiXCircle className="text-rose-400" size={36} />
                    </div>
                    <h2 className="text-lg font-bold text-rose-400">{result.message || 'Invalid Certificate'}</h2>
                    {result.status && <span className="text-xs capitalize bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full">{result.status}</span>}
                  </div>
                )}
              </div>

              {result.valid && (
                <>
                  <div className="flex justify-center -mt-2">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                      <QRCodeSVG value={`${window.location.origin}/verify/${result.certificateId}`} size={110} />
                    </div>
                  </div>

                  <div className="px-6 pb-6 space-y-0.5">
                    <div className="grid grid-cols-2 gap-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="bg-white dark:bg-slate-800 p-3.5">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FiUser size={10} /> Student</p>
                        <p className="text-sm font-semibold theme-text">{result.studentName}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3.5">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FiBook size={10} /> Course</p>
                        <p className="text-sm font-semibold theme-text">{result.courseName}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3.5">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FiCalendar size={10} /> Completed</p>
                        <p className="text-sm theme-text">{formatDate(result.completionDate)}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3.5">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FiStar size={10} /> Grade</p>
                        <p className="text-sm font-bold text-indigo-400">{result.grade}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3.5 col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FiHash size={10} /> Certificate ID</p>
                        <p className="text-sm font-mono theme-text">{result.certificateId}</p>
                      </div>
                      {result.duration && (
                        <div className="bg-white dark:bg-slate-800 p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FiClock size={10} /> Duration</p>
                          <p className="text-sm theme-text">{result.duration}</p>
                        </div>
                      )}
                      {result.percentage && (
                        <div className="bg-white dark:bg-slate-800 p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FiStar size={10} /> Score</p>
                          <p className="text-sm theme-text">{result.percentage}%</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-3 pb-1">
                      <FiShield className="text-emerald-400" size={12} />
                      <span className="text-xs text-emerald-500 font-medium">Issued by ISDS — Intelligent Student Development System</span>
                    </div>
                  </div>

                  {result.instructor && (
                    <div className="px-6 pb-4 text-xs text-center theme-text-muted">
                      Instructor: {result.instructor} {result.director ? `| Director: ${result.director}` : ''}
                    </div>
                  )}
                </>
              )}

              {certificateId && (
                <div className="px-6 pb-6 text-center">
                  <Link
                    to="/verify"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <FiExternalLink size={14} />
                    Verify another certificate
                  </Link>
                </div>
              )}
            </div>
          )}

          {!certificateId && !loading && !result && !error && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/5 flex items-center justify-center mx-auto mb-3 border border-indigo-500/10">
                <FiSearch className="text-indigo-300" size={20} />
              </div>
              <p className="text-sm theme-text-muted">Enter a certificate ID above to verify</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t theme-border py-4 text-center bg-white/50 dark:bg-slate-900/50">
        <p className="text-xs theme-text-muted">ISDS — Intelligent Student Development System  |  Certificate Verification Service</p>
      </footer>
    </div>
  );
};

export default VerifyCertificate;
