import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  Dumbbell,
  Calendar,
  TrendingUp,
  QrCode,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  Shield,
  PlusCircle,
} from 'lucide-react';
import { Dialog, DialogContent } from './dialog';
import { useTheme } from '../theme-provider';

interface CommandPaletteProps {
  role?: 'member' | 'trainer' | 'admin';
  onNavigate?: (route: string) => void;
  onLogout?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  role = 'member',
  onNavigate,
  onLogout,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (setControlledOpen) setControlledOpen(val);
    else setInternalOpen(val);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-lg rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
        <Command className="w-full bg-transparent">
          <div className="flex items-center px-4 border-b border-border/60">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <Command.Input
              placeholder="Type a command or search..."
              className="w-full h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            />
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group
              heading="Quick Navigation"
              className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <Command.Item
                onSelect={() => runCommand(() => onNavigate?.('home'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-primary" />
                <span>Dashboard Overview</span>
              </Command.Item>

              {role === 'member' && (
                <>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('workout'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Dumbbell className="w-4 h-4 text-emerald-500" />
                    <span>Log Workout</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('progress'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>View Progress & Charts</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('booking'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-violet-500" />
                    <span>Book a Session</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('checkin'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-amber-500" />
                    <span>Gym QR Check-In</span>
                  </Command.Item>
                </>
              )}

              {role === 'trainer' && (
                <>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('schedule'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Manage Schedule</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('clients'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Client Roster</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('plans'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-violet-500" />
                    <span>Workout Plan Builder</span>
                  </Command.Item>
                </>
              )}

              {role === 'admin' && (
                <>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('members'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>Member Management</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('staff'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Staff Oversight</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onNavigate?.('revenue'))}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                    <span>Revenue Analytics</span>
                  </Command.Item>
                </>
              )}
            </Command.Group>

            {/* System Preferences */}
            <Command.Group
              heading="Theme & Preferences"
              className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2 border-t border-border/40"
            >
              <Command.Item
                onSelect={() => runCommand(() => setTheme('dark'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Switch to Dark Theme</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setTheme('light'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Switch to Light Theme</span>
              </Command.Item>
            </Command.Group>

            {/* Account */}
            {onLogout && (
              <Command.Group
                heading="Account"
                className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2 border-t border-border/40"
              >
                <Command.Item
                  onSelect={() => runCommand(() => onLogout())}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-muted/20 text-[11px] text-muted-foreground">
            <span>Navigation Quick Launcher</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 font-mono text-[10px]">
                ESC
              </kbd>
              <span>to close</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
