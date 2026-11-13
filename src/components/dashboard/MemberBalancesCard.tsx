import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Users, ArrowUpRight, ArrowDownRight, Scale, CheckCircle2, Sparkles } from 'lucide-react';

interface MemberBalancesCardProps {
  onOpenSettlement: () => void;
}

export const MemberBalancesCard: React.FC<MemberBalancesCardProps> = ({ onOpenSettlement }) => {
  const { balances, monthlyBalances, currency, selectedMonthLabel } = useApp();
  const [viewScope, setViewScope] = React.useState<'month' | 'all'>('month');

  const displayBalances = viewScope === 'month' ? monthlyBalances : balances;
  const isMonthEmpty = viewScope === 'month' && displayBalances.every((b) => b.meals_eaten_count === 0 && b.total_paid === 0);

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col h-full animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/[0.06] gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
            <span>Roommate Balances</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {viewScope === 'month' ? `Ledger statement for ${selectedMonthLabel}` : 'All-time cumulative ledger'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Scope toggle: Month vs All-Time */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xs">
            <button
              onClick={() => setViewScope('month')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewScope === 'month'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {selectedMonthLabel.split(' ')[0]}
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All-Time
            </button>
          </div>

          <button
            onClick={onOpenSettlement}
            className="shimmer-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Settle Up</span>
            <Sparkles className="w-3 h-3 text-emerald-200" />
          </button>
        </div>
      </div>

      {/* Notice if no meals in the selected month */}
      {isMonthEmpty && (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs px-3.5 py-2.5 rounded-2xl mt-4 flex items-center justify-between">
          <span>No meals recorded for {selectedMonthLabel} yet. All balances are ₹0.</span>
          <button
            onClick={() => setViewScope('all')}
            className="underline font-bold hover:text-amber-900 dark:hover:text-amber-200 ml-2 cursor-pointer"
          >
            View All-Time
          </button>
        </div>
      )}

      {/* Legend Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/40 px-3.5 py-1.5 rounded-xl my-3 border border-slate-200/50 dark:border-white/[0.04]">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs"></span>
          <span>Positive (+) = Will get back</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-2xs"></span>
          <span>Negative (-) = Need to pay</span>
        </span>
      </div>

      {/* Balance List */}
      <div className="divide-y divide-slate-100 dark:divide-white/[0.05] flex-1 overflow-y-auto pr-1">
        {displayBalances.map((b) => {
          const isPos = b.net_balance > 0.01;
          const isNeg = b.net_balance < -0.01;

          return (
            <div
              key={b.member_id}
              className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md transition-transform group-hover:scale-105"
                  style={{ backgroundColor: b.avatar_color }}
                >
                  {b.member_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {b.member_name}
                    </span>
                    {!b.is_active && (
                      <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded-md">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {b.meals_eaten_count} meals • Paid {formatCurrency(b.total_paid, currency)}
                  </div>
                </div>
              </div>

              {/* Amount badge */}
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-black transition-all ${
                    isPos
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : isNeg
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isPos && <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />}
                  {isNeg && <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />}
                  {!isPos && !isNeg && <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{formatCurrency(b.net_balance, currency, true)}</span>
                </div>
                <div className="text-[10px] mt-0.5 font-bold">
                  {isPos && (
                    <span className="text-emerald-600 dark:text-emerald-400">Gets {formatCurrency(Math.abs(b.net_balance), currency)}</span>
                  )}
                  {isNeg && (
                    <span className="text-rose-600 dark:text-rose-400">Owes {formatCurrency(Math.abs(b.net_balance), currency)}</span>
                  )}
                  {!isPos && !isNeg && (
                    <span className="text-slate-400">Settled Up</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
