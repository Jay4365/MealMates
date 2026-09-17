import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateMonthlyStats, formatCurrency } from '../utils/calculations';
import type { Meal } from '../types';
import {
  FileBarChart2,
  Calendar,
  Printer,
  Download,
  Sun,
  Moon,
  Users,
  Scale,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  User,
  Wallet,
  Utensils,
  Receipt,
} from 'lucide-react';

interface MonthlyReportPageProps {
  onOpenSettlementModal: () => void;
}

export const MonthlyReportPage: React.FC<MonthlyReportPageProps> = ({ onOpenSettlementModal }) => {
  const { meals, members, currency, group, user } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  
  // Selected member for individual statement (defaults to current user or first member)
  const defaultMember = members.find(
    (m) => m.name.toLowerCase() === (user?.name?.toLowerCase() || 'jay')
  ) || members[0];
  const [selectedMemberId, setSelectedMemberId] = useState<string>(defaultMember?.id || 'm-jay');

  // View mode: 'personal' (Person-wise Statement) or 'all' (All Roommates Overview)
  const [viewMode, setViewMode] = useState<'personal' | 'all'>('personal');

  const monthOptions = [
    { key: '2026-09', label: 'September 2026' },
    { key: '2026-08', label: 'August 2026' },
    { key: '2026-07', label: 'July 2026' },
  ];

  const stats = useMemo(() => {
    return generateMonthlyStats(meals, members, selectedMonth);
  }, [meals, members, selectedMonth]);

  // Selected person details
  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const selectedMemberSummary = stats.member_summaries.find((m) => m.member_id === selectedMemberId);

  // Month meals filtered
  const monthMeals = useMemo(() => {
    return meals.filter((m) => m.date.startsWith(selectedMonth));
  }, [meals, selectedMonth]);

  // Meals this specific person participated in or paid for
  const personMeals = useMemo(() => {
    return monthMeals.filter(
      (m) => m.eater_ids.includes(selectedMemberId) || m.paid_by === selectedMemberId
    );
  }, [monthMeals, selectedMemberId]);

  // Who this person needs to pay & who owes this person
  const mySettlementsToPay = stats.settlements.filter((s) => s.from_id === selectedMemberId);
  const mySettlementsToReceive = stats.settlements.filter((s) => s.to_id === selectedMemberId);

  const netBalance = selectedMemberSummary?.net_balance || 0;
  const isPos = netBalance > 0.01;
  const isNeg = netBalance < -0.01;

  // Handle browser print (generates clean PDF via print styles)
  const handlePrintPDF = () => {
    window.print();
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['Metric / Member', 'Total Meals', 'Total Spent', 'Net Balance'];
    const rows: (string | number)[][] = stats.member_summaries.map((m) => [
      `"${m.member_name}"`,
      m.meals_count,
      m.total_paid,
      m.net_balance,
    ]);

    rows.unshift(['--- SUMMARY STATS ---', '', '', '']);
    rows.unshift(['Total Expense', '', '', stats.total_expense]);
    rows.unshift(['Total Meals', '', '', stats.total_meals]);
    rows.unshift(['Lunch Count', '', '', stats.lunch_count]);
    rows.unshift(['Dinner Count', '', '', stats.dinner_count]);
    rows.unshift(['Average Cost Per Meal', '', '', stats.avg_cost_per_meal]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mealmates_monthly_report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Header with Month Selector & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileBarChart2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Monthly Report & Person-Wise Statement</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete person-wise expense breakdown, personal ledger, and who owes whom
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.key} value={opt.key} className="dark:bg-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Download PDF / Print */}
          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Personal Statement vs All Roommates */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 w-fit no-print">
        <button
          onClick={() => setViewMode('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'personal'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Person-Wise Statement</span>
        </button>

        <button
          onClick={() => setViewMode('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'all'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Roommates Overview</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEDICATED PERSON-WISE STATEMENT VIEW                                  */}
      {/* ========================================================================= */}
      {viewMode === 'personal' && (
        <div className="space-y-6">
          {/* Roommate Selector Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Roommate:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {members.map((m) => {
                const isSelected = m.id === selectedMemberId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: m.avatar_color }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Person Statement Main Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-700/80 shadow-md print-card">
            {/* Slip Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700/80 gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md"
                  style={{ backgroundColor: selectedMember?.avatar_color }}
                >
                  {selectedMember?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {selectedMember?.name}'s Monthly Statement
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {stats.month_str}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Household: <strong>{group.name}</strong> • Individual Ledger & Settlement Summary
                  </p>
                </div>
              </div>

              {/* Net Balance Status Badge */}
              <div className="text-left sm:text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Final Net Balance
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xl font-black ${
                    isPos
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-700'
                      : isNeg
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-2 border-rose-300 dark:border-rose-700'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isPos && <ArrowUpRight className="w-5 h-5 stroke-[3]" />}
                  {isNeg && <ArrowDownRight className="w-5 h-5 stroke-[3]" />}
                  <span>{formatCurrency(netBalance, currency, true)}</span>
                </div>
                <div className="text-xs font-bold mt-1">
                  {isPos && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      You will receive {formatCurrency(Math.abs(netBalance), currency)} back
                    </span>
                  )}
                  {isNeg && (
                    <span className="text-rose-600 dark:text-rose-400">
                      You need to pay {formatCurrency(Math.abs(netBalance), currency)}
                    </span>
                  )}
                  {!isPos && !isNeg && (
                    <span className="text-slate-500">All accounts settled (₹0 balance)</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3 Metric Cards for this Person */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {/* Total Share Consumed */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <span>Total Food Share Consumed</span>
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(selectedMemberSummary?.total_share || 0, currency)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Across {selectedMemberSummary?.meals_count || 0} meals eaten
                </p>
              </div>

              {/* Total Paid by Me */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <span>Total Amount Paid by Me</span>
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(selectedMemberSummary?.total_paid || 0, currency)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Direct meal bills paid for the group
                </p>
              </div>

              {/* Calculation Formula */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Balance Calculation</span>
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span>Paid:</span>
                    <span>{formatCurrency(selectedMemberSummary?.total_paid || 0, currency)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>- Share:</span>
                    <span>- {formatCurrency(selectedMemberSummary?.total_share || 0, currency)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800 font-bold">
                    <span>= Balance:</span>
                    <span>{formatCurrency(netBalance, currency, true)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settlement Instructions: WHO OWES WHOM FOR THIS PERSON */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-900/30 border border-slate-200 dark:border-slate-700/80 my-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Settlement Instructions (Who to Pay & Who Owes You)</span>
              </h3>

              {mySettlementsToPay.length === 0 && mySettlementsToReceive.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All accounts are balanced for {selectedMember?.name}. No pending payments to make or receive.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payments to make */}
                  {mySettlementsToPay.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                        🔴 You Need to Pay:
                      </span>
                      {mySettlementsToPay.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">Pay to:</span>
                            <span className="block font-bold text-slate-900 dark:text-white text-sm">
                              {s.to_name}
                            </span>
                          </div>
                          <span className="text-base font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-rose-900/60 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800">
                            {formatCurrency(s.amount, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payments to receive */}
                  {mySettlementsToReceive.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        🟢 You Will Receive From:
                      </span>
                      {mySettlementsToReceive.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Receive from:</span>
                            <span className="block font-bold text-slate-900 dark:text-white text-sm">
                              {s.from_name}
                            </span>
                          </div>
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-900/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            {formatCurrency(s.amount, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Itemized Meals History for this Person */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedMember?.name}'s Meals Breakdown ({personMeals.length} Meals)
                </h3>
                <span className="text-xs text-slate-400">
                  {stats.month_str}
                </span>
              </div>

              {personMeals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No meals recorded for this roommate in this month.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Meal</th>
                        <th className="py-3 px-4 text-right">Total Bill</th>
                        <th className="py-3 px-4 text-center">People</th>
                        <th className="py-3 px-4">Paid By</th>
                        <th className="py-3 px-4 text-right">My Share</th>
                        <th className="py-3 px-4 text-right">Net Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {personMeals.map((meal: Meal) => {
                        const isLunch = meal.meal_type === 'lunch';
                        const didEat = meal.eater_ids.includes(selectedMemberId);
                        const isPayer = meal.paid_by === selectedMemberId;
                        const eaterCount = meal.eater_ids.length || 1;
                        const share = didEat ? Math.round((meal.total_amount / eaterCount) * 100) / 100 : 0;
                        const paidAmount = isPayer ? meal.total_amount : 0;
                        const mealImpact = Math.round((paidAmount - share) * 100) / 100;

                        return (
                          <tr key={meal.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap capitalize">
                              <span className={`inline-flex items-center gap-1 font-semibold ${isLunch ? 'text-amber-600' : 'text-indigo-600'}`}>
                                {isLunch ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                                {meal.meal_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                              {formatCurrency(meal.total_amount, currency)}
                            </td>
                            <td className="py-3 px-4 text-center font-medium text-slate-500">
                              {eaterCount}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`font-semibold ${isPayer ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {getMemberName(meal.paid_by)} {isPayer ? '(You)' : ''}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                              {didEat ? formatCurrency(share, currency) : 'Did not eat (₹0)'}
                            </td>
                            <td className="py-3 px-4 text-right font-black">
                              <span className={mealImpact > 0 ? 'text-emerald-600' : mealImpact < 0 ? 'text-rose-600' : 'text-slate-500'}>
                                {formatCurrency(mealImpact, currency, true)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ALL ROOMMATES OVERVIEW                                                */}
      {/* ========================================================================= */}
      {viewMode === 'all' && (
        <div className="space-y-6">
          {/* Printable Report Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md print-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Household Statement • {group.name}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  {stats.month_str} Report
                </h2>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-emerald-100 font-medium">Monthly Total Expenses</span>
                <div className="text-3xl sm:text-4xl font-black">
                  {formatCurrency(stats.total_expense, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* 6 High-Level Monthly Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 print:grid-cols-3">
            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs print-card">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Expense
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.total_expense, currency)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs print-card">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Meals
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {stats.total_meals}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs print-card">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Lunch Count</span>
              </span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {stats.lunch_count}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs print-card">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-500" />
                <span>Dinner Count</span>
              </span>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.dinner_count}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs print-card">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Avg / Meal
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.avg_cost_per_meal, currency)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs print-card">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Person-Meals
              </span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.total_person_meals}
              </div>
            </div>
          </div>

          {/* Person-wise Summary Table */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden print-card">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Person-Wise Summary</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Individual contribution and ledger for {stats.month_str}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {stats.member_summaries.length} Roommates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Roommate</th>
                    <th className="py-3.5 px-4 text-center">Meals Eaten</th>
                    <th className="py-3.5 px-4 text-right">Total Paid (Paid By)</th>
                    <th className="py-3.5 px-4 text-right">Total Share (Consumed)</th>
                    <th className="py-3.5 px-4 text-right">Net Balance</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {stats.member_summaries.map((m) => {
                    const isMpos = m.net_balance > 0.01;
                    const isMneg = m.net_balance < -0.01;

                    return (
                      <tr
                        key={m.member_id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedMemberId(m.member_id);
                          setViewMode('personal');
                        }}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: m.avatar_color }}
                            >
                              {m.member_name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                                {m.member_name}
                              </span>
                              <span className="text-[10px] text-emerald-600 hover:underline">
                                View Statement →
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {m.meals_count} meals
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(m.total_paid, currency)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                          {formatCurrency(m.total_share, currency)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center font-bold px-2.5 py-1 rounded-lg text-xs ${
                              isMpos
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                                : isMneg
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isMpos && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                            {isMneg && <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                            {formatCurrency(m.net_balance, currency, true)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-semibold">
                          {isMpos && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Receive {formatCurrency(Math.abs(m.net_balance), currency)}
                            </span>
                          )}
                          {isMneg && (
                            <span className="text-rose-600 dark:text-rose-400">
                              Pay {formatCurrency(Math.abs(m.net_balance), currency)}
                            </span>
                          )}
                          {!isMpos && !isMneg && (
                            <span className="text-slate-400">Balanced (₹0)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Settlement Section */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs p-5 print-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Final Monthly Settlement</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Optimal money transfers to square up all balances
                </p>
              </div>

              <button
                onClick={onOpenSettlementModal}
                className="no-print inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <span>Record Settlement</span>
              </button>
            </div>

            {stats.settlements.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Pending Payments
                </p>
                <p className="text-xs text-slate-400">Everyone's balance is exactly ₹0 for this month.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {stats.settlements.map((s, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-left">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                          {s.from_name}
                        </span>
                        <span className="text-[10px] text-rose-500 font-semibold uppercase">Needs to Pay</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400" />

                      <div className="text-left">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                          {s.to_name}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold uppercase">Will Receive</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                        {formatCurrency(s.amount, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
