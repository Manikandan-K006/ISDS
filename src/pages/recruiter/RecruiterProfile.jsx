import { motion } from 'framer-motion';
import { Card, Badge, Avatar } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { Building2, Mail, User } from 'lucide-react';

export default function RecruiterProfile() {
  const { user } = useAuth();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">My Profile</h1>
      <Card className="p-6 max-w-xl">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name} size="lg" src={user?.profilePhoto} />
          <div>
            <h2 className="text-card-title theme-text">{user?.name}</h2>
            <p className="text-caption theme-text-muted inline-flex items-center gap-1.5"><Mail size={13} /> {user?.email}</p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-[var(--border)] space-y-2">
          <div className="flex items-center gap-3">
            <Badge color="indigo" size="sm"><User size={11} /> Role</Badge>
            <span className="text-small theme-text capitalize">{user?.role}</span>
          </div>
          {user?.employeeId && (
            <div className="flex items-center gap-3">
              <Badge color="indigo" size="sm"><Building2 size={11} /> Employee ID</Badge>
              <span className="text-small theme-text">{user.employeeId}</span>
            </div>
          )}
        </div>
      </Card>
      <Card className="p-6 max-w-xl">
        <h3 className="text-card-subtitle theme-text mb-2">Account</h3>
        <p className="text-caption theme-text-muted leading-relaxed">
          Manage jobs and applications from the dashboard. Contact an administrator to update your profile details.
        </p>
      </Card>
    </motion.div>
  );
}
