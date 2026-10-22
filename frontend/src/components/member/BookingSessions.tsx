import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, CheckCircle2, X, Search,
  AlertCircle, MapPin, Dumbbell, ChevronRight, Filter, Star
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

interface Session {
  id: string;
  _id?: string;
  type: string;
  trainer: any;
  date: string;
  time: string;
  duration: number;
  spots?: number;
  maxSpots?: number;
  bookedSpots?: number;
}

const SESSION_TYPE_ICONS: Record<string, string> = {
  'Personal Training': '🏋️',
  'Yoga': '🧘',
  'HIIT': '⚡',
  'Strength & Conditioning': '💪',
  'Pilates': '🌀',
  'Boxing': '🥊',
  'Spin Class': '🚴',
  'Stretching': '🤸',
  'CrossFit': '🔥',
  'Zumba': '💃',
};

function getSpotColor(spots: number, max: number) {
  const pct = spots / max;
  if (pct === 0) return 'text-red-400';
  if (pct < 0.3) return 'text-orange-400';
  return 'text-emerald-400';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function SpotBar({ spots, max }: { spots: number; max: number }) {
  const filled = max - spots;
  const pct = (filled / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{filled}/{max} booked</span>
        <span className={getSpotColor(spots, max)}>{spots} left</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BookingSessions() {
  const [activeTab, setActiveTab] = useState<'available' | 'booked'>('available');
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => { fetchSessions(); }, [activeTab]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      if (activeTab === 'available') {
        const res = await api.getAvailableSessions();
        setAvailableSessions(res.data?.sessions || []);
      } else {
        const res = await api.getMyBookings();
        setBookedSessions(res.data?.bookings || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleBook = (session: Session) => {
    setSelectedSession(session);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedSession) return;
    try {
      setBooking(true);
      const sid = selectedSession._id || selectedSession.id;
      await api.bookSession(sid);
      setShowBookingModal(false);
      setSelectedSession(null);
      toast.success('🎉 Session booked! Check your schedule.', { duration: 4000 });
      fetchSessions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to book session');
    } finally { setBooking(false); }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await api.cancelBooking(bookingId);
      toast.success('Booking cancelled');
      fetchSessions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const sessionTypes = [...new Set(availableSessions.map(s => s.type))];

  const filteredSessions = availableSessions.filter(s => {
    const matchSearch = s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.trainer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || s.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative">
          <h2 className="text-2xl font-bold">Book a Session</h2>
          <p className="text-blue-100 text-sm mt-1">Reserve your spot in classes and personal training sessions</p>
          <div className="flex gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 text-sm">
              <Dumbbell className="w-4 h-4 text-blue-200" />
              <span>{availableSessions.length} sessions available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-xl p-1.5 flex gap-1">
        {(['available', 'booked'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'available' ? 'Available Sessions' : 'My Bookings'}
            {tab === 'booked' && bookedSessions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {bookedSessions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Available Sessions */}
      {activeTab === 'available' && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by type or trainer…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-muted border border-border text-muted-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {sessionTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="font-semibold text-muted-foreground">No Sessions Found</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {search || filterType ? 'Try adjusting your filters' : 'No sessions are currently available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredSessions.map((session, i) => {
                  const sid = session._id || session.id;
                  const spots = session.spots ?? (session.maxSpots ? session.maxSpots - (session.bookedSpots || 0) : undefined);
                  const isFull = spots !== undefined && spots <= 0;
                  const emoji = SESSION_TYPE_ICONS[session.type] || '🏃';
                  return (
                    <motion.div
                      key={sid}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                      className="glass-card rounded-2xl p-5 hover:border-blue-500/30 border border-transparent transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                            {emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{session.type}</h3>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                              <User className="w-3.5 h-3.5" />
                              <span>{session.trainer?.name || 'Trainer'}</span>
                            </div>
                          </div>
                        </div>
                        {isFull ? (
                          <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium">
                            Full
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                            Open
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>{session.time} · {session.duration}min</span>
                        </div>
                      </div>

                      {spots !== undefined && session.maxSpots && (
                        <div className="mb-4">
                          <SpotBar spots={spots} max={session.maxSpots} />
                        </div>
                      )}

                      <button
                        onClick={() => !isFull && handleBook(session)}
                        disabled={isFull}
                        className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                          isFull
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isFull ? 'Fully Booked' : 'Book Now →'}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* My Bookings */}
      {activeTab === 'booked' && (
        <>
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : bookedSessions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="font-semibold text-muted-foreground">No Bookings Yet</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Browse available sessions and book your first class</p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-500 transition-colors"
              >
                Browse Sessions
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookedSessions.map((booking: any) => {
                const session = booking.session;
                if (!session) return null;
                const emoji = SESSION_TYPE_ICONS[session.type] || '🏃';
                const isPast = new Date(session.date) < new Date();
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass-card rounded-2xl p-5 border ${
                      isPast ? 'border-muted' : 'border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                        {emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-foreground">{session.type}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isPast
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {isPast ? 'Completed' : 'Upcoming'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {formatDate(session.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {session.time}
                          </span>
                        </div>
                        {session.trainer?.name && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" /> {session.trainer.name}
                          </div>
                        )}
                      </div>
                    </div>
                    {!isPast && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showBookingModal && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-2xl max-w-sm w-full shadow-2xl p-6"
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">{SESSION_TYPE_ICONS[selectedSession.type] || '🏃'}</div>
                <h3 className="font-bold text-foreground text-lg">Confirm Booking</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedSession.type}</p>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { icon: User, label: 'Trainer', value: selectedSession.trainer?.name || 'Assigned Trainer' },
                  { icon: Calendar, label: 'Date', value: formatDate(selectedSession.date) },
                  { icon: Clock, label: 'Time', value: `${selectedSession.time} · ${selectedSession.duration}min` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                    <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="text-sm font-medium text-foreground">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmBooking}
                  disabled={booking}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  {booking ? 'Booking…' : '✓ Confirm'}
                </button>
                <button
                  onClick={() => { setShowBookingModal(false); setSelectedSession(null); }}
                  className="flex-1 bg-muted hover:bg-muted/70 text-muted-foreground py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
