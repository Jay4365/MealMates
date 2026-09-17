import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Utensils, Wallet, TrendingUp, CalendarDays, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface StatCardsProps {
  selectedMonth: string; // "YYYY-MM"
}

export const StatCards: React.FC<StatCardsProps> = ({ selectedMonth }) => {
  const { meals, balances, currency, user } = useApp();

  // Filter meals for the selected month
  const monthMeals = meals.filter((m) => m.date.startsWith(selectedMonth));
  const totalMealsCount = monthMeals.length;
  const totalExpense = monthMeals.reduce((acc, m) => acc + (Number(m.total_amount) || 0), 0);

  // Today's Expense
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.date === todayStr);
  const todayExpense = todayMeals.reduce((acc, m) => acc + (Number(m.total_amount) || 0), 0);

  // Current logged in user balance (or Jay's balance if in demo)
  const currentMemberBalance = balances.find((b) => 
    b.member_id === 'm-jay' || b.member_name.toLowerCase() === (user?.name?.toLowerCase() || 'jay')
  ) || balances[0];

  const myNetBalance = currentMemberBalance?.net_balance || 0;
  const isPositive = myNetBalance > 0.01;
  const isNegative = myNetBalance < -0.01;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Meals */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Meals
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {totalMealsCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {monthMeals.filter(m => m.meal_type === 'lunch').length} Lunch
            </span>
            <span>•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              {monthMeals.filter(m => m.meal_type === 'dinner').length} Dinner
            </span>
          </p>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Expense
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpense, currency)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {monthMeals.length} recorded meals
          </p>
        </div>
      </div>

      {/* 3. My Balance */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            My Balance ({currentMemberBalance?.member_name || 'Jay'})
          </span>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : isNegative
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-1.5 ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : isNegative
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-6 h-6" />}
            {isNegative && <ArrowDownRight className="w-6 h-6" />}
            {formatCurrency(myNetBalance, currency, true)}
          </div>
          <p className="text-xs mt-1 font-medium">
            {isPositive && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Will receive {formatCurrency(Math.abs(myNetBalance), currency)}
              </span>
            )}
            {isNegative && (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Need to pay {formatCurrency(Math.abs(myNetBalance), currency)}
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className="text-slate-500 dark:text-slate-400">All squared up! ₹0</span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Today's Expense */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today's Expense
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(todayExpense, currency)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {todayMeals.length > 0 ? `${todayMeals.length} meals entered today` : 'No meals recorded today yet'}
          </p>
        </div>
      </div>
    </div>
  );
};
