import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Save,
  Dumbbell,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2,
  RotateCcw,
  Search,
  ChevronDown,
  Timer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useUIStore } from '../../store/uiStore';
import api from '../../services/api';
import { toast } from 'sonner';

interface SetEntry {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isPR?: boolean;
}

interface ActiveExercise {
  id: string;
  name: string;
  category: string;
  previousBest?: string;
  sets: SetEntry[];
}

const exerciseLibrary = [
  { name: 'Barbell Flat Bench Press', category: 'Chest', previousBest: '90 kg × 5' },
  { name: 'Incline Dumbbell Press', category: 'Chest', previousBest: '34 kg × 8' },
  { name: 'Barbell Back Squat', category: 'Legs', previousBest: '130 kg × 5' },
  { name: 'Romanian Deadlift (RDL)', category: 'Legs', previousBest: '120 kg × 6' },
  { name: 'Conventional Deadlift', category: 'Back', previousBest: '160 kg × 3' },
  { name: 'Weighted Pull-Ups', category: 'Back', previousBest: '+20 kg × 5' },
  { name: 'Barbell Overhead Press (OHP)', category: 'Shoulders', previousBest: '60 kg × 5' },
  { name: 'Dumbbell Lateral Raise', category: 'Shoulders', previousBest: '14 kg × 12' },
  { name: 'EZ-Bar Bicep Preacher Curl', category: 'Arms', previousBest: '35 kg × 10' },
  { name: 'Tricep Rope Cable Pushdown', category: 'Arms', previousBest: '32 kg × 12' },
  { name: 'Hanging Leg Raises', category: 'Core', previousBest: 'Bodyweight × 15' },
];

