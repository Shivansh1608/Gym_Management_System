import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, TrendingDown, MessageSquare, X,
  Users, Flame, Calendar, BarChart2, ChevronRight, Activity
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../services/api';

interface Client {
  id: string;
  name: string;
  email: string;
  goal?: string;
  progress: number;
  sessionsCompleted: number;
  totalSessions: number;
  lastSession: string | null;
  streak: number;
  trend?: 'up' | 'down' | 'stable';
}

const GOAL_COLORS: Record<string, string> = {
  'Weight Loss': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Muscle Gain': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Endurance': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Flexibility': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'General Fitness': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function RadarMetrics({ client }: { client: Client }) {
  const data = [
    { attribute: 'Consistency', value: Math.min(100, client.streak * 10) },
    { attribute: 'Progress', value: client.progress },
    { attribute: 'Sessions', value: Math.min(100, (client.sessionsCompleted / Math.max(1, client.totalSessions)) * 100) },
    { attribute: 'Streak', value: Math.min(100, client.streak * 7) },
    { attribute: 'Activity', value: client.lastSession ? 80 : 20 },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function ClientManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'streak'>('all');

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.getTrainerClients();
      setClients(res.data?.clients || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = clients
    .filter(c => {
      if (filter === 'active') return c.streak > 0;
      if (filter === 'streak') return c.streak >= 7;
      return true;
    })
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const avgProgress = clients.length
    ? Math.round(clients.reduce((s, c) => s + c.progress, 0) / clients.length)
    : 0;

  if (loading) return (
    <div className="space-y-4 pb-20 md:pb-6">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Client Management</h2>
        <p className="text-sm text-muted-foreground">Monitor progress and manage your client roster</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-400' },
          { label: 'Active (Streak)', value: clients.filter(c => c.streak > 0).length, icon: Flame, color: 'text-orange-400' },
          { label: 'Avg Progress', value: `${avgProgress}%`, icon: BarChart2, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <Icon className={`w-6 h-6 mx-auto mb-1.5 ${color}`} />
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'streak'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'streak' ? '🔥 Streak' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.length > 0 ? filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              exit={{ opacity: 0, y: -16 }}
              className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 transition-all border border-transparent"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {client.goal && (
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${GOAL_COLORS[client.goal] || 'bg-muted text-muted-foreground border-border'}`}>
                          {client.goal}
                        </span>
                      )}
                      {client.streak > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs">
                          <Flame className="w-3 h-3" /> {client.streak}d streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {client.trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                  {client.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
                  {!client.trend || client.trend === 'stable' && (
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Overall Progress</span>
                  <span className="text-xs font-semibold text-emerald-400">{client.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${client.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>

              {/* Session stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Sessions', value: `${client.sessionsCompleted}/${client.totalSessions}` },
                  { label: 'Streak', value: `${client.streak}d` },
                  { label: 'Last Session', value: client.lastSession ? new Date(client.lastSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <BarChart2 className="w-4 h-4" /> View Progress
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted hover:bg-muted/70 text-muted-foreground rounded-xl text-sm font-medium transition-colors">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="font-semibold text-muted-foreground">No clients found</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Clients appear when they book sessions with you</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                    {selectedClient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{selectedClient.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedClient.email}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Performance Radar */}
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Performance Overview</h4>
                  <RadarMetrics client={selectedClient} />
                </div>

                {/* Key stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Progress', value: `${selectedClient.progress}%`, color: 'text-emerald-400' },
                    { label: 'Sessions Done', value: `${selectedClient.sessionsCompleted}/${selectedClient.totalSessions}`, color: 'text-blue-400' },
                    { label: 'Current Streak', value: `${selectedClient.streak} days`, color: 'text-orange-400' },
                    { label: 'Last Session', value: selectedClient.lastSession ? new Date(selectedClient.lastSession).toLocaleDateString() : 'N/A', color: 'text-muted-foreground' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-muted/50 rounded-xl p-3">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className={`text-lg font-bold mt-0.5 ${color}`}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Goal */}
                {selectedClient.goal && (
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">Training Goal</div>
                    <div className="font-semibold text-foreground">{selectedClient.goal}</div>
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="text-emerald-400 font-semibold">{selectedClient.progress}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedClient.progress}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
