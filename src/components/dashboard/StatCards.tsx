import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Utensils, Wallet, TrendingUp, CalendarDays, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-fade-in-up">
      {/* 1. Total Meals */}
      <div className="glass-card hover-lift rounded-3xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Meals
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs border border-emerald-500/20">
            <Utensils className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
        <div className="mt-3.5">
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalMealsCount}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              ☀️ {lunchCount} Lunch
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
              🌙 {dinnerCount} Dinner
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="glass-card hover-lift rounded-3xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Spent
          </span>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs border border-indigo-500/20">
            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
        <div className="mt-3.5">
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpense, currency)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1">
            <span>In {selectedMonthLabel}</span>
            <span>•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              Avg {formatCurrency(totalMealsCount > 0 ? Math.round(totalExpense / totalMealsCount) : 0, currency)}/meal
            </span>
          </p>
        </div>
      </div>

      {/* 3. My Net Ledger Balance */}
      <div className={`glass-card hover-lift rounded-3xl p-5 relative overflow-hidden group ${
        isPositive
          ? 'border-emerald-500/30'
          : isNegative
          ? 'border-rose-500/30'
          : 'border-slate-200/80 dark:border-white/10'
      }`}>
        <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none ${
          isPositive ? 'bg-emerald-500/15' : isNegative ? 'bg-rose-500/15' : 'bg-slate-500/10'
        }`}></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
            My Balance {currentMemberBalance?.member_name ? `(${currentMemberBalance.member_name})` : ''}
          </span>
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border transition-colors ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : isNegative
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Wallet className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
          </div>
        </div>
        <div className="mt-3.5">
          <div
            className={`text-3xl font-black tracking-tight flex items-center gap-1.5 ${
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
          <p className="text-[11px] mt-2 font-bold flex items-center gap-1">
            {isPositive && (
              <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                You will receive {formatCurrency(Math.abs(myNetBalance), currency)}
              </span>
            )}
            {isNegative && (
              <span className="text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                You owe {formatCurrency(Math.abs(myNetBalance), currency)}
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                All squared up • ₹0
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Today's Expense / Per Person Split */}
      <div className="glass-card hover-lift rounded-3xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isCurrentMonth ? "Today's Expense" : "Avg Per Meal"}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs border border-amber-500/20">
            {isCurrentMonth ? (
              <CalendarDays className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            )}
          </div>
        </div>
        <div className="mt-3.5">
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isCurrentMonth
              ? formatCurrency(todayExpense, currency)
              : formatCurrency(totalMealsCount > 0 ? Math.round(totalExpense / totalMealsCount) : 0, currency)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isCurrentMonth ? (
              todayMeals.length > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  {todayMeals.length} {todayMeals.length === 1 ? 'meal' : 'meals'} recorded today
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">No meals logged today yet</span>
              )
            ) : (
              <span>Across {totalMealsCount} meals in {selectedMonthLabel}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
