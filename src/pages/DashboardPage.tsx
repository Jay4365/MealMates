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
  ArrowRight,
  Sparkles,
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
    <div className="space-y-5 animate-fade-in-up">
      {/* Top Header Bento Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bento-pill bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-rose-500" />
              Room Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Hi, {displayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Shared meal expenses, real-time splits & transparent settlements.
          </p>
        </div>

        {/* Dynamic Month Selector Bento Capsule */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#14151f] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <Calendar className="w-4 h-4 text-rose-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              {monthOptions.map((opt: { key: string; label: string }) => (
                <option key={opt.key} value={opt.key} className="dark:bg-[#14151f] text-slate-900 dark:text-white font-semibold">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Bento Boxes */}
      <StatCards selectedMonth={selectedMonth} />

      {/* Hero Bento Banner */}
      <div className="bento-card bento-hero p-6 sm:p-7 bg-slate-900 text-white dark:bg-[#181926] dark:border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
            <Utensils className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                Personal Monthly Ledger
              </h3>
              <span className="bento-pill bg-white/15 text-white text-[10px]">
                {selectedMonthLabel}
              </span>
            </div>
            <p className="text-xs text-slate-300 dark:text-slate-400 mt-1 max-w-xl">
              Break down your exact food consumption, payments made, and settle balances with roommates in one tap.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('monthly-report')}
          className="bento-btn px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-600 rounded-2xl text-xs font-bold shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>View Statement</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bento Grid: Today's Meals (Left) & Member Balances (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Meals (7 cols) */}
        <div className="lg:col-span-7">
          <TodaysMeals
            onOpenAddMeal={onOpenAddMeal}
            onViewMeal={onViewMeal}
          />
        </div>

        {/* Member Balances (5 cols) */}
        <div className="lg:col-span-5">
          <MemberBalancesCard
            onOpenSettlement={onOpenSettlement}
            onNavigateToMembers={() => onNavigateTab('members')}
          />
        </div>
      </div>

      {/* Recent Meals Bento Card */}
      <div className="bento-card p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Recent Meals in {selectedMonthLabel}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest recorded breakfast, lunch & dinner splits
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('history')}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <span>All History</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentMeals.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-bold">No meals recorded yet in {selectedMonthLabel}.</p>
            <button
              onClick={() => onOpenAddMeal('lunch')}
              className="mt-3 text-xs font-extrabold text-rose-500 hover:underline cursor-pointer"
            >
              + Add First Meal
            </button>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05] mt-1">
            {recentMeals.map((meal) => {
              const isLunch = meal.meal_type === 'lunch';
              return (
                <div
                  key={meal.id}
                  onClick={() => onViewMeal(meal)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        isLunch
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {isLunch ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                          {meal.meal_type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {meal.date}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                        Paid by <strong className="text-slate-800 dark:text-slate-200">{getMemberName(meal.paid_by)}</strong> • {meal.eater_ids?.length || 1} eaters
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(meal.total_amount, currency)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      {formatCurrency(Math.round(meal.total_amount / (meal.eater_ids?.length || 1)), currency)}/head
                    </span>
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
