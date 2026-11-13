import React from 'react';
import type { Meal } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Sun, Moon, Plus, Eye } from 'lucide-react';

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

  const todayLunch = meals.find((m) => m.date === todayStr && m.meal_type === 'lunch');
  const todayDinner = meals.find((m) => m.date === todayStr && m.meal_type === 'dinner');

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Unknown';
  };

  return (
    <div className="bento-card p-5 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Today's Meals</span>
              <span className="bento-pill bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-[10px]">
                {today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Daily meal tracker & real-time roommate split
            </p>
          </div>
        </div>

        {!isCurrentMonth && (
          <div className="my-3 p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            Viewing past records for <strong>{selectedMonthLabel}</strong>. Switch to current month in selector to add today's meals.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
          {/* LUNCH CARD BENTO */}
          <div className="rounded-[22px] p-4 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex flex-col justify-between min-h-[170px]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Lunch
                  </span>
                </div>
                {todayLunch ? (
                  <span className="bento-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]">
                    Recorded
                  </span>
                ) : (
                  <span className="bento-pill bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 text-[10px]">
                    Pending
                  </span>
                )}
              </div>

              {todayLunch ? (
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(todayLunch.total_amount, currency)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Paid by <strong className="text-slate-800 dark:text-slate-200">{getMemberName(todayLunch.paid_by)}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {todayLunch.eater_ids.length} eaters • {formatCurrency(Math.round(todayLunch.total_amount / todayLunch.eater_ids.length), currency)}/head
                  </p>
                </div>
              ) : (
                <div className="mt-4 text-xs text-slate-400 font-medium">
                  Lunch has not been logged yet today.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
              {todayLunch ? (
                <button
                  onClick={() => onViewMeal(todayLunch)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddMeal('lunch')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Lunch</span>
                </button>
              )}
            </div>
          </div>

          {/* DINNER CARD BENTO */}
          <div className="rounded-[22px] p-4 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex flex-col justify-between min-h-[170px]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Dinner
                  </span>
                </div>
                {todayDinner ? (
                  <span className="bento-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]">
                    Recorded
                  </span>
                ) : (
                  <span className="bento-pill bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 text-[10px]">
                    Pending
                  </span>
                )}
              </div>

              {todayDinner ? (
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(todayDinner.total_amount, currency)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Paid by <strong className="text-slate-800 dark:text-slate-200">{getMemberName(todayDinner.paid_by)}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {todayDinner.eater_ids.length} eaters • {formatCurrency(Math.round(todayDinner.total_amount / todayDinner.eater_ids.length), currency)}/head
                  </p>
                </div>
              ) : (
                <div className="mt-4 text-xs text-slate-400 font-medium">
                  Dinner has not been logged yet today.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
              {todayDinner ? (
                <button
                  onClick={() => onViewMeal(todayDinner)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddMeal('dinner')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Dinner</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
