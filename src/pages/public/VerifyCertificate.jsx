import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FiCheckCircle, FiXCircle, FiSearch, FiExternalLink, FiAward, FiUser, FiCalendar } from 'react-icons/fi';
import { verifyCertificate } from '../../api/certificates';
import { formatDate } from '../../utils/helpers';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualId, setManualId] = useState(certificateId || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateId) {
      setLoading(true);
      setError(null);
      verifyCertificate(certificateId)
        .then(setResult)
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
    try {
      const res = await verifyCertificate(manualId.trim());
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col">
      <header className="border-b theme-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">IS</span>
            </div>
            <span className="text-sm font-semibold theme-text">ISDS</span>
          </Link>
          <span className="text-xs theme-text-muted">Certificate Verification</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <FiAward className="text-indigo-400" size={28} />
            </div>
            <h1 className="text-xl font-bold theme-text">Certificate Verification</h1>
            <p className="text-sm theme-text-muted mt-1">Verify the authenticity of an ISDS certificate</p>
          </div>

          {!certificateId && (
            <div className="theme-card border theme-border rounded-xl p-5 mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder="Enter certificate ID (e.g. ISDS-2026-xxxx)"
                  className="flex-1 px-4 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder-theme-muted"
                />
                <button
                  onClick={handleVerify}
                  disabled={loading || !manualId.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSearch size={15} />}
                  Verify
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm theme-text-muted">Verifying certificate...</p>
            </div>
          )}

          {error && !loading && (
            <div className="theme-card border border-rose-500/20 rounded-xl p-8 text-center">
              <FiXCircle className="mx-auto text-rose-400 mb-4" size={48} />
              <h2 className="text-lg font-semibold theme-text mb-2">Verification Failed</h2>
              <p className="text-sm theme-text-muted">{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className={`theme-card border rounded-xl p-8 text-center ${result.valid ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
              {result.valid ? (
                <FiCheckCircle className="mx-auto text-emerald-400 mb-4" size={48} />
              ) : (
                <FiXCircle className="mx-auto text-rose-400 mb-4" size={48} />
              )}

              <h2 className={`text-lg font-semibold mb-2 ${result.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.valid ? 'Certificate Verified' : result.message}
              </h2>

              {result.valid && (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="p-3 bg-white rounded-xl">
                      <QRCodeSVG value={window.location.href} size={120} />
                    </div>
                  </div>

                  <div className="theme-subtle rounded-xl p-5 space-y-3 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-muted">Certificate ID</span>
                      <span className="theme-text font-mono text-xs">{result.certificateId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-muted">Student</span>
                      <span className="theme-text font-medium">{result.studentName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-muted">Course</span>
                      <span className="theme-text font-medium">{result.courseName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-muted">Issue Date</span>
                      <span className="theme-text">{formatDate(result.issueDate)}</span>
                    </div>
                    {result.grade && (
                      <div className="flex justify-between text-sm">
                        <span className="theme-text-muted">Grade</span>
                        <span className="text-indigo-400 font-medium">{result.grade}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-muted">Status</span>
                      <span className="text-emerald-400 font-medium capitalize">{result.status}</span>
                    </div>
                  </div>
                </>
              )}

              {certificateId && (
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-1.5 mt-6 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <FiExternalLink size={14} />
                  Verify another certificate
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t theme-border py-4 text-center">
        <p className="text-xs theme-text-muted">ISDS — Intelligent Student Development System</p>
      </footer>
    </div>
  );
};

export default VerifyCertificate;
