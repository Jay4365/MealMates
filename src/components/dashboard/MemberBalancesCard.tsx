import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Users, ArrowUpRight, ArrowDownRight, Scale, CheckCircle2 } from 'lucide-react';

interface MemberBalancesCardProps {
  onOpenSettlement: () => void;
}

export const MemberBalancesCard: React.FC<MemberBalancesCardProps> = ({ onOpenSettlement }) => {
  const { balances, currency } = useApp();

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Roommate Balances</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time individual ledger
          </p>
        </div>
        <button
          onClick={onOpenSettlement}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/60 dark:border-emerald-800/60 transition-colors active:scale-95"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Settle Up</span>
        </button>
      </div>

      {/* Legend Helper */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg my-3 border border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Positive = Will get back</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Negative = Need to pay</span>
        </span>
      </div>

      {/* Balance List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60 flex-1 overflow-y-auto">
        {balances.map((b) => {
          const isPos = b.net_balance > 0.01;
          const isNeg = b.net_balance < -0.01;

          return (
            <div
              key={b.member_id}
              className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-750 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                  style={{ backgroundColor: b.avatar_color }}
                >
                  {b.member_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {b.member_name}
                    </span>
                    {!b.is_active && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.2 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    {b.meals_eaten_count} meals eaten • Paid {formatCurrency(b.total_paid, currency)}
                  </div>
                </div>
              </div>

              {/* Amount badge */}
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-sm font-bold ${
                    isPos
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                      : isNeg
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isPos && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                  {isNeg && <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                  {!isPos && !isNeg && <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{formatCurrency(b.net_balance, currency, true)}</span>
                </div>
                <div className="text-[10px] mt-0.5 font-medium">
                  {isPos && (
                    <span className="text-emerald-600 dark:text-emerald-400">Gets {formatCurrency(Math.abs(b.net_balance), currency)}</span>
                  )}
                  {isNeg && (
                    <span className="text-rose-600 dark:text-rose-400">Owes {formatCurrency(Math.abs(b.net_balance), currency)}</span>
                  )}
                  {!isPos && !isNeg && (
                    <span className="text-slate-400">Settled</span>
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
