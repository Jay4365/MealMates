import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Meal } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  History,
  Search,
  Eye,
  Edit,
  Trash2,
  Sun,
  Moon,
  Plus,
  ArrowUpDown,
  Download,
  Wallet,
  Utensils,
  TrendingUp,
  Receipt,
} from 'lucide-react';

interface HistoryPageProps {
  onOpenAddMeal: () => void;
  onViewMeal: (meal: Meal) => void;
  onEditMeal: (meal: Meal) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onOpenAddMeal,
  onViewMeal,
  onEditMeal,
}) => {
  const { meals, members, currency, deleteMeal, selectedMonth: appSelectedMonth, setSelectedMonth: setAppSelectedMonth, monthOptions } = useApp();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(appSelectedMonth || 'all');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [selectedPaidBy, setSelectedPaidBy] = useState<string>('all');
  const [selectedEater, setSelectedEater] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Keep synced when appSelectedMonth changes
  useEffect(() => {
    if (appSelectedMonth) {
      setSelectedMonth(appSelectedMonth);
    }
  }, [appSelectedMonth]);

  // Filtered meals
  const filteredMeals = useMemo(() => {
    return meals
      .filter((m: Meal) => {
        // Month filter
        if (selectedMonth !== 'all' && !m.date.startsWith(selectedMonth)) return false;
        // Meal Type filter
        if (selectedMealType !== 'all' && m.meal_type !== selectedMealType) return false;
        // Paid By filter
        if (selectedPaidBy !== 'all' && m.paid_by !== selectedPaidBy) return false;
        // Eater filter
        if (selectedEater !== 'all' && !m.eater_ids.includes(selectedEater)) return false;
        // Search term (notes or date)
        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          const matchesNotes = m.notes?.toLowerCase().includes(query);
          const matchesDate = m.date.includes(query);
          const payerName = members.find((mb) => mb.id === m.paid_by)?.name.toLowerCase();
          const matchesPayer = payerName?.includes(query);
          if (!matchesNotes && !matchesDate && !matchesPayer) return false;
        }
        return true;
      })
      .sort((a: Meal, b: Meal) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [meals, selectedMonth, selectedMealType, selectedPaidBy, selectedEater, searchTerm, sortOrder, members]);

  // Summary calculations for top cards
  const totalExpense = useMemo(() => {
    return filteredMeals.reduce((acc, m) => acc + (Number(m.total_amount) || 0), 0);
  }, [filteredMeals]);

  const lunchCount = useMemo(() => {
    return filteredMeals.filter((m) => m.meal_type === 'lunch').length;
  }, [filteredMeals]);

  const dinnerCount = useMemo(() => {
    return filteredMeals.filter((m) => m.meal_type === 'dinner').length;
  }, [filteredMeals]);

  const averageMealCost = useMemo(() => {
    return filteredMeals.length > 0 ? Math.round(totalExpense / filteredMeals.length) : 0;
  }, [filteredMeals, totalExpense]);

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Unknown';
  };

  const handleDelete = async (meal: Meal) => {
    if (window.confirm(`Delete ${meal.meal_type} entry of ${formatCurrency(meal.total_amount, currency)} on ${meal.date}?`)) {
      await deleteMeal(meal.id);
    }
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Date', 'Meal Type', 'Amount', 'Paid By', 'Eaters Count', 'Per Person Cost', 'Notes'];
    const rows = filteredMeals.map((m) => {
      const perPerson = Math.round((m.total_amount / (m.eater_ids.length || 1)) * 100) / 100;
      return [
        m.date,
        m.meal_type,
        m.total_amount,
        `"${getMemberName(m.paid_by)}"`,
        m.eater_ids.length,
        perPerson,
        `"${m.notes || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mealmates_history_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Transactions & History
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Meal History Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Filter, search, inspect breakdowns, or edit any past household meal expense.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddMeal}
            className="shimmer-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Entry</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Expense */}
        <div className="glass-card hover-lift rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filtered Expense
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalExpense, currency)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              {selectedMonth === 'all' ? 'All recorded time' : `Filtered for ${selectedMonth}`}
            </p>
          </div>
        </div>

        {/* 2. Total Meals */}
        <div className="glass-card hover-lift rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Meals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {filteredMeals.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-bold">
              <span className="text-amber-600 dark:text-amber-400">☀️ {lunchCount} Lunch</span>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400">🌙 {dinnerCount} Dinner</span>
            </p>
          </div>
        </div>

        {/* 3. Average Meal Cost */}
        <div className="glass-card hover-lift rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average / Meal
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(averageMealCost, currency)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              Average cost per meal entry
            </p>
          </div>
        </div>

        {/* 4. Active Scope */}
        <div className="glass-card hover-lift rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Scope
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {selectedMonth === 'all'
                ? 'All Recorded Time'
                : new Date(selectedMonth + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 truncate font-medium">
              {selectedPaidBy !== 'all' ? `Payer: ${getMemberName(selectedPaidBy)}` : 'All roommates included'}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="glass-card rounded-3xl p-5 space-y-3.5">
        {/* Search Input & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by notes, payer name, or date (e.g. Biryani, Swiggy)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:ring-4 focus:ring-indigo-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Month */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Month Filter
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMonth(val);
                if (val !== 'all') {
                  setAppSelectedMonth(val);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="all">All Months</option>
              {monthOptions.map((opt) => (
                <option key={opt.key} value={opt.key} className="dark:bg-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Meal Type
            </label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="all">All Meals</option>
              <option value="lunch">☀️ Lunch Only</option>
              <option value="dinner">🌙 Dinner Only</option>
            </select>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Paid By
            </label>
            <select
              value={selectedPaidBy}
              onChange={(e) => setSelectedPaidBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="all">Anyone Paid</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="dark:bg-slate-900">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Eater */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Eater Included
            </label>
            <select
              value={selectedEater}
              onChange={(e) => setSelectedEater(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="all">Any Eater</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="dark:bg-slate-900">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Meals Table / Card View */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08]">
        {filteredMeals.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <History className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No meal entries match</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or click "+ Add Entry" to record a new meal.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-white/[0.06] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5">Meal Type</th>
                    <th className="py-4 px-5 text-center">Eaters</th>
                    <th className="py-4 px-5 text-right">Total Amount</th>
                    <th className="py-4 px-5 text-right">Per Person</th>
                    <th className="py-4 px-5">Paid By</th>
                    <th className="py-4 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {filteredMeals.map((meal: Meal) => {
                    const isLunch = meal.meal_type === 'lunch';
                    const eaterCount = meal.eater_ids?.length || 1;
                    const perPerson = Math.round((meal.total_amount / eaterCount) * 100) / 100;
                    const formattedDate = new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      weekday: 'short',
                    });

                    return (
                      <tr
                        key={meal.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Date */}
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Meal Type */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold text-xs capitalize ${
                              isLunch
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                                : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/25'
                            }`}
                          >
                            {isLunch ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                            <span>{meal.meal_type}</span>
                          </span>
                        </td>

                        {/* People */}
                        <td className="py-3.5 px-5 text-center whitespace-nowrap font-bold text-slate-600 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                            {eaterCount} ate
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap font-black text-slate-900 dark:text-white text-sm">
                          {formatCurrency(meal.total_amount, currency)}
                        </td>

                        {/* Per Person */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap font-black text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(perPerson, currency)}
                        </td>

                        {/* Paid By */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                            {getMemberName(meal.paid_by)}
                          </span>
                          {meal.notes && (
                            <span className="block text-[11px] text-slate-400 truncate max-w-[150px] mt-0.5">
                              "{meal.notes}"
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onViewMeal(meal)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="View breakdown"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditMeal(meal)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Edit meal"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(meal)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Delete meal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/[0.05]">
              {filteredMeals.map((meal: Meal) => {
                const isLunch = meal.meal_type === 'lunch';
                const eaterCount = meal.eater_ids?.length || 1;
                const perPerson = Math.round((meal.total_amount / eaterCount) * 100) / 100;
                const formattedDate = new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <div key={meal.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize ${
                            isLunch
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                              : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/25'
                          }`}
                        >
                          {isLunch ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                          {meal.meal_type}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                          {formattedDate}
                        </span>
                      </div>
                      <div className="font-black text-slate-900 dark:text-white text-base">
                        {formatCurrency(meal.total_amount, currency)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                      <div>
                        Paid by: <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{getMemberName(meal.paid_by)}</strong>
                      </div>
                      <div className="text-indigo-600 dark:text-indigo-400 font-black">
                        {formatCurrency(perPerson, currency)} / head ({eaterCount} ate)
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onViewMeal(meal)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => onEditMeal(meal)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(meal)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
