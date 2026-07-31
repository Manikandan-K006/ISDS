import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Award } from 'lucide-react';

export default function Certificates() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/certificates')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;
  const certs = data?.certificates || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Certificates</h1>
      {certs.length === 0 ? (
        <div className="theme-card rounded-2xl p-12 text-center card-shadow">
          <Award size={48} className="mx-auto theme-text-muted mb-4" />
          <p className="theme-text-muted">No certificates earned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((c) => (
            <div key={c.id} className="theme-card rounded-2xl p-5 card-shadow-premium">
              <div className="flex items-center gap-3 mb-3">
                <Award size={24} className="text-amber-500" />
                <div>
                  <p className="text-sm font-semibold theme-text">{c.title}</p>
                  <p className="text-xs theme-text-muted">{c.course?.title}</p>
                </div>
              </div>
              <p className="text-xs theme-text-muted">Issued: {new Date(c.issuedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}