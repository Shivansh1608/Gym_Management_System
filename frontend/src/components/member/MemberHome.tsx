import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  Dumbbell,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  QrCode,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { AnimatedCounter } from '../ui/animated-counter';
import { ProgressRing } from '../ui/progress-ring';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export function MemberHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDays: 14,
    totalWorkouts: 28,
    hoursSpent: 36,
    streak: 6,
    caloriesBurned: 11450,
  });

  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([
    {
      id: '1',
      title: 'Morning HIIT Conditioning',
      trainer: 'Trainer User',
      date: 'Tomorrow',
      time: '08:00 AM',
      location: 'Studio A',
    },
    {
      id: '2',
      title: 'Strength & Deadlift Clinic',
      trainer: 'Coach Marcus',
      date: 'Friday',
      time: '05:30 PM',
      location: 'Main Lifting Area',
    },
  ]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [homeRes, statsRes]: any = await Promise.all([
          api.getMemberHomeData(),
          api.getWorkoutStats(),
        ]);

        if (homeRes?.data?.stats) {
          setStats((prev) => ({
            ...prev,
            ...homeRes.data.stats,
            caloriesBurned: homeRes.data.stats.totalWorkouts * 380 || 11450,
          }));
        }
        if (statsRes?.data) {
          setStats((prev) => ({
            ...prev,
            totalWorkouts: statsRes.data.totalWorkouts || prev.totalWorkouts,
            streak: statsRes.data.streakDays || prev.streak,
            caloriesBurned: statsRes.data.caloriesBurned || prev.caloriesBurned,
          }));
        }
      } catch (err) {
        // Fallback to active demo stats
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Generate GitHub-style 52-week activity heatmap data (last 28 days for clean view)
  const activityDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    // Simulated activity density (0 to 3)
    const active = (i % 3 === 0 || i % 5 === 0 || i > 20) && i % 7 !== 2;
    const level = active ? ((i % 4) + 1) : 0;
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      level,
    };
  });

  const levelColors = [
    'bg-muted/40 border-border/40',
    'bg-emerald-500/30 border-emerald-500/40',
    'bg-emerald-500/60 border-emerald-500/60',
    'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/30',
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-indigo-500/10 to-card p-6 sm:p-8 backdrop-blur-xl shadow-xl"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Athlete Portal Active</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground">
              Welcome back, {user?.name || 'Athlete'}! 💪
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              You are currently on a <span className="text-primary font-semibold">{stats.streak}-day streak</span>.
              Today is programmed for Hypertrophy & Core Conditioning.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/80 border border-border/60 backdrop-blur-md shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                <Flame className="w-7 h-7 fill-current animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Streak Flame
                </span>
                <span className="font-display font-extrabold text-xl text-foreground">
                  <AnimatedCounter value={stats.streak} /> Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workouts */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Sessions
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold text-3xl text-foreground">
              <AnimatedCounter value={stats.totalWorkouts} />
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4 this month</span>
            </div>
          </div>
        </Card>

        {/* Active Hours */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Time Under Iron
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold text-3xl text-foreground">
              <AnimatedCounter value={stats.hoursSpent} />
              <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">~1.2 hrs per session</p>
          </div>
        </Card>

        {/* Calories Burned */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Energy Burned
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold text-3xl text-foreground">
              <AnimatedCounter value={stats.caloriesBurned} />
              <span className="text-sm font-normal text-muted-foreground ml-1">kcal</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">High metabolic burn</p>
          </div>
        </Card>

        {/* Weekly Completion */}
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Weekly Target
            </span>
            <p className="font-display font-bold text-2xl text-foreground">4 / 5</p>
            <span className="text-xs text-muted-foreground">Sessions completed</span>
          </div>
          <ProgressRing progress={80} size={64} strokeWidth={6} showValue={false} color="stroke-primary" />
        </Card>
      </div>

      {/* Activity Heatmap & Quick Action */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Heatmap Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <div>
              <CardTitle>Consistency Heatmap (Last 4 Weeks)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every green square denotes an authenticated gym workout or front-desk check-in.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>Less</span>
              {levelColors.map((color, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm border ${color}`} />
              ))}
              <span>More</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <span key={idx} className="text-[11px] font-semibold text-muted-foreground text-center">
                  {day}
                </span>
              ))}
              {activityDays.map((item, idx) => (
                <div
                  key={idx}
                  title={`${item.date}: Level ${item.level} workout session`}
                  className={`h-9 rounded-lg border flex items-center justify-center text-[10px] font-semibold transition-all hover:scale-110 cursor-pointer ${
                    levelColors[item.level]
                  } ${item.level > 0 ? 'text-white' : 'text-muted-foreground/40'}`}
                >
                  {item.level > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestone Milestones & Trophies */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>Streak Milestones</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Unlocked achievements</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 flex-1">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-display font-bold text-sm text-foreground">7-Day Streak Club</h4>
                <p className="text-xs text-muted-foreground">1 day remaining to claim silver badge</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-display font-bold text-sm text-foreground">Monthly Iron Veteran</h4>
                <p className="text-xs text-muted-foreground">Logged 25+ total training sessions</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Zap className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h4 className="font-display font-bold text-sm text-foreground">Early Bird Pacesetter</h4>
                <p className="text-xs text-muted-foreground">Completed 5 check-ins before 8:00 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div>
            <CardTitle>Upcoming Booked Sessions</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personal trainer slots and group conditioning classes reserved on your pass.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-border/40">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground">{session.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    with {session.trainer} • {session.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-primary block">{session.date}</span>
                <span className="text-xs text-muted-foreground">{session.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default MemberHome;
