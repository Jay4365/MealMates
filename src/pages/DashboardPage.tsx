import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCards } from '../components/dashboard/StatCards';
import { TodaysMeals } from '../components/dashboard/TodaysMeals';
import { MemberBalancesCard } from '../components/dashboard/MemberBalancesCard';
import type { Meal } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Calendar,
  ChevronRight,
  Utensils,
  Sun,
  Moon,
} from 'lucide-react';

interface DashboardPageProps {
  onOpenAddMeal: (type?: 'lunch' | 'dinner') => void;
  onViewMeal: (meal: Meal) => void;
  onOpenSettlement: () => void;
  onNavigateTab: (tab: 'history' | 'monthly-report' | 'members' | 'settings') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddMeal,
  onViewMeal,
  onOpenSettlement,
  onNavigateTab,
}) => {
  const { user, meals, members, currency } = useApp();
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Dynamically generate month options based on current date and recorded meals
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthKey);
    const d = new Date();
    for (let i = 1; i <= 3; i++) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      set.add(`${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}`);
    }
    meals.forEach((m) => {
      if (m.date) set.add(m.date.substring(0, 7));
    });

    return Array.from(set)
      .sort()
      .reverse()
      .map((key) => {
        const [y, m] = key.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return { key, label };
      });
  }, [meals, currentMonthKey]);

  // Recent 5 meals
  const recentMeals = meals.slice(0, 5);

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Unknown';
  };

  const displayName = user?.name || members[0]?.name || 'Roommate';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* 25. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome Back, {displayName}! 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Let's keep our meal expenses simple and fair.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              {monthOptions.map((opt: { key: string; label: string }) => (
                <option key={opt.key} value={opt.key} className="dark:bg-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <StatCards selectedMonth={selectedMonth} />

      {/* Quick Person-wise Statement Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base leading-tight">
              Personal Monthly Statement
            </h4>
            <p className="text-xs text-emerald-100 mt-0.5">
              Check your exact monthly food expense, total bills paid, and who you owe or receive money from.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('monthly-report')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-sm hover:bg-emerald-50 active:scale-95 transition-all shrink-0 self-start sm:self-auto"
        >
          <span>View My Statement</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Section: Today's Meals & Member Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Meals (7 cols) */}
        <div className="lg:col-span-7">
          <TodaysMeals onOpenAddMeal={onOpenAddMeal} onViewMeal={onViewMeal} />
        </div>

        {/* Member Balances (5 cols) */}
        <div className="lg:col-span-5">
          <MemberBalancesCard onOpenSettlement={onOpenSettlement} />
        </div>
      </div>

      {/* Recent Meal History Preview */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Recent Meals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest lunch and dinner records
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
          >
            <span>View Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentMeals.length === 0 ? (
          <div className="py-12 text-center">
            <Utensils className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No meals yet</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Start by adding your first lunch or dinner.
            </p>
            <button
              onClick={() => onOpenAddMeal()}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
            >
              + Add Meal
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 mt-2">
            {recentMeals.map((meal: Meal) => {
              const isLunch = meal.meal_type === 'lunch';
              const eaterCount = meal.eater_ids?.length || 1;
              const perPerson = Math.round((meal.total_amount / eaterCount) * 100) / 100;
              const formattedDate = new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={meal.id}
                  onClick={() => onViewMeal(meal)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isLunch
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                      }`}
                    >
                      {isLunch ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {formattedDate} • <span className="capitalize">{meal.meal_type}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({eaterCount} ate)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Paid by <strong className="text-slate-700 dark:text-slate-300 font-medium">{getMemberName(meal.paid_by)}</strong>
                        {meal.notes ? ` • "${meal.notes}"` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(meal.total_amount, currency)}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrency(perPerson, currency)}/person
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
