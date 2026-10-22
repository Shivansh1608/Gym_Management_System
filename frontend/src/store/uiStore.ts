import { create } from 'zustand';
import { NotificationItem } from '../types';

interface RestTimerState {
  active: boolean;
  secondsRemaining: number;
  totalSeconds: number;
  exerciseName?: string;
}

interface UIStoreState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  restTimer: RestTimerState;
  startRestTimer: (seconds: number, exerciseName?: string) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;

  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;
  unreadCount: () => number;
}

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Session Reminder',
    message: 'Your Morning HIIT class begins tomorrow at 08:00 AM.',
    timestamp: '10m ago',
    read: false,
    type: 'booking',
  },
  {
    id: '2',
    title: 'New PR Detected! 🎉',
    message: 'Congratulations! You set a new personal record on Bench Press (95 kg).',
    timestamp: '2h ago',
    read: false,
    type: 'workout',
  },
  {
    id: '3',
    title: 'Membership Active',
    message: 'Your Premium Athlete membership renewed successfully.',
    timestamp: '1d ago',
    read: true,
    type: 'system',
  },
];

export const useUIStore = create<UIStoreState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  restTimer: {
    active: false,
    secondsRemaining: 0,
    totalSeconds: 60,
  },
  startRestTimer: (seconds, exerciseName) =>
    set({
      restTimer: {
        active: true,
        secondsRemaining: seconds,
        totalSeconds: seconds,
        exerciseName,
      },
    }),
  stopRestTimer: () =>
    set((state) => ({
      restTimer: { ...state.restTimer, active: false, secondsRemaining: 0 },
    })),
  tickRestTimer: () => {
    const { restTimer } = get();
    if (!restTimer.active || restTimer.secondsRemaining <= 0) return;
    const next = restTimer.secondsRemaining - 1;
    if (next <= 0) {
      set({ restTimer: { ...restTimer, active: false, secondsRemaining: 0 } });
      try {
        // Subtle audio beep if allowed
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        // AudioContext not allowed or not supported
      }
    } else {
      set({ restTimer: { ...restTimer, secondsRemaining: next } });
    }
  },

  notifications: initialNotifications,
  markNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));

export default useUIStore;
