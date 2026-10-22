import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Users, UserCog, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ThemeToggle } from './theme-provider';
import { Button } from './ui/button';
import { Input } from './ui/input';

type UserRole = 'member' | 'admin' | 'trainer';

interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void;
  showLogin?: boolean;
  onCloseLogin?: () => void;
}

export function LandingPage({ onRoleSelect, showLogin, onCloseLogin }: LandingPageProps) {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'member' as UserRole,
      title: 'Member',
      tagline: 'Track & Elevate',
      description: 'Log daily sets, track body measurements with charts, book group classes, and verify check-ins with QR passes.',
      icon: Dumbbell,
      accent: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      borderGlow: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
      badge: 'Athlete Portal',
      demoEmail: 'member@example.com',
    },
    {
      id: 'trainer' as UserRole,
      title: 'Trainer',
      tagline: 'Coach & Program',
      description: 'Build multi-week training plans, manage client rosters, track workout compliance, and coordinate schedules.',
      icon: Users,
      accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      badge: 'Coach Suite',
      demoEmail: 'trainer@example.com',
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      tagline: 'Govern & Analyze',
      description: 'High-level business intelligence, revenue analytics, staff oversight, member subscriptions, and equipment inventory.',
      icon: UserCog,
      accent: 'from-violet-500/20 via-purple-500/10 to-transparent',
      borderGlow: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
      badge: 'Executive HQ',
      demoEmail: 'admin@example.com',
    },
  ];

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  const handleQuickDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      setSuccess('Authenticated successfully! Entering dashboard...');
      setTimeout(() => {
        onCloseLogin?.();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.register({
        name,
        email,
        password,
        phone: phone || undefined,
        role: selectedRole || 'member',
      });
      setSuccess('Account created successfully! You can now log in.');
      setIsSignup(false);
      setName('');
      setPhone('');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const isModalOpen = showLogin || !!selectedRole;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      {/* Background Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-3xl -z-10 pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                FitTrack<span className="text-primary ml-0.5">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-primary/10 text-primary border border-primary/20">
                v2.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleClick('member')}
              className="rounded-xl border-border/80 text-xs font-semibold h-9 px-4 hidden sm:flex"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => handleRoleClick('member')}
              className="rounded-xl text-xs font-semibold h-9 px-4 shadow-md shadow-primary/20 gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20 flex-1 flex flex-col items-center justify-center text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border/60 text-xs font-medium text-muted-foreground mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Production-Grade Fitness & Gym Management Architecture</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground max-w-3xl leading-[1.1] mb-6"
        >
          Elevate Your Gym with <br />
          <span className="bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Precision & Performance
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-12 leading-relaxed"
        >
          A unified, high-speed ecosystem connecting gym members, certified trainers, and management.
          Select your portal to experience the platform.
        </motion.p>

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full text-left">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 * (idx + 1), ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => handleRoleClick(role.id)}
                className={`relative group rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-lg ${role.borderGlow}`}
              >
                {/* Subtle gradient wash */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${role.accent} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-foreground group-hover:scale-110 group-hover:text-primary transition-all duration-300 shadow-sm">
                      <Icon className="w-7 h-7 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-secondary border border-border/60 text-muted-foreground">
                      {role.badge}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                      {role.tagline}
                    </span>
                    <h2 className="font-display font-bold text-2xl text-foreground mt-0.5">
                      {role.title}
                    </h2>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {role.description}
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  <span>Enter {role.title} Portal</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-6 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>FitTrack Pro Enterprise Gym Operating System</span>
          </div>
          <div>All 3 role workspaces pre-configured with active database seeds.</div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                onCloseLogin?.();
                setSelectedRole(null);
              }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-7 shadow-2xl z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-2xl text-foreground">
                    {isSignup ? 'Create Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedRole ? `Signing in to ${selectedRole.toUpperCase()} workspace` : 'Sign in to your account'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCloseLogin?.();
                    setSelectedRole(null);
                    setIsSignup(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Mode Switch Tabs */}
              <div className="flex p-1 rounded-xl bg-secondary mb-6">
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    !isSignup
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSignup
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Content */}
              {isSignup ? (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Password (min 6 chars)
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="rounded-xl h-11"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/20 mt-2"
                  >
                    {loading ? 'Creating Account...' : 'Register Account'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>

                  {/* Seed Account Autofill Pills */}
                  <div className="p-3 rounded-xl bg-secondary/60 border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      Instant One-Click Demo Credentials:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickDemoFill('member@example.com')}
                        className="px-2.5 py-1 rounded-lg bg-card border border-border/80 text-[11px] font-medium hover:border-primary transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Member
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoFill('trainer@example.com')}
                        className="px-2.5 py-1 rounded-lg bg-card border border-border/80 text-[11px] font-medium hover:border-primary transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Trainer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoFill('admin@example.com')}
                        className="px-2.5 py-1 rounded-lg bg-card border border-border/80 text-[11px] font-medium hover:border-primary transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Admin
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/20 mt-2"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default LandingPage;
