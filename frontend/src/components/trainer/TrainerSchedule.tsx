import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Plus, Trash2, X, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, Users, Play, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

interface Session {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  duration?: number;
  maxSpots?: number;
  bookings?: any[];
}

const SESSION_TYPES = [
  'Personal Training', 'Yoga', 'HIIT', 'Strength & Conditioning',
  'Pilates', 'Boxing', 'Spin Class', 'Stretching', 'CrossFit', 'Zumba'
];

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  scheduled: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  cancelled: 'bg-red-500/15 border-red-500/30 text-red-400',
};

function getWeekDays(referenceDate: Date) {
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

export function TrainerSchedule() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    type: '', date: new Date().toISOString().split('T')[0],
    time: '09:00', duration: 60, maxSpots: 1,
  });

  const weekRef = new Date();
  weekRef.setDate(weekRef.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(weekRef);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getTrainerSessions();
      setSessions(res.data?.sessions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.createSession(newSession);
      setShowCreateModal(false);
      setNewSession({ type: '', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 60, maxSpots: 1 });
      fetchSessions();
      toast.success('Session created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create session');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSession(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      toast.success('Session deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete session');
    }
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr);
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedSessions = getSessionsForDate(selectedDate);

  const summaryStats = {
    today: sessions.filter(s => s.date === today).length,
    upcoming: sessions.filter(s => s.date > today && s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    total: sessions.length,
  };

  if (loading) return (
    <div className="space-y-4 pb-20 md:pb-6">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Schedule</h2>
          <p className="text-sm text-muted-foreground">Manage your training sessions & availability</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Today", value: summaryStats.today, color: "text-blue-400" },
          { label: "Upcoming", value: summaryStats.upcoming, color: "text-amber-400" },
          { label: "Completed", value: summaryStats.completed, color: "text-emerald-400" },
          { label: "Total", value: summaryStats.total, color: "text-violet-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="glass-card rounded-xl p-1.5 flex gap-1 w-fit">
        {(['week', 'day'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              viewMode === mode
                ? 'bg-emerald-600 text-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode} View
          </button>
        ))}
      </div>

      {/* Week Calendar */}
      <motion.div layout className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setWeekOffset(o => o - 1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-foreground">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
            {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={() => setWeekOffset(o => o + 1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => {
            const dayStr = day.toISOString().split('T')[0];
            const daySessions = getSessionsForDate(day);
            const isToday = dayStr === today;
            const isSelected = dayStr === selectedDateStr;
            return (
              <button
                key={dayStr}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  isSelected ? 'bg-emerald-600 text-white' :
                  isToday ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  'hover:bg-muted text-muted-foreground'
                }`}
              >
                <span className="text-[10px] font-medium uppercase">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-lg font-bold my-0.5 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                  {day.getDate()}
                </span>
                {daySessions.length > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Sessions for selected date */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          <span className="ml-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
            {selectedSessions.length} sessions
          </span>
        </h3>
        <AnimatePresence>
          {selectedSessions.length > 0 ? (
            <div className="space-y-3">
              {selectedSessions.sort((a, b) => a.time.localeCompare(b.time)).map(session => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${STATUS_COLORS[session.status]}`}
                >
                  <div className="text-center w-14 shrink-0">
                    <div className="text-xs opacity-70">Time</div>
                    <div className="text-sm font-bold">{session.time}</div>
                    {session.duration && <div className="text-xs opacity-60">{session.duration}m</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{session.type}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {session.bookings && session.bookings.length > 0 && (
                        <span className="flex items-center gap-1 text-xs opacity-70">
                          <Users className="w-3 h-3" /> {session.bookings.length} booked
                        </span>
                      )}
                      {session.maxSpots && (
                        <span className="text-xs opacity-70">
                          max {session.maxSpots} spots
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${STATUS_COLORS[session.status]}`}>
                      {session.status}
                    </span>
                    <button onClick={() => handleDelete(session._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No sessions scheduled for this day</p>
              <button onClick={() => setShowCreateModal(true)}
                className="mt-3 text-emerald-500 text-sm hover:underline">
                + Add a session
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">Create New Session</h3>
                <button onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Session Type</label>
                  <select
                    value={newSession.type}
                    onChange={e => setNewSession({ ...newSession, type: e.target.value })}
                    className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Select type…</option>
                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Date</label>
                    <input type="date" value={newSession.date}
                      onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Time</label>
                    <input type="time" value={newSession.time}
                      onChange={e => setNewSession({ ...newSession, time: e.target.value })}
                      className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Duration (min)</label>
                    <input type="number" value={newSession.duration} min={15} max={180} step={15}
                      onChange={e => setNewSession({ ...newSession, duration: +e.target.value })}
                      className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Max Spots</label>
                    <input type="number" value={newSession.maxSpots} min={1} max={30}
                      onChange={e => setNewSession({ ...newSession, maxSpots: +e.target.value })}
                      className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      required />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={creating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition-colors">
                    {creating ? 'Creating…' : 'Create Session'}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-muted hover:bg-muted/70 text-muted-foreground py-2.5 rounded-xl font-medium text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
