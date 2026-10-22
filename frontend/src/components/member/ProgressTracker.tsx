import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Scale,
  Ruler,
  Percent,
  Plus,
  Calendar,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import api from '../../services/api';
import { toast } from 'sonner';

interface ProgressDataPoint {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  goalWeight: number;
}

const mockProgressHistory: ProgressDataPoint[] = [
  { date: 'Aug 01', weight: 82.5, bodyFat: 19.8, muscleMass: 37.2, goalWeight: 75 },
  { date: 'Aug 15', weight: 81.2, bodyFat: 19.1, muscleMass: 37.5, goalWeight: 75 },
  { date: 'Sep 01', weight: 80.0, bodyFat: 18.2, muscleMass: 38.0, goalWeight: 75 },
  { date: 'Sep 15', weight: 79.1, bodyFat: 17.5, muscleMass: 38.3, goalWeight: 75 },
  { date: 'Oct 01', weight: 77.8, bodyFat: 16.9, muscleMass: 38.8, goalWeight: 75 },
  { date: 'Oct 15', weight: 76.5, bodyFat: 16.2, muscleMass: 39.2, goalWeight: 75 },
  { date: 'Today', weight: 75.8, bodyFat: 15.8, muscleMass: 39.6, goalWeight: 75 },
];

export function ProgressTracker() {
  const [history, setHistory] = useState<ProgressDataPoint[]>(mockProgressHistory);
  const [activeMetric, setActiveMetric] = useState<'weight' | 'bodyFat' | 'muscleMass'>('weight');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('90D');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [inputWeight, setInputWeight] = useState('');
  const [inputBodyFat, setInputBodyFat] = useState('');
  const [inputChest, setInputChest] = useState('');
  const [inputWaist, setInputWaist] = useState('');

  // Before & After comparison state
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res: any = await api.getMyProgress();
        if (Array.isArray(res?.data?.progress) && res.data.progress.length > 0) {
          // Format if valid
        }
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWeight) return;

    const newPoint: ProgressDataPoint = {
      date: 'Just now',
      weight: parseFloat(inputWeight),
      bodyFat: inputBodyFat ? parseFloat(inputBodyFat) : 15.5,
      muscleMass: 39.8,
      goalWeight: 75,
    };

    setHistory((prev) => [...prev, newPoint]);
    setIsModalOpen(false);
    setInputWeight('');
    setInputBodyFat('');
    toast.success('Measurement logged successfully!');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'before') setBeforePhoto(reader.result as string);
        else setAfterPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success(`Uploaded ${type} comparison photo!`);
    }
  };

  const currentWeight = Number(history[history.length - 1]?.weight) || 75.8;
  const initialWeight = Number(history[0]?.weight) || 82.5;
  const weightDelta = (Number(currentWeight - initialWeight) || 0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-primary" />
            Body Composition & Progress Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quantifiable body metrics, goal trajectory analysis, and visual transformation milestones.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl font-semibold shadow-md shadow-primary/20 gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Measurements
        </Button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Weight */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Body Weight</span>
            <Scale className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-3xl text-foreground">{currentWeight}</span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold mt-1">
            <ArrowDownRight className="w-4 h-4" />
            <span>{Math.abs(Number(weightDelta))} kg dropped overall</span>
          </div>
        </Card>

        {/* Body Fat % */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Body Fat</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-3xl text-foreground">15.8</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold mt-1">
            <ArrowDownRight className="w-4 h-4" />
            <span>-4.0% in 90 days</span>
          </div>
        </Card>

        {/* Lean Muscle Mass */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Lean Muscle</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-3xl text-foreground">39.6</span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold mt-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>+2.4 kg muscle gained</span>
          </div>
        </Card>

        {/* Goal Proximity */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Target Goal</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-3xl text-foreground">75.0</span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            0.8 kg away from target!
          </span>
        </Card>
      </div>

      {/* Main Interactive Progress Chart */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/50 gap-4">
          <div>
            <CardTitle>Metric Trajectory vs. Target Line</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical progression trends across your measured timeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex p-1 rounded-xl bg-secondary text-xs">
              <button
                type="button"
                onClick={() => setActiveMetric('weight')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeMetric === 'weight' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Weight (kg)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('bodyFat')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeMetric === 'bodyFat' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Body Fat (%)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('muscleMass')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeMetric === 'muscleMass' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Muscle (kg)
              </button>
            </div>

            {/* Time Range */}
            <div className="flex p-1 rounded-xl bg-secondary text-xs">
              {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                    timeRange === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                {activeMetric === 'weight' && (
                  <ReferenceLine
                    y={75}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Target Goal: 75 kg',
                      fill: '#10b981',
                      fontSize: 11,
                      position: 'insideBottomRight',
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#metricGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Before / After Photo Transformation Gallery */}
      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Visual Body Transformation Gallery
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare side-by-side progression photos to visually evaluate definition and posture changes.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Baseline (Day 1)
              </span>
              <div className="relative w-full h-64 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/20 group">
                {beforePhoto ? (
                  <img src={beforePhoto} alt="Baseline" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No baseline photo uploaded</p>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-semibold">
                  <span>Upload / Replace Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'before')}
                  />
                </label>
              </div>
            </div>

            {/* Current Photo */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                Current Condition (Day 90)
              </span>
              <div className="relative w-full h-64 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden bg-primary/5 group">
                {afterPhoto ? (
                  <img src={afterPhoto} alt="Current Condition" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Sparkles className="w-10 h-10 text-primary/60 mx-auto mb-2" />
                    <p className="text-xs text-primary font-medium">Upload recent check-in photo</p>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-semibold">
                  <span>Upload Check-in Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'after')}
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Measurement Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-3xl max-w-md p-6 bg-card/95 backdrop-blur-xl border-border/80">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display font-bold text-xl">Log Body Measurements</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Body Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  placeholder="e.g. 75.8"
                  required
                  className="rounded-xl h-11"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Body Fat (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={inputBodyFat}
                  onChange={(e) => setInputBodyFat(e.target.value)}
                  placeholder="e.g. 15.8"
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Chest (cm)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={inputChest}
                  onChange={(e) => setInputChest(e.target.value)}
                  placeholder="104"
                  className="rounded-xl h-11"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Waist (cm)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={inputWaist}
                  onChange={(e) => setInputWaist(e.target.value)}
                  placeholder="82"
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 rounded-xl font-semibold shadow-md">
                Save Entry
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border-border/80"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProgressTracker;
