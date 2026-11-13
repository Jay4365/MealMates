import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Utensils, TrendingUp, CalendarDays, ArrowDownRight, ArrowUpRight, CheckCircle2, Wallet } from 'lucide-react';

interface StatCardsProps {
  selectedMonth: string; // "YYYY-MM"
}

export const StatCards: React.FC<StatCardsProps> = ({ selectedMonth }) => {
  const { meals, monthlyBalances, currency, user, selectedMonthLabel } = useApp();

  // Filter meals for the selected month
  const monthMeals = meals.filter((m) => m.date.startsWith(selectedMonth));
  const totalMealsCount = monthMeals.length;
  const totalExpense = monthMeals.reduce((acc, m) => acc + (Number(m.total_amount) || 0), 0);

  // Check if selectedMonth is the current real-world month
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = selectedMonth === currentMonthKey;

  // Today's Expense
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayMeals = meals.filter((m) => m.date === todayStr);
  const todayExpense = todayMeals.reduce((acc, m) => acc + (Number(m.total_amount) || 0), 0);

  // Current logged in user balance for this selected month
  const currentMemberBalance = monthlyBalances.find((b) => 
    user?.name && b.member_name.toLowerCase() === user.name.toLowerCase()
  ) || monthlyBalances[0];

  const myNetBalance = currentMemberBalance?.net_balance || 0;
  const isPositive = myNetBalance > 0.01;
  const isNegative = myNetBalance < -0.01;

  const lunchCount = monthMeals.filter((m) => m.meal_type === 'lunch').length;
  const dinnerCount = monthMeals.filter((m) => m.meal_type === 'dinner').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
      {/* 1. Total Meals Bento Card */}
      <div className="bento-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Meals
          </span>
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            {totalMealsCount}
          </div>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="bento-pill bg-amber-500/10 text-amber-700 dark:text-amber-400">
              ☀️ {lunchCount} Lunch
            </span>
            <span className="bento-pill bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              🌙 {dinnerCount} Dinner
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Expense Bento Card */}
      <div className="bento-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Spent
          </span>
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(totalExpense, currency)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-semibold flex items-center gap-1.5">
            <span>{selectedMonthLabel}</span>
            <span>•</span>
            <span className="text-slate-900 dark:text-white font-bold">
              Avg {formatCurrency(totalMealsCount > 0 ? Math.round(totalExpense / totalMealsCount) : 0, currency)}/meal
            </span>
          </p>
        </div>
      </div>

      {/* 3. My Net Ledger Bento Card */}
      <div className="bento-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
            My Balance
          </span>
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : isNegative
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-500'
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div
            className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight flex items-center gap-1.5 ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : isNegative
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-7 h-7 stroke-[2.5]" />}
            {isNegative && <ArrowDownRight className="w-7 h-7 stroke-[2.5]" />}
            {!isPositive && !isNegative && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            {formatCurrency(myNetBalance, currency, true)}
          </div>
          <div className="mt-3">
            {isPositive && (
              <span className="bento-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                You get back {formatCurrency(Math.abs(myNetBalance), currency)}
              </span>
            )}
            {isNegative && (
              <span className="bento-pill bg-rose-500/10 text-rose-700 dark:text-rose-400">
                You owe {formatCurrency(Math.abs(myNetBalance), currency)}
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className="bento-pill bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                All Settled Up
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Today's Expense Bento Card */}
      <div className="bento-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isCurrentMonth ? "Today's Expense" : "Avg Per Head"}
          </span>
          <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            {isCurrentMonth
              ? formatCurrency(todayExpense, currency)
              : formatCurrency(totalMealsCount > 0 ? Math.round(totalExpense / totalMealsCount) : 0, currency)}
          </div>
          <div className="mt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {isCurrentMonth ? (
              todayMeals.length > 0 ? (
                <span className="bento-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  {todayMeals.length} {todayMeals.length === 1 ? 'meal' : 'meals'} today
                </span>
              ) : (
                <span className="text-slate-400">No meals logged yet</span>
              )
            ) : (
              <span>Across {totalMealsCount} meals</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
