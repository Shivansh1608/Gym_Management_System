import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  Calendar,
  TrendingUp,
  QrCode,
  Users,
  User,
  Shield,
  BarChart3,
  Utensils,
  Layers,
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { ThemeToggle } from '../theme-provider';
import { CommandPalette } from '../ui/command-palette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface AppShellProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentTab, onTabChange, children }) => {
  const { user, logout } = useAuth();
  const {
    sidebarCollapsed,
    toggleSidebar,
    commandPaletteOpen,
    setCommandPaletteOpen,
    restTimer,
    stopRestTimer,
    tickRestTimer,
    notifications,
    markNotificationsAsRead,
    unreadCount,
  } = useUIStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tick rest timer every second
  useEffect(() => {
    if (!restTimer.active) return;
    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer.active, tickRestTimer]);

  const role = user?.role || 'member';

  // Navigation definition based on role
  const getNavItems = (): NavItem[] => {
    if (role === 'member') {
      return [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'workout', label: 'Workout Logger', icon: Dumbbell },
        { id: 'progress', label: 'Progress Tracker', icon: TrendingUp },
        { id: 'booking', label: 'Book Sessions', icon: Calendar },
        { id: 'checkin', label: 'QR Check-In', icon: QrCode },
        { id: 'diet', label: 'Diet & Nutrition', icon: Utensils, badge: 'New' },
        { id: 'profile', label: 'My Membership', icon: User },
      ];
    }
    if (role === 'trainer') {
      return [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'clients', label: 'Client Roster', icon: Users },
        { id: 'plans', label: 'Workout Plans', icon: Dumbbell },
      ];
    }
    // Admin
    return [
      { id: 'home', label: 'Executive HQ', icon: LayoutDashboard },
      { id: 'members', label: 'Members', icon: Users },
      { id: 'staff', label: 'Staff Management', icon: Shield },
      { id: 'revenue', label: 'Revenue Analytics', icon: BarChart3 },
      { id: 'equipment', label: 'Equipment Inventory', icon: Layers, badge: 'Asset' },
    ];
  };

  const navItems = getNavItems();
  const activeItem = navItems.find((item) => item.id === currentTab) || navItems[0];

  const roleBadgeColor = {
    member: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    trainer: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  }[role];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border/60 bg-sidebar/70 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-primary/20">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="font-display font-extrabold text-base tracking-tight text-sidebar-foreground">
                  FitTrack<span className="text-primary ml-0.5">Pro</span>
                </span>
                <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {role} Suite
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent flex items-center justify-center transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Rest Timer Floating Bar if active */}
        {restTimer.active && (
          <div className="p-3 border-t border-sidebar-border bg-primary/5">
            <div className="flex items-center justify-between text-xs font-semibold text-primary mb-1.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                Rest Timer
              </span>
              <span className="font-mono">{restTimer.secondsRemaining}s</span>
            </div>
            <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${(restTimer.secondsRemaining / Math.max(1, restTimer.totalSeconds)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-card/60 border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              title="Sign Out"
              className="text-muted-foreground hover:text-destructive transition-colors ml-auto p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Header */}
        <header className="h-16 border-b border-border/50 glass-header sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:inline">FitTrack</span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="font-semibold text-foreground font-display flex items-center gap-1.5">
                <activeItem.icon className="w-4 h-4 text-primary" />
                {activeItem.label}
              </span>
            </div>
          </div>

          {/* Center / Right: Global Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Command Launcher (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium border border-border/60 transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search or command...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded bg-card border border-border/60 text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Rest Timer Active Banner on Mobile/Header */}
            {restTimer.active && (
              <div
                onClick={stopRestTimer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold cursor-pointer animate-pulse"
                title="Click to cancel timer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Rest: {restTimer.secondsRemaining}s</span>
              </div>
            )}

            {/* Notifications Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative w-9 h-9 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 flex items-center justify-center text-foreground transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {unreadCount()}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between p-3.5 border-b border-border/60">
                  <span className="font-display font-semibold text-sm">Notifications</span>
                  {unreadCount() > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border/40">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors hover:bg-muted/40 ${
                        !n.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuLabel>
                  <p className="font-semibold text-sm">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeColor}`}
                  >
                    {role}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onTabChange(role === 'member' ? 'profile' : 'home')}
                  className="rounded-xl cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCommandPaletteOpen(true)}
                  className="rounded-xl cursor-pointer"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Command Palette (⌘K)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80%] bg-sidebar border-r border-border p-4 flex flex-col justify-between z-10">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-sidebar-border">
                  <span className="font-display font-bold text-lg">FitTrack Pro</span>
                  <button onClick={() => setMobileMenuOpen(false)}>✕</button>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-sidebar-border">
                <Button variant="outline" onClick={logout} className="w-full rounded-xl text-xs gap-2">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border/60 glass-header px-2 flex items-center justify-around z-30">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        role={role}
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={onTabChange}
        onLogout={logout}
      />
    </div>
  );
};

export default AppShell;
