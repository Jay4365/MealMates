import React, { useMemo } from 'react';
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
  Sparkles,
  ArrowRight,
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
  const { user, meals, members, currency, selectedMonth, setSelectedMonth, monthOptions, selectedMonthLabel } = useApp();

  // Filter meals strictly for the selected month
  const monthMeals = useMemo(() => {
    return meals.filter((m) => m.date.startsWith(selectedMonth));
  }, [meals, selectedMonth]);

  // Recent 5 meals in selected month
  const recentMeals = monthMeals.slice(0, 5);

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Unknown';
  };

  const displayName = user?.name || members[0]?.name || 'Roommate';

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Household Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome Back, <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">{displayName}</span>! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time meal ledger, per-person calculations, and easy roommate settlements.
          </p>
        </div>

        {/* Dynamic Month Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-850/90 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-emerald-500/40 transition-colors backdrop-blur-md">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              {monthOptions.map((opt: { key: string; label: string }) => (
                <option key={opt.key} value={opt.key} className="dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <StatCards selectedMonth={selectedMonth} />

      {/* Personal Statement High-Impact Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl shadow-emerald-600/15 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-base sm:text-lg leading-tight flex items-center gap-2">
              <span>Personal Monthly Ledger</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 text-white">
                {selectedMonthLabel}
              </span>
            </h4>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              View your exact food share, total bills paid, and simplified settlement instructions with your roommates.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('monthly-report')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-extrabold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all shrink-0 self-start sm:self-auto cursor-pointer relative z-10"
        >
          <span>Open My Statement</span>
          <ArrowRight className="w-4 h-4" />
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

      {/* Recent Meal History Card */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span>Recent Meals</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ({selectedMonthLabel})
              </span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Latest food expenses entered in {selectedMonthLabel}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentMeals.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Utensils className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              No meals recorded in {selectedMonthLabel}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Start by logging your lunch or dinner to split the cost automatically with roommates.
            </p>
            <button
              onClick={() => onOpenAddMeal()}
              className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer active:scale-95"
            >
              + Add Meal for {selectedMonthLabel}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.05] mt-2">
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
                  className="py-3 px-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-2xl transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                        isLunch
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                          : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                      }`}
                    >
                      {isLunch ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {formattedDate} • <span className="capitalize">{meal.meal_type}</span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md">
                          {eaterCount} ate
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Paid by <strong className="text-slate-800 dark:text-slate-200 font-bold">{getMemberName(meal.paid_by)}</strong>
                        {meal.notes ? ` • "${meal.notes}"` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-black text-slate-900 dark:text-white text-base">
                        {formatCurrency(meal.total_amount, currency)}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatCurrency(perPerson, currency)}/person
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
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
