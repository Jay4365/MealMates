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
  const { meals, members, currency, selectedMonth, selectedMonthLabel } = useApp();

  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = selectedMonth === currentMonthKey;

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // For current month, look for today's meals.
  // For another month, look for meals in that month (most recent first).
  const monthMeals = meals.filter((m) => m.date.startsWith(selectedMonth));

  const lunchMeal = isCurrentMonth
    ? meals.find((m) => m.date === todayStr && m.meal_type === 'lunch')
    : monthMeals.find((m) => m.meal_type === 'lunch');

  const dinnerMeal = isCurrentMonth
    ? meals.find((m) => m.date === todayStr && m.meal_type === 'dinner')
    : monthMeals.find((m) => m.meal_type === 'dinner');

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Unknown';
  };

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col h-full animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2.5">
            <span>{isCurrentMonth ? "Today's Meals" : "Meals Overview"}</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {isCurrentMonth ? formattedDate : selectedMonthLabel}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isCurrentMonth ? "Real-time split for lunch and dinner" : `Latest lunch and dinner entries for ${selectedMonthLabel}`}
          </p>
        </div>
        <button
          onClick={() => onOpenAddMeal()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>+ Add Entry</span>
        </button>
      </div>

      {/* Meals Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 flex-1">
        {/* Lunch Card */}
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-orange-500/[0.03] to-white dark:to-slate-900/60 p-4.5 flex flex-col justify-between relative overflow-hidden hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Lunch
                </h4>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isCurrentMonth ? 'Afternoon meal' : (lunchMeal ? `Recorded: ${lunchMeal.date}` : 'Afternoon meal')}
                </span>
              </div>
            </div>
            {lunchMeal && (
              <button
                onClick={() => onViewMeal(lunchMeal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="View breakdown"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {lunchMeal ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Bill:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(lunchMeal.total_amount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Eaters:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <UserCheck className="w-3.5 h-3.5" />
                  {lunchMeal.eater_ids.length} persons
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 p-2.5 rounded-xl">
                <span className="text-amber-800 dark:text-amber-300 font-bold">Split Per Person:</span>
                <span className="font-black text-amber-700 dark:text-amber-300 text-sm">
                  {formatCurrency(lunchMeal.total_amount / (lunchMeal.eater_ids.length || 1), currency)}
                  <span className="text-[10px] font-normal text-amber-600/80"> / head</span>
                </span>
              </div>

              <div className="pt-2.5 border-t border-amber-500/15 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Paid by:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                  {getMemberName(lunchMeal.paid_by)}
                </span>
              </div>
            </div>
          ) : (
            <div className="my-5 text-center py-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                No lunch logged {isCurrentMonth ? 'today' : `in ${selectedMonthLabel}`}
              </p>
              <button
                onClick={() => onOpenAddMeal('lunch')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Log Lunch Entry
              </button>
            </div>
          )}
        </div>

        {/* Dinner Card */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.03] to-white dark:to-slate-900/60 p-4.5 flex flex-col justify-between relative overflow-hidden hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Dinner
                </h4>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isCurrentMonth ? 'Evening meal' : (dinnerMeal ? `Recorded: ${dinnerMeal.date}` : 'Evening meal')}
                </span>
              </div>
            </div>
            {dinnerMeal && (
              <button
                onClick={() => onViewMeal(dinnerMeal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="View breakdown"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {dinnerMeal ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Bill:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(dinnerMeal.total_amount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Eaters:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  <UserCheck className="w-3.5 h-3.5" />
                  {dinnerMeal.eater_ids.length} persons
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 p-2.5 rounded-xl">
                <span className="text-indigo-800 dark:text-indigo-300 font-bold">Split Per Person:</span>
                <span className="font-black text-indigo-700 dark:text-indigo-300 text-sm">
                  {formatCurrency(dinnerMeal.total_amount / (dinnerMeal.eater_ids.length || 1), currency)}
                  <span className="text-[10px] font-normal text-indigo-600/80"> / head</span>
                </span>
              </div>

              <div className="pt-2.5 border-t border-indigo-500/15 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Paid by:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                  {getMemberName(dinnerMeal.paid_by)}
                </span>
              </div>
            </div>
          ) : (
            <div className="my-5 text-center py-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                No dinner logged {isCurrentMonth ? 'today' : `in ${selectedMonthLabel}`}
              </p>
              <button
                onClick={() => onOpenAddMeal('dinner')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Log Dinner Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
