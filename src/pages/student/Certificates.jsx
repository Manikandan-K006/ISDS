import { motion } from 'framer-motion';
import { FiAward, FiDownload, FiShare2 } from 'react-icons/fi';
import CertificateCard from '../../components/CertificateCard';
import { MOCK_CERTIFICATES } from '../../utils/constants';

const Certificates = () => {
  const totalCredits = MOCK_CERTIFICATES.reduce((sum, c) => sum + (c.creditPoints || 0), 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">My Certificates</h1>
        <p className="text-slate-300 mt-1">Your earned certificates and achievements</p>
      </motion.div>

      <div className="glass rounded-xl p-5 border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <FiAward className="text-emerald-400" size={28} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Total Credits Earned</h3>
            <p className="text-3xl font-bold text-emerald-400">{totalCredits}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_CERTIFICATES.map(cert => (
          <CertificateCard key={cert._id} certificate={cert} onDownload={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default Certificates;
