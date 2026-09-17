import React, { useState, useMemo } from 'react';
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
  const { meals, members, currency, deleteMeal } = useApp();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [selectedPaidBy, setSelectedPaidBy] = useState<string>('all');
  const [selectedEater, setSelectedEater] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Extract unique months available in meals
  const monthsAvailable = useMemo(() => {
    const set = new Set<string>();
    meals.forEach((m: Meal) => {
      const ym = m.date.substring(0, 7);
      set.add(ym);
    });
    return Array.from(set).sort().reverse();
  }, [meals]);

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
    if (window.confirm(`Are you sure you want to delete this ${meal.meal_type} entry for ₹${meal.total_amount}?`)) {
      await deleteMeal(meal.id);
    }
  };

  // Quick export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Meal Type', 'Total Amount', 'People Count', 'Per Person Cost', 'Paid By', 'Eaters', 'Notes'];
    const rows = filteredMeals.map((m: Meal) => {
      const eaterNames = m.eater_ids.map((id: string) => getMemberName(id)).join('; ');
      const perPerson = Math.round((m.total_amount / (m.eater_ids.length || 1)) * 100) / 100;
      return [
        m.date,
        m.meal_type,
        m.total_amount,
        m.eater_ids.length,
        perPerson,
        `"${getMemberName(m.paid_by)}"`,
        `"${eaterNames}"`,
        `"${m.notes || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mealmates_history_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Meal History</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete record of all shared lunches and dinners
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddMeal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Entry</span>
          </button>
        </div>
      </div>

      {/* Top Expense & Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Expense */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Expense
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalExpense, currency)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {selectedMonth === 'all' ? 'All-time total expense' : 'Total for selected filter'}
            </p>
          </div>
        </div>

        {/* 2. Total Meals */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Meals
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {filteredMeals.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{lunchCount} Lunch</span>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{dinnerCount} Dinner</span>
            </p>
          </div>
        </div>

        {/* 3. Average Meal Cost */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average / Meal
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(averageMealCost, currency)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Average cost per meal entry
            </p>
          </div>
        </div>

        {/* 4. Active Scope */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Filter Scope
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {selectedMonth === 'all'
                ? 'All Recorded Time'
                : new Date(selectedMonth + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {selectedPaidBy !== 'all' ? `Payer: ${getMemberName(selectedPaidBy)}` : 'All payers included'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        {/* Search Input & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by notes, payer, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Month */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
            >
              <option value="all">All Months</option>
              {monthsAvailable.map((m) => (
                <option key={m} value={m}>
                  {new Date(m + '-01T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Meal Type
            </label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
            >
              <option value="all">All Meals</option>
              <option value="lunch">☀️ Lunch Only</option>
              <option value="dinner">🌙 Dinner Only</option>
            </select>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Paid By
            </label>
            <select
              value={selectedPaidBy}
              onChange={(e) => setSelectedPaidBy(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
            >
              <option value="all">Anyone</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Eater */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Who Ate?
            </label>
            <select
              value={selectedEater}
              onChange={(e) => setSelectedEater(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
            >
              <option value="all">Any Eater</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Meals Table / Card View */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        {filteredMeals.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No meal entries match</h3>
            <p className="text-xs text-slate-400 mt-1">Try changing your filters or add a new meal.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Meal</th>
                    <th className="py-3.5 px-4 text-center">People</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-right">Per Person</th>
                    <th className="py-3.5 px-4">Paid By</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredMeals.map((meal: Meal) => {
                    const isLunch = meal.meal_type === 'lunch';
                    const eaterCount = meal.eater_ids?.length || 1;
                    const perPerson = Math.round((meal.total_amount / eaterCount) * 100) / 100;
                    const formattedDate = new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                    });

                    return (
                      <tr
                        key={meal.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
                      >
                        {/* Date */}
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Meal Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs capitalize ${
                              isLunch
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60'
                            }`}
                          >
                            {isLunch ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                            <span>{meal.meal_type}</span>
                          </span>
                        </td>

                        {/* People */}
                        <td className="py-3 px-4 text-center whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                          {eaterCount}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          {formatCurrency(meal.total_amount, currency)}
                        </td>

                        {/* Per Person */}
                        <td className="py-3 px-4 text-right whitespace-nowrap font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(perPerson, currency)}
                        </td>

                        {/* Paid By */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {getMemberName(meal.paid_by)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onViewMeal(meal)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                              title="View breakdown"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditMeal(meal)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                              title="Edit meal"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(meal)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
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
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
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
                  <div key={meal.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold capitalize ${
                            isLunch
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400'
                          }`}
                        >
                          {isLunch ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                          {meal.meal_type}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          {formattedDate}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(meal.total_amount, currency)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl">
                      <div>
                        Paid by: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{getMemberName(meal.paid_by)}</strong>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatCurrency(perPerson, currency)} / person ({eaterCount} ate)
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onViewMeal(meal)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => onEditMeal(meal)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(meal)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1"
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
