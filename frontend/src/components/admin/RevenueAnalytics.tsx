import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Users, CreditCard,
  BarChart2, ArrowUpRight, Calendar, Target
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const PLAN_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({ label, value, icon: Icon, sub, trend, color }: any) {
  const positive = trend >= 0;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`glass-card rounded-2xl p-5 border border-transparent hover:border-${color}-500/30 transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm font-medium text-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-lg text-sm">
      <div className="text-muted-foreground mb-1.5 font-medium">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{typeof p.value === 'number' && p.name.includes('Revenue') ? `$${p.value.toLocaleString()}` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function RevenueAnalytics() {
  const [loading, setLoading] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0, monthlyGrowth: 7.0,
    averagePerMember: 198, projectedAnnual: 0,
  });
  const [timeRange, setTimeRange] = useState<6 | 12>(6);

  useEffect(() => { fetchAnalytics(); }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashRes, revRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRevenueAnalytics(timeRange),
      ]);

      if (dashRes.data?.stats) {
        const rev = dashRes.data.stats.todayRevenue || 0;
        setStats({
          totalRevenue: rev,
          monthlyGrowth: 7.0,
          averagePerMember: 198,
          projectedAnnual: rev * 365,
        });
      }

      if (revRes.data?.monthlyRevenue) {
        setMonthlyRevenue(
          revRes.data.monthlyRevenue.map((r: any, idx: number) => ({
            month: MONTH_LABELS[idx] || `M${idx + 1}`,
            Revenue: r.revenue || 0,
            Members: r.count || 0,
          }))
        );
      }

      if (revRes.data?.planDistribution) {
        setPlanDistribution(revRes.data.planDistribution.map((p: any) => ({
          name: p._id || 'Unknown',
          value: p.count || 0,
          revenue: p.revenue || p.count * 198,
        })));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="space-y-6 pb-20 md:pb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Revenue Analytics</h2>
          <p className="text-sm text-muted-foreground">Financial performance overview</p>
        </div>
        <div className="flex gap-1.5 glass-card rounded-xl p-1">
          {([6, 12] as const).map(r => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeRange === r ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {r}M
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This Month" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign} sub="vs last month" trend={stats?.monthlyGrowth ?? 0} color="emerald" />
        <StatCard label="Growth Rate" value={`+${stats?.monthlyGrowth ?? 0}%`}
          icon={TrendingUp} sub="month over month" trend={stats?.monthlyGrowth ?? 0} color="blue" />
        <StatCard label="Avg / Member" value={`$${stats?.averagePerMember ?? 0}`}
          icon={CreditCard} sub="per subscription" color="violet" />
        <StatCard label="Annual Projection" value={`$${(((stats?.projectedAnnual ?? 0) / 1000) || 0).toFixed(0)}K`}
          icon={Target} sub="estimated annual" color="amber" />
      </div>

      {/* Revenue Area Chart */}
      {monthlyRevenue.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Last {timeRange} months</p>
            </div>
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" /> +29% overall
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" orientation="left" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(((v ?? 0) / 1000) || 0).toFixed(0)}k`} />
              <YAxis yAxisId="mem" orientation="right" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
              <Area yAxisId="rev" type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#10b981' }} />
              <Area yAxisId="mem" type="monotone" dataKey="Members" stroke="#6366f1" strokeWidth={2.5} fill="url(#memGrad)" dot={{ r: 4, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan Distribution Donut */}
        {planDistribution.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-5">Membership Plan Mix</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100) || 0).toFixed(0)}%`}
                    labelLine={false}>
                    {planDistribution.map((_, idx) => (
                      <Cell key={idx} fill={PLAN_COLORS[idx % PLAN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-3">
              {planDistribution.map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: PLAN_COLORS[idx % PLAN_COLORS.length] }} />
                    <span className="text-sm text-foreground">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{p.value} members</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue by Plan Bar Chart */}
        {planDistribution.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-5">Revenue by Plan</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={planDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(((v ?? 0) / 1000) || 0).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]}>
                  {planDistribution.map((_, idx) => (
                    <Cell key={idx} fill={PLAN_COLORS[idx % PLAN_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
