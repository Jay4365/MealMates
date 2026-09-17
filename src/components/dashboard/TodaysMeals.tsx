import React from 'react';
import type { Meal } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Sun, Moon, Plus, UserCheck, Eye } from 'lucide-react';

interface TodaysMealsProps {
  onOpenAddMeal: (initialType?: 'lunch' | 'dinner') => void;
  onViewMeal: (meal: Meal) => void;
}

export const TodaysMeals: React.FC<TodaysMealsProps> = ({ onOpenAddMeal, onViewMeal }) => {
  const { meals, members, currency } = useApp();

  // Find meals for today (or fallback to latest day with meals like 2026-09-15 for the demo experience)
  const todayStr = new Date().toISOString().split('T')[0];
  let currentDayMeals = meals.filter((m) => m.date === todayStr);

  // If today has no meals in demo, display September 15th demo data or current day
  const displayDateStr = currentDayMeals.length > 0 ? todayStr : '2026-09-15';
  const displayMeals = meals.filter((m) => m.date === displayDateStr);

  const lunchMeal = displayMeals.find((m) => m.meal_type === 'lunch');
  const dinnerMeal = displayMeals.find((m) => m.meal_type === 'dinner');

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Unknown';
  };

  const formattedDate = new Date(displayDateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <span>Today's Meals</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
              {formattedDate}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time split for lunch and dinner
          </p>
        </div>
        <button
          onClick={() => onOpenAddMeal()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Entry</span>
        </button>
      </div>

      {/* Meals Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 flex-1">
        {/* Lunch Card */}
        <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/10 dark:to-slate-800/60 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Lunch
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Afternoon meal
                </span>
              </div>
            </div>
            {lunchMeal && (
              <button
                onClick={() => onViewMeal(lunchMeal)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="View breakdown"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {lunchMeal ? (
            <div className="mt-4 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Amount:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(lunchMeal.total_amount, currency)}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">People Ate:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {lunchMeal.eater_ids.length} persons
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs bg-amber-100/60 dark:bg-amber-950/40 p-2 rounded-lg">
                <span className="text-amber-900 dark:text-amber-300 font-medium">Per Person:</span>
                <span className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                  {formatCurrency(lunchMeal.total_amount / (lunchMeal.eater_ids.length || 1), currency)}
                  <span className="text-[10px] font-normal"> / person</span>
                </span>
              </div>

              <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Paid by:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-xs">
                  {getMemberName(lunchMeal.paid_by)}
                </span>
              </div>
            </div>
          ) : (
            <div className="my-6 text-center py-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                No lunch recorded today
              </p>
              <button
                onClick={() => onOpenAddMeal('lunch')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Lunch
              </button>
            </div>
          )}
        </div>

        {/* Dinner Card */}
        <div className="rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/10 dark:to-slate-800/60 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Dinner
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Evening meal
                </span>
              </div>
            </div>
            {dinnerMeal && (
              <button
                onClick={() => onViewMeal(dinnerMeal)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="View breakdown"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {dinnerMeal ? (
            <div className="mt-4 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Amount:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(dinnerMeal.total_amount, currency)}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">People Ate:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {dinnerMeal.eater_ids.length} persons
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs bg-indigo-100/60 dark:bg-indigo-950/40 p-2 rounded-lg">
                <span className="text-indigo-900 dark:text-indigo-300 font-medium">Per Person:</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">
                  {formatCurrency(dinnerMeal.total_amount / (dinnerMeal.eater_ids.length || 1), currency)}
                  <span className="text-[10px] font-normal"> / person</span>
                </span>
              </div>

              <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-900/30 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Paid by:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-xs">
                  {getMemberName(dinnerMeal.paid_by)}
                </span>
              </div>
            </div>
          ) : (
            <div className="my-6 text-center py-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                No dinner recorded today
              </p>
              <button
                onClick={() => onOpenAddMeal('dinner')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Dinner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
