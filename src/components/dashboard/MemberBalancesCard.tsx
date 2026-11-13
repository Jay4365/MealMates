import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import { Users, ArrowUpRight, ArrowDownRight, Scale, ChevronRight } from 'lucide-react';

interface MemberBalancesCardProps {
  onOpenSettlement: () => void;
  onNavigateToMembers: () => void;
}

export const MemberBalancesCard: React.FC<MemberBalancesCardProps> = ({
  onOpenSettlement,
  onNavigateToMembers,
}) => {
  const { members, balances, monthlyBalances, currency, selectedMonthLabel } = useApp();
  const [scope, setScope] = useState<'month' | 'all'>('month');

  const currentBalances = scope === 'month' ? monthlyBalances : balances;

  return (
    <div className="bento-card p-5 sm:p-6 h-full flex flex-col justify-between">
      <div>
        {/* Header & Scope Switcher */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Roommate Balances</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Who gets back & who owes
            </p>
          </div>

          {/* Scope Pills */}
          <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-2xl text-[11px] font-bold">
            <button
              onClick={() => setScope('month')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scope === 'month'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {selectedMonthLabel.split(' ')[0]}
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05] mt-1 max-h-[260px] overflow-y-auto pr-1">
          {members.map((member) => {
            const b = currentBalances.find((item) => item.member_id === member.id);
            const net = b?.net_balance || 0;
            const isPos = net > 0.01;
            const isNeg = net < -0.01;

            return (
              <div
                key={member.id}
                className="py-2.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0"
                    style={{ backgroundColor: member.avatar_color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {member.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Paid: {formatCurrency(b?.total_paid || 0, currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black tabular-nums ${
                      isPos
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : isNeg
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-500'
                    }`}
                  >
                    {isPos && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {isNeg && <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>{formatCurrency(net, currency, true)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
                    {isPos && 'Gets back'}
                    {isNeg && 'Owes'}
                    {!isPos && !isNeg && 'Settled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settle Up Action Footer */}
      <div className="mt-4 pt-3.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center gap-2.5">
        <button
          onClick={onOpenSettlement}
          className="bento-btn flex-1 py-2.5 px-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 active:scale-95 text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <Scale className="w-4 h-4" />
          <span>Settle Up Balances</span>
        </button>

        <button
          onClick={onNavigateToMembers}
          title="Manage roommates"
          className="p-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