export function WorkoutLogger() {
  const { startRestTimer } = useUIStore();
  const [workoutTitle, setWorkoutTitle] = useState('Upper Body Hypertrophy');
  const [exercises, setExercises] = useState<ActiveExercise[]>([
    {
      id: 'ex-1',
      name: 'Barbell Flat Bench Press',
      category: 'Chest',
      previousBest: '90 kg × 5',
      sets: [
        { setNumber: 1, weight: 80, reps: 8, rpe: 7, completed: true },
        { setNumber: 2, weight: 85, reps: 6, rpe: 8, completed: true },
        { setNumber: 3, weight: 92.5, reps: 5, rpe: 9.5, completed: false },
      ],
    },
    {
      id: 'ex-2',
      name: 'Weighted Pull-Ups',
      category: 'Back',
      previousBest: '+20 kg × 5',
      sets: [
        { setNumber: 1, weight: 10, reps: 8, rpe: 8, completed: false },
        { setNumber: 2, weight: 15, reps: 6, rpe: 8.5, completed: false },
        { setNumber: 3, weight: 20, reps: 5, rpe: 9, completed: false },
      ],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  const addExerciseFromLibrary = (item: typeof exerciseLibrary[0]) => {
    const newEx: ActiveExercise = {
      id: `ex-${Date.now()}`,
      name: item.name,
      category: item.category,
      previousBest: item.previousBest,
      sets: [
        { setNumber: 1, weight: 50, reps: 10, rpe: 7, completed: false },
        { setNumber: 2, weight: 50, reps: 10, rpe: 8, completed: false },
        { setNumber: 3, weight: 50, reps: 10, rpe: 8.5, completed: false },
      ],
    };
    setExercises([...exercises, newEx]);
    setShowLibrary(false);
    setSearchQuery('');
    toast.success(`Added ${item.name}`);
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const nextSet: SetEntry = {
          setNumber: ex.sets.length + 1,
          weight: lastSet ? lastSet.weight : 40,
          reps: lastSet ? lastSet.reps : 10,
          rpe: 8,
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, nextSet] };
      })
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const filtered = ex.sets.filter((_, idx) => idx !== setIndex);
        return {
          ...ex,
          sets: filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
        };
      })
    );
  };

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: keyof SetEntry,
    val: any
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const updated = [...ex.sets];
        updated[setIndex] = { ...updated[setIndex], [field]: val };
        return { ...ex, sets: updated };
      })
    );
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const currentSet = ex.sets[setIndex];
    const willBeCompleted = !currentSet.completed;

    // Trigger PR confetti if weight exceeds previous recorded threshold
    if (willBeCompleted && currentSet.weight >= 92.5) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });
      toast.success('🏆 New Personal Record Logged!', {
        description: `Stellar lift! ${currentSet.weight} kg × ${currentSet.reps} reps`,
      });
    }

    updateSet(exerciseId, setIndex, 'completed', willBeCompleted);

    // Auto-trigger rest timer if completed
    if (willBeCompleted) {
      startRestTimer(90, ex.name);
      toast.info('Rest timer started: 90s');
    }
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const repeatLastWorkout = () => {
    setExercises([
      {
        id: `ex-${Date.now()}-1`,
        name: 'Barbell Back Squat',
        category: 'Legs',
        previousBest: '130 kg × 5',
        sets: [
          { setNumber: 1, weight: 100, reps: 8, rpe: 7, completed: false },
          { setNumber: 2, weight: 110, reps: 6, rpe: 8, completed: false },
          { setNumber: 3, weight: 120, reps: 5, rpe: 8.5, completed: false },
        ],
      },
      {
        id: `ex-${Date.now()}-2`,
        name: 'Romanian Deadlift (RDL)',
        category: 'Legs',
        previousBest: '120 kg × 6',
        sets: [
          { setNumber: 1, weight: 90, reps: 10, rpe: 7.5, completed: false },
          { setNumber: 2, weight: 100, reps: 8, rpe: 8, completed: false },
          { setNumber: 3, weight: 110, reps: 6, rpe: 8.5, completed: false },
        ],
      },
    ]);
    setWorkoutTitle('Leg Day Heavy Protocol');
    toast.success('Loaded "Leg Day Heavy Protocol" template');
  };

  const saveWorkout = async () => {
    if (exercises.length === 0) {
      toast.error('Add at least one exercise to save workout');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: workoutTitle,
        date: new Date().toISOString(),
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets.map((s) => ({
            sets: s.setNumber,
            reps: s.reps,
            weight: s.weight,
          })),
        })),
      };
      await api.createWorkout(payload);
      toast.success('Workout session saved successfully to your log history!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving workout');
    } finally {
      setSaving(false);
    }
  };

  const filteredLibrary = exerciseLibrary.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Input
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            className="font-display font-extrabold text-2xl sm:text-3xl bg-transparent border-none p-0 focus-visible:ring-0 text-foreground h-auto w-full sm:w-96"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>Set-by-set execution</span>
            <span>•</span>
            <span className="text-primary font-medium">Automatic PR tracking active</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={repeatLastWorkout}
            className="rounded-xl text-xs h-10 border-border/80 font-semibold gap-1.5 flex-1 sm:flex-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Repeat Last Session
          </Button>

          <Button
            onClick={saveWorkout}
            disabled={saving}
            className="rounded-xl text-xs h-10 font-semibold shadow-md shadow-primary/20 gap-1.5 flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Finish & Save'}
          </Button>
        </div>
      </div>

      {/* Exercises Cards */}
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">{exercise.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">{exercise.category}</span>
                    {exercise.previousBest && (
                      <>
                        <span>•</span>
                        <span>Previous best: {exercise.previousBest}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeExercise(exercise.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Remove Exercise"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </CardHeader>

            <CardContent className="p-0">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/10 border-b border-border/40">
                <div className="col-span-2 text-center">Set</div>
                <div className="col-span-3 text-center">Weight (kg)</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-2 text-center">RPE</div>
                <div className="col-span-2 text-center">Done</div>
              </div>

              {/* Sets Rows */}
              <div className="divide-y divide-border/30">
                {exercise.sets.map((set, setIdx) => (
                  <div
                    key={set.setNumber}
                    className={`grid grid-cols-12 gap-2 px-5 py-3 items-center text-sm transition-colors ${
                      set.completed ? 'bg-primary/5' : 'hover:bg-muted/15'
                    }`}
                  >
                    <div className="col-span-2 text-center font-bold font-mono text-xs text-muted-foreground">
                      {set.setNumber}
                    </div>

                    <div className="col-span-3">
                      <Input
                        type="number"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, 'weight', parseFloat(e.target.value) || 0)
                        }
                        className="h-9 text-center font-mono font-bold rounded-xl text-sm"
                      />
                    </div>

                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, 'reps', parseInt(e.target.value) || 0)
                        }
                        className="h-9 text-center font-mono font-bold rounded-xl text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        step="0.5"
                        value={set.rpe || 8}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, 'rpe', parseFloat(e.target.value) || 8)
                        }
                        className="h-9 text-center font-mono text-xs rounded-xl"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSetComplete(exercise.id, setIdx)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                          set.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                            : 'border-border/80 hover:border-emerald-500 bg-card text-muted-foreground'
                        }`}
                        title={set.completed ? 'Set completed' : 'Mark completed & start rest timer'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSet(exercise.id, setIdx)}
                        className="text-muted-foreground hover:text-destructive opacity-40 hover:opacity-100 p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <div className="p-3 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addSet(exercise.id)}
                  className="rounded-xl text-xs font-semibold gap-1.5 h-8 text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Set
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Quick rest timer:</span>
                  <button
                    onClick={() => startRestTimer(60, exercise.name)}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-card border border-border/80 hover:border-primary text-muted-foreground"
                  >
                    60s
                  </button>
                  <button
                    onClick={() => startRestTimer(90, exercise.name)}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-card border border-border/80 hover:border-primary text-muted-foreground"
                  >
                    90s
                  </button>
                  <button
                    onClick={() => startRestTimer(120, exercise.name)}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-card border border-border/80 hover:border-primary text-muted-foreground"
                  >
                    120s
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Exercise from Library */}
      <div className="relative">
        <Button
          onClick={() => setShowLibrary(!showLibrary)}
          variant="outline"
          className="w-full h-12 rounded-2xl border-dashed border-2 border-border/80 font-semibold text-sm gap-2 bg-card/40 hover:bg-card/80"
        >
          <Plus className="w-4 h-4 text-primary" />
          Add Exercise from Fitness Library
        </Button>

        {showLibrary && (
          <div className="mt-3 p-4 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercise by muscle or name..."
                className="pl-9 h-10 rounded-xl bg-background"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-border/30">
              {filteredLibrary.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => addExerciseFromLibrary(item)}
                  className="pt-2 first:pt-0 flex items-center justify-between p-2 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-semibold text-sm text-foreground block">{item.name}</span>
                    <span className="text-xs text-muted-foreground">Previous: {item.previousBest}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutLogger;
