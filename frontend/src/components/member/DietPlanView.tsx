import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Flame,
  CheckCircle2,
  Clock,
  Plus,
  Apple,
  Fish,
  Beef,
  Wheat,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ProgressRing } from '../ui/progress-ring';
import { Badge } from '../ui/badge';

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: string[];
  completed: boolean;
}

const defaultMeals: Meal[] = [
  {
    id: '1',
    name: 'Breakfast / Fuel',
    time: '07:30 AM',
    calories: 550,
    protein: 38,
    carbs: 65,
    fat: 14,
    foods: ['4 Whole Eggs & Spinach', '1 Cup Rolled Oats with Berries', 'Black Coffee'],
    completed: true,
  },
  {
    id: '2',
    name: 'Pre-Workout Boost',
    time: '11:00 AM',
    calories: 320,
    protein: 25,
    carbs: 45,
    fat: 4,
    foods: ['1 Scoop Whey Protein Isolate', '1 Large Banana', 'Rice Cakes with Honey'],
    completed: true,
  },
  {
    id: '3',
    name: 'Post-Workout Lunch',
    time: '01:30 PM',
    calories: 720,
    protein: 55,
    carbs: 80,
    fat: 18,
    foods: ['200g Grilled Chicken Breast', '1.5 Cups Jasmine Rice', 'Steamed Broccoli with Olive Oil'],
    completed: false,
  },
  {
    id: '4',
    name: 'Evening Dinner',
    time: '07:45 PM',
    calories: 610,
    protein: 48,
    carbs: 42,
    fat: 22,
    foods: ['200g Baked Salmon Fillet', 'Roasted Sweet Potato', 'Mixed Green Avocado Salad'],
    completed: false,
  },
];

export const DietPlanView: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>(defaultMeals);

  const targets = {
    calories: 2600,
    protein: 180, // g
    carbs: 260, // g
    fat: 70, // g
  };

  const consumed = meals
    .filter((m) => m.completed)
    .reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

  const toggleMeal = (id: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-2.5">
            <Utensils className="w-7 h-7 text-emerald-500" />
            Nutritional Protocol & Macro Targets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized meal schedule programmed to match your training intensity and body recomposition goals.
          </p>
        </div>
      </div>

      {/* Macro Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Ring */}
        <Card className="p-5 flex items-center gap-4">
          <ProgressRing
            progress={(consumed.calories / targets.calories) * 100}
            size={76}
            strokeWidth={7}
            color="stroke-amber-500"
            trackColor="stroke-amber-500/20"
            showValue={false}
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Calories
            </div>
            <p className="font-display font-bold text-2xl text-foreground">
              {consumed.calories}
              <span className="text-xs text-muted-foreground font-normal ml-1">/ {targets.calories}</span>
            </p>
            <span className="text-[11px] text-muted-foreground">
              {targets.calories - consumed.calories} kcal remaining
            </span>
          </div>
        </Card>

        {/* Protein */}
        <Card className="p-5 flex items-center gap-4">
          <ProgressRing
            progress={(consumed.protein / targets.protein) * 100}
            size={76}
            strokeWidth={7}
            color="stroke-indigo-500"
            trackColor="stroke-indigo-500/20"
            showValue={false}
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Beef className="w-3.5 h-3.5" />
              Protein
            </div>
            <p className="font-display font-bold text-2xl text-foreground">
              {consumed.protein}g
              <span className="text-xs text-muted-foreground font-normal ml-1">/ {targets.protein}g</span>
            </p>
            <span className="text-[11px] text-muted-foreground">
              {Math.max(0, targets.protein - consumed.protein)}g left to hit target
            </span>
          </div>
        </Card>

        {/* Carbs */}
        <Card className="p-5 flex items-center gap-4">
          <ProgressRing
            progress={(consumed.carbs / targets.carbs) * 100}
            size={76}
            strokeWidth={7}
            color="stroke-cyan-500"
            trackColor="stroke-cyan-500/20"
            showValue={false}
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <Wheat className="w-3.5 h-3.5" />
              Carbs
            </div>
            <p className="font-display font-bold text-2xl text-foreground">
              {consumed.carbs}g
              <span className="text-xs text-muted-foreground font-normal ml-1">/ {targets.carbs}g</span>
            </p>
            <span className="text-[11px] text-muted-foreground">Glycogen replenishment</span>
          </div>
        </Card>

        {/* Fats */}
        <Card className="p-5 flex items-center gap-4">
          <ProgressRing
            progress={(consumed.fat / targets.fat) * 100}
            size={76}
            strokeWidth={7}
            color="stroke-rose-500"
            trackColor="stroke-rose-500/20"
            showValue={false}
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
              <Fish className="w-3.5 h-3.5" />
              Healthy Fats
            </div>
            <p className="font-display font-bold text-2xl text-foreground">
              {consumed.fat}g
              <span className="text-xs text-muted-foreground font-normal ml-1">/ {targets.fat}g</span>
            </p>
            <span className="text-[11px] text-muted-foreground">Hormonal balance</span>
          </div>
        </Card>
      </div>

      {/* Meals Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div>
            <CardTitle>Today's Meal Timeline</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Check off meals as you consume them to automatically update your daily macro breakdown.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-border/40">
          {meals.map((meal, idx) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                meal.completed ? 'opacity-85' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleMeal(meal.id)}
                  className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    meal.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : 'border-border hover:border-emerald-500 bg-card'
                  }`}
                >
                  {meal.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-display font-bold text-base ${
                        meal.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {meal.name}
                    </h4>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                      <Clock className="w-3 h-3" />
                      {meal.time}
                    </span>
                  </div>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                    {meal.foods.map((food, fIdx) => (
                      <li key={fIdx}>{food}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Meal Macro Badges */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {meal.calories} kcal
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {meal.protein}g P
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {meal.carbs}g C
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {meal.fat}g F
                </span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DietPlanView;
