import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Calendar, CreditCard, Edit2, Shield,
  Bell, Lock, AlertTriangle, CheckCircle2, ChevronRight, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PLAN_GRADIENTS: Record<string, string> = {
  'monthly': 'from-blue-600 to-indigo-700',
  'quarterly': 'from-violet-600 to-purple-700',
  'annual': 'from-amber-500 to-orange-600',
  'basic': 'from-slate-600 to-slate-700',
};

function InfoRow({ icon: Icon, label, value, accent = false }: any) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        accent ? 'bg-primary/10' : 'bg-muted'
      }`}>
        <Icon className={`w-4 h-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground truncate">{value || 'N/A'}</div>
      </div>
    </div>
  );
}

export function MemberProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState({
    name: '', email: '', phone: '',
    joinDate: '', membershipType: 'N/A',
    membershipStatus: 'expired', expiryDate: '',
  });
  const [personalStats, setPersonalStats] = useState({
    currentWeight: 'N/A', targetWeight: 'N/A',
  });
  const [daysToExpiry, setDaysToExpiry] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => { fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [homeData, progressData] = await Promise.all([
        api.getMemberHomeData(),
        api.getMyProgress(),
      ]);

      if (homeData.data) {
        const m = homeData.data.membership;
        const expiry = m?.endDate ? new Date(m.endDate) : null;
        const days = expiry
          ? Math.ceil((expiry.getTime() - Date.now()) / 86400000)
          : null;
        setDaysToExpiry(days);
        setMemberInfo({
          name: user?.name || '',
          email: user?.email || '',
          phone: 'N/A',
          joinDate: m?.startDate ? new Date(m.startDate).toLocaleDateString() : 'N/A',
          membershipType: m?.plan || 'N/A',
          membershipStatus: m?.status || 'expired',
          expiryDate: expiry ? expiry.toLocaleDateString() : 'N/A',
        });
        setNewName(user?.name || '');
      }

      if (progressData.data?.progress?.length > 0) {
        const latest = progressData.data.progress[0];
        setPersonalStats({
          currentWeight: latest.weight ? `${latest.weight} kg` : 'N/A',
          targetWeight: 'N/A',
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const initials = (memberInfo.name || '').split(' ').filter(Boolean).map(n => n[0]).join('') || 'U';
  const isActive = memberInfo.membershipStatus === 'active';
  const planGrad = PLAN_GRADIENTS[memberInfo.membershipType?.toLowerCase()] || 'from-slate-600 to-slate-700';

  if (loading) return (
    <div className="space-y-4 pb-20 md:pb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  const settingsItems = [
    { icon: Lock, label: 'Change Password', color: 'text-blue-400' },
    { icon: Bell, label: 'Notification Preferences', color: 'text-amber-400' },
    { icon: Shield, label: 'Privacy Settings', color: 'text-emerald-400' },
    { icon: AlertTriangle, label: 'Freeze Membership', color: 'text-red-400', danger: true },
  ];

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-2xl mx-auto">
      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${planGrad} p-6 text-white shadow-xl`}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
              {initials}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="bg-white/10 border border-white/30 text-white rounded-lg px-2 py-1 text-sm w-40 focus:outline-none"
                  autoFocus
                />
                <button onClick={() => { toast.success('Name updated!'); setEditingName(false); }}
                  className="text-xs bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30">Save</button>
                <button onClick={() => setEditingName(false)}
                  className="text-xs text-white/70 hover:text-white">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold truncate">{memberInfo.name || 'Member'}</h2>
                <button onClick={() => setEditingName(true)} className="p-1 rounded hover:bg-white/10 transition-colors">
                  <Edit2 className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
            )}
            <p className="text-white/70 text-sm mt-0.5">{memberInfo.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-red-500/30 text-red-200'
              }`}>
                {isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {memberInfo.membershipStatus}
              </span>
              <span className="px-2.5 py-1 bg-white/15 rounded-full text-xs font-medium capitalize">
                {memberInfo.membershipType} Plan
              </span>
            </div>
          </div>
        </div>
        {/* Expiry countdown */}
        {daysToExpiry !== null && daysToExpiry <= 30 && daysToExpiry > 0 && (
          <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span className="text-white/90">Your membership expires in <strong>{daysToExpiry} days</strong></span>
          </div>
        )}
      </motion.div>

      {/* Membership Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> Membership Details
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Plan', value: memberInfo.membershipType },
            { label: 'Status', value: memberInfo.membershipStatus },
            { label: 'Member Since', value: memberInfo.joinDate },
            { label: 'Expires', value: memberInfo.expiryDate },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/50 rounded-xl p-3">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className={`text-sm font-semibold mt-0.5 capitalize ${
                label === 'Status' ? (isActive ? 'text-emerald-400' : 'text-red-400') : 'text-foreground'
              }`}>{value}</div>
            </div>
          ))}
        </div>
        <button className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <CreditCard className="w-4 h-4" /> Renew Membership
        </button>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Contact Information
        </h3>
        <InfoRow icon={Mail} label="Email" value={memberInfo.email} accent />
        <InfoRow icon={Phone} label="Phone" value={memberInfo.phone} />
        <InfoRow icon={Calendar} label="Member Since" value={memberInfo.joinDate} />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="font-semibold text-foreground mb-4">Physical Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Current Weight', value: personalStats.currentWeight, color: 'text-orange-400' },
            { label: 'Target Weight', value: personalStats.targetWeight, color: 'text-violet-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Account Settings
        </h3>
        <div className="space-y-1">
          {settingsItems.map(({ icon: Icon, label, color, danger }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                danger ? 'hover:bg-red-500/10' : 'hover:bg-muted/70'
              }`}
              onClick={() => toast.info(`${label} — coming soon`)}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`text-sm flex-1 ${danger ? 'text-red-400' : 'text-foreground'}`}>{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
