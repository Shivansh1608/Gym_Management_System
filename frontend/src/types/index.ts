export type UserRole = 'member' | 'trainer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status?: 'active' | 'inactive';
  membershipType?: string;
  joinDate?: string;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight: number;
  rpe?: number;
  completed?: boolean;
}

export interface ExerciseLog {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  title: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercises: ExerciseLog[];
}

export interface ProgressEntry {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  photoUrl?: string;
}

export interface Session {
  id: string;
  title: string;
  trainerName: string;
  trainerId: string;
  date: string;
  time: string;
  capacity: number;
  bookedCount: number;
  type: string;
  location: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Booking {
  id: string;
  sessionId: string;
  sessionName: string;
  date: string;
  time: string;
  trainerName: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
}

export interface DietMeal {
  id: string;
  name: string;
  time: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  items: string[];
}

export interface DietPlan {
  id: string;
  title: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: DietMeal[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: 'operational' | 'maintenance' | 'broken';
  lastServiceDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'workout' | 'alert' | 'system';
}
