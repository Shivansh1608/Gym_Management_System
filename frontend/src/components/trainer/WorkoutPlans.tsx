import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, X, Dumbbell, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

interface Exercise { name: string; sets: number; reps: number; weight: number; }
interface WorkoutPlan {
  _id: string; name: string; description: string; duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: number; assignedTo: any[]; category: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  strength: '🏋️', cardio: '🏃', flexibility: '🧘', mixed: '⚡',
};

function PlanCard({ plan, onDelete }: { plan: WorkoutPlan; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border border-transparent hover:border-emerald-500/20 transition-all"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl shrink-0">
          {CATEGORY_EMOJIS[plan.category] || '💪'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{plan.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plan.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs border ${DIFFICULTY_STYLES[plan.difficulty]}`}>
              {plan.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground capitalize">
              {plan.category}
            </span>
          </div>
        </div>
        <button onClick={() => onDelete(plan._id)}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: Clock, label: 'Duration', value: plan.duration },
          { icon: Dumbbell, label: 'Exercises', value: plan.exercises },
          { icon: Users, label: 'Assigned', value: plan.assignedTo?.length || 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-muted/50 rounded-xl p-2.5 text-center">
            <Icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
      >
        <Eye className="w-4 h-4" />
        {expanded ? 'Hide Details' : 'View Plan'}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 bg-muted/30 rounded-xl text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Plan Details</p>
              <p>{plan.description}</p>
              <p className="mt-2">Duration: <span className="text-foreground font-medium">{plan.duration}</span></p>
              <p>Difficulty: <span className="text-foreground font-medium">{plan.difficulty}</span></p>
              <p>Category: <span className="text-foreground font-medium capitalize">{plan.category}</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const BLANK_PLAN = {
  name: '', description: '', duration: '8 weeks',
  difficulty: 'Intermediate' as const, category: 'strength' as const,
  exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }],
};

export function WorkoutPlans() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'strength' | 'cardio' | 'flexibility'>('all');
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState<typeof BLANK_PLAN>(BLANK_PLAN);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchPlans(); }, [activeFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.getAllPlans(activeFilter === 'all' ? undefined : activeFilter);
      setPlans((res.data?.plans || []).map((p: any) => ({
        ...p,
        exercises: p.exercises?.length || 0,
        assignedTo: p.assignedTo || [],
      })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.createPlan(newPlan);
      setShowCreateModal(false);
      setNewPlan(BLANK_PLAN);
      fetchPlans();
      toast.success('Workout plan created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create plan');
    } finally { setCreating(false); }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await api.deletePlan(id);
      setPlans(prev => prev.filter(p => p._id !== id));
      toast.success('Plan deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete plan');
    }
  };

  const updateExercise = (i: number, field: keyof Exercise, val: string) => {
    const exs = [...newPlan.exercises];
    (exs[i] as any)[field] = field === 'name' ? val : parseFloat(val) || 0;
    setNewPlan({ ...newPlan, exercises: exs });
  };

  const FILTERS = [
    { id: 'all' as const, label: 'All Plans', emoji: '📋' },
    { id: 'strength' as const, label: 'Strength', emoji: '🏋️' },
    { id: 'cardio' as const, label: 'Cardio', emoji: '🏃' },
    { id: 'flexibility' as const, label: 'Flexibility', emoji: '🧘' },
  ];

  if (loading) return (
    <div className="space-y-4 pb-20 md:pb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Workout Plans</h2>
          <p className="text-sm text-muted-foreground">Build and assign training programs</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: plans.length, color: 'text-foreground' },
          { label: 'Strength', value: plans.filter(p => p.category === 'strength').length, color: 'text-blue-400' },
          { label: 'Cardio', value: plans.filter(p => p.category === 'cardio').length, color: 'text-orange-400' },
          { label: 'Assigned', value: plans.reduce((s, p) => s + (p.assignedTo?.length || 0), 0), color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="glass-card rounded-xl p-1.5 flex gap-1 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
              activeFilter === f.id ? 'bg-emerald-600 text-white shadow' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {plans.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          {plans.map(plan => (
            <PlanCard key={plan._id} plan={plan} onDelete={handleDeletePlan} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="font-semibold text-muted-foreground">No workout plans yet</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Create your first workout plan to get started</p>
          <button onClick={() => setShowCreateModal(true)}
            className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500 transition-colors">
            + Create Plan
          </button>
        </div>
      )}

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                <h3 className="font-semibold text-foreground">Create Workout Plan</h3>
                <button onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="p-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plan Name *</label>
                  <input type="text" value={newPlan.name} required
                    onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="e.g., 12-Week Strength Builder"
                    className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description *</label>
                  <textarea value={newPlan.description} required rows={3}
                    onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}
                    placeholder="Describe the goals and structure of this plan…"
                    className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duration</label>
                    <select value={newPlan.duration} onChange={e => setNewPlan({ ...newPlan, duration: e.target.value })}
                      className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500">
                      {['4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Difficulty</label>
                    <select value={newPlan.difficulty} onChange={e => setNewPlan({ ...newPlan, difficulty: e.target.value as any })}
                      className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500">
                      {['Beginner', 'Intermediate', 'Advanced'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                    <select value={newPlan.category} onChange={e => setNewPlan({ ...newPlan, category: e.target.value as any })}
                      className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500">
                      {['strength', 'cardio', 'flexibility', 'mixed'].map(v => <option key={v} value={v} className="capitalize">{v}</option>)}
                    </select>
                  </div>
                </div>

                {/* Exercises */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-emerald-400" /> Exercises
                    </h4>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['Exercise', 'Sets', 'Reps', 'Weight(kg)'].map(h => (
                      <div key={h} className="text-xs text-muted-foreground font-medium">{h}</div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {newPlan.exercises.map((ex, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2">
                        <input type="text" value={ex.name} required placeholder="Squat…"
                          onChange={e => updateExercise(i, 'name', e.target.value)}
                          className="col-span-1 bg-muted border border-border text-foreground rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                        />
                        {(['sets', 'reps', 'weight'] as const).map(field => (
                          <input key={field} type="number" value={(ex as any)[field]} min={0}
                            onChange={e => updateExercise(i, field, e.target.value)}
                            className="bg-muted border border-border text-foreground rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => setNewPlan({ ...newPlan, exercises: [...newPlan.exercises, { name: '', sets: 3, reps: 10, weight: 0 }] })}
                    className="mt-3 w-full py-2 border-2 border-dashed border-emerald-500/30 rounded-xl text-emerald-400 text-xs hover:bg-emerald-500/10 transition-colors">
                    + Add Exercise
                  </button>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={creating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition-colors">
                    {creating ? 'Creating…' : 'Create Plan'}
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
