import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Calendar, TrendingUp, Star, Clock, CheckCircle2,
  ChevronRight, Activity, Award, Zap, Play
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' } }),
};

const weeklyData = [
  { day: 'Mon', sessions: 4, clients: 6 },
  { day: 'Tue', sessions: 6, clients: 8 },
  { day: 'Wed', sessions: 3, clients: 5 },
  { day: 'Thu', sessions: 7, clients: 10 },
  { day: 'Fri', sessions: 5, clients: 7 },
  { day: 'Sat', sessions: 2, clients: 4 },
  { day: 'Sun', sessions: 1, clients: 2 },
];

export function TrainerHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeClients: 0, sessionsToday: 0, completedThisWeek: 0, rating: 4.8 });
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, clientsRes] = await Promise.all([
        api.getTrainerSessions(),
        api.getTrainerClients(),
      ]);
      const allSessions = sessionsRes.data?.sessions || [];
      setSessions(allSessions);
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      setStats({
        activeClients: clientsRes.data?.clients?.length || 0,
        sessionsToday: allSessions.filter((s: any) => s.date === today).length,
        completedThisWeek: allSessions.filter((s: any) => s.status === 'completed' && new Date(s.date) >= weekStart).length,
        rating: 4.8,
      });
      setClients(clientsRes.data?.clients || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const todaySessions = sessions.filter((s: any) => s.date === new Date().toISOString().split('T')[0]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="space-y-6 pb-20 md:pb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );

  const statCards = [
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'from-blue-500 to-blue-600', sub: 'under your plan' },
    { label: 'Sessions Today', value: stats.sessionsToday, icon: Calendar, color: 'from-emerald-500 to-emerald-600', sub: 'scheduled' },
    { label: 'Completed (Week)', value: stats.completedThisWeek, icon: CheckCircle2, color: 'from-violet-500 to-violet-600', sub: 'this week' },
    { label: 'Avg Rating', value: stats.rating, icon: Star, color: 'from-amber-500 to-amber-600', sub: 'from clients' },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-xl"
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative">
          <p className="text-emerald-200 text-sm font-medium mb-1">{greeting},</p>
          <h2 className="text-2xl font-bold mb-1">{user?.name || 'Coach'} 💪</h2>
          <p className="text-emerald-100 text-sm">
            {stats.sessionsToday > 0
              ? `You have ${stats.sessionsToday} session${stats.sessionsToday !== 1 ? 's' : ''} scheduled today`
              : 'No sessions today — enjoy your rest day!'}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 text-sm">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{stats.completedThisWeek} sessions done this week</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 text-sm">
              <Activity className="w-4 h-4 text-green-300" />
              <span>{stats.activeClients} active clients</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="show"
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}>
            <stat.icon className="w-7 h-7 mb-3 opacity-90" />
            <div className="text-3xl font-bold mb-0.5">{stat.value}</div>
            <div className="text-xs opacity-75">{stat.sub}</div>
            <div className="text-sm mt-1 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
        className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Weekly Activity</h3>
            <p className="text-sm text-muted-foreground">Sessions & clients this week</p>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
            <TrendingUp className="w-4 h-4" /> +12% vs last week
          </span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradClients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--foreground))' }}
            />
            <Area type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} fill="url(#gradSessions)" name="Sessions" />
            <Area type="monotone" dataKey="clients" stroke="#6366f1" strokeWidth={2} fill="url(#gradClients)" name="Clients" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Session Timeline */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show"
          className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" /> Today's Timeline
          </h3>
          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session: any, idx: number) => (
                <div key={session._id || idx}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    session.status === 'completed'
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-muted/50 border border-border hover:border-emerald-500/30'
                  }`}>
                  <div className="text-center w-14">
                    <div className="text-xs text-muted-foreground">Time</div>
                    <div className="text-sm font-semibold text-foreground">{session.time}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{session.type}</div>
                    {session.bookings?.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {session.bookings.length} booked
                      </div>
                    )}
                  </div>
                  {session.status === 'completed' ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-500 transition-colors">
                      <Play className="w-3 h-3" /> Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sessions scheduled today</p>
            </div>
          )}
        </motion.div>

        {/* Client Leaderboard */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
          className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Client Leaderboard
          </h3>
          {clients.length > 0 ? (
            <div className="space-y-3">
              {clients.slice(0, 5).map((client: any, idx: number) => (
                <div key={client.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-muted-foreground/50'
                  }`}>
                    {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {client.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{client.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {client.sessionsCompleted || 0} sessions
                      {client.streak > 0 && ` · 🔥 ${client.streak}d`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-500">{client.progress || 0}%</div>
                    <div className="text-xs text-muted-foreground">progress</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No clients yet</p>
            </div>
          )}
          {clients.length > 5 && (
            <button className="mt-3 w-full text-sm text-emerald-500 hover:text-emerald-400 flex items-center justify-center gap-1 transition-colors">
              View all {clients.length} clients <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
