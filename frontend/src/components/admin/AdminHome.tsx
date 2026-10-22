import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, DollarSign, TrendingUp, Activity, AlertCircle,
  CheckCircle2, Clock, ArrowUpRight, Zap, Shield, Bell
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const checkInData = [
  { time: '6AM', count: 15 }, { time: '8AM', count: 28 },
  { time: '10AM', count: 18 }, { time: '12PM', count: 22 },
  { time: '2PM', count: 12 }, { time: '4PM', count: 16 },
  { time: '6PM', count: 32 }, { time: '8PM', count: 24 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-lg text-sm">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="font-semibold text-foreground">{p.name === 'revenue' ? `$${p.value}` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeMembers: 0, expiringThisMonth: 0,
    todayRevenue: 0, todayCheckIns: 0,
  });
  const [revenueData, setRevenueData] = useState([
    { day: 'Mon', revenue: 0 }, { day: 'Tue', revenue: 0 },
    { day: 'Wed', revenue: 0 }, { day: 'Thu', revenue: 0 },
    { day: 'Fri', revenue: 0 }, { day: 'Sat', revenue: 0 },
    { day: 'Sun', revenue: 0 },
  ]);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, membersRes] = await Promise.all([
          api.getDashboardStats(),
          api.getAllMembers('all'),
        ]);

        if (dashRes.data?.stats) {
          const s = dashRes.data.stats;
          setStats(s);
          const apiRev = dashRes.data.revenue || dashRes.data.weeklyRevenue;
          if (Array.isArray(apiRev) && apiRev.length) {
            setRevenueData(apiRev.map((r: any, i: number) => ({
              day: r.day || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i] || `D${i+1}`,
              revenue: r.revenue ?? r.value ?? 0,
            })));
          }
          if (!Array.isArray(dashRes.data.recentActivities)) {
            setRecentActivities([
              { id: 1, icon: Users, color: 'text-blue-400', message: 'New members joined today', time: 'Just now' },
              { id: 2, icon: CheckCircle2, color: 'text-emerald-400', message: `${s.activeMembers} active members`, time: 'Today' },
              { id: 3, icon: DollarSign, color: 'text-green-400', message: `Today's revenue: $${s.todayRevenue}`, time: 'Today' },
              { id: 4, icon: Activity, color: 'text-violet-400', message: `${s.todayCheckIns} members checked in`, time: 'Today' },
            ]);
          }
        }

        if (membersRes.data?.members) {
          const expiring = membersRes.data.members
            .filter((m: any) => m.status === 'active' && m.expiryDate)
            .map((m: any) => {
              const daysLeft = Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / 86400000);
              return { ...m, daysLeft };
            })
            .filter((m: any) => m.daysLeft > 0 && m.daysLeft <= 30)
            .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
            .slice(0, 5);
          setExpiringMembers(expiring);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="space-y-6 pb-20 md:pb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  const kpiCards = [
    { label: 'Active Members', value: stats.activeMembers, icon: Users, color: 'blue', trend: '+12%' },
    { label: 'Expiring Soon', value: stats.expiringThisMonth, icon: AlertCircle, color: 'orange', trend: null },
    { label: "Today's Revenue", value: `$${stats.todayRevenue}`, icon: DollarSign, color: 'emerald', trend: '+7%' },
    { label: "Today's Check-ins", value: stats.todayCheckIns, icon: Activity, color: 'violet', trend: null },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-600 to-blue-700',
    orange: 'from-orange-500 to-orange-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          System Live
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, trend }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
            className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}
          >
            <div className="flex items-start justify-between mb-3">
              <Icon className="w-7 h-7 opacity-90" />
              {trend && (
                <span className="flex items-center gap-0.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-full font-medium">
                  <ArrowUpRight className="w-3 h-3" /> {trend}
                </span>
              )}
            </div>
            <div className="text-3xl font-bold mb-0.5">{value}</div>
            <div className="text-sm opacity-80">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Weekly Revenue</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +7%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="admRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#admRevGrad)" dot={{ r: 3, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Check-in Pattern */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Check-in Pattern</h3>
              <p className="text-xs text-muted-foreground">Today's gym traffic</p>
            </div>
            <span className="flex items-center gap-1 text-violet-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" /> Peak 6PM
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={checkInData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Check-ins" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring Memberships */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Expiring Memberships</h3>
            <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-medium">
              {expiringMembers.length} members
            </span>
          </div>
          {expiringMembers.length > 0 ? (
            <div className="space-y-2">
              {expiringMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                      {(m.name || '?').split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{m.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{m.plan} plan</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    m.daysLeft <= 3 ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    {m.daysLeft}d left
                  </span>
                </div>
              ))}
              <button className="w-full mt-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" /> Send Renewal Reminders
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm">No memberships expiring soon</p>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Activity Feed</h3>
          <div className="space-y-2">
            {recentActivities.map((activity: any) => {
              const Icon = activity.icon || Activity;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                  <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${activity.color || 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
