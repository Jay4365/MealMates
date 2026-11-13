import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateMonthlyStats, formatCurrency } from '../../utils/calculations';
import { X, Scale, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose }) => {
  const {
    meals,
    members,
    currency,
    selectedMonth,
    selectedMonthLabel,
    settlements,
    recordSettlement,
    deleteSettlement,
    showToast,
  } = useApp();

  const [filterMonthOnly, setFilterMonthOnly] = useState(true);

  if (!isOpen) return null;

  const targetMonth = filterMonthOnly ? selectedMonth : '';
  const stats = generateMonthlyStats(meals, members, targetMonth, settlements);
  const calculatedTransactions = stats.settlements;

  const handleMarkAsPaid = async (fromId: string, toId: string, amount: number) => {
    try {
      await recordSettlement(fromId, toId, amount, selectedMonth);
      showToast('Payment settled and recorded!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to record settlement', 'error');
    }
  };

  const handleUnmarkSettlement = async (settlementId: string) => {
    try {
      await deleteSettlement(settlementId);
      showToast('Settlement reversed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to revert settlement', 'error');
    }
  };

  const getMember = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14151f] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900 dark:text-white">
                Settlement Calculator
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Optimized minimum-transaction debt resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Scope Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {filterMonthOnly ? `Only ${selectedMonthLabel}` : 'All-Time Cumulative'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {filterMonthOnly ? 'Calculate debts within selected month' : 'Calculate cumulative room balance'}
              </span>
            </div>
            <button
              onClick={() => setFilterMonthOnly(!filterMonthOnly)}
              className="text-xs font-extrabold text-rose-500 hover:underline cursor-pointer"
            >
              {filterMonthOnly ? 'Switch to All-Time' : 'Switch to Month'}
            </button>
          </div>

          {/* Settlement Transactions List */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
              Suggested Payments ({calculatedTransactions.length}):
            </h3>

            {calculatedTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Everyone is Square!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  No outstanding debts found for this period.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {calculatedTransactions.map((tx, idx) => {
                  const fromM = getMember(tx.from_id);
                  const toM = getMember(tx.to_id);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Payer */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: fromM?.avatar_color || '#ef4444' }}
                          >
                            {fromM?.name.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[70px]">
                            {fromM?.name}
                          </span>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                        {/* Receiver */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: toM?.avatar_color || '#22c55e' }}
                          >
                            {toM?.name.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[70px]">
                            {toM?.name}
                          </span>
                        </div>
                      </div>

                      {/* Amount & Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-sm text-slate-900 dark:text-white tabular-nums">
                          {formatCurrency(tx.amount, currency)}
                        </span>
                        <button
                          onClick={() => handleMarkAsPaid(tx.from_id, tx.to_id, tx.amount)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settled History */}
          {settlements.length > 0 && (
            <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Settled Records ({settlements.length}):
              </h4>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {settlements.map((s) => {
                  const fromM = getMember(s.from_member_id);
                  const toM = getMember(s.to_member_id);
                  return (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-600 dark:text-slate-400">
                        <strong>{fromM?.name}</strong> paid <strong>{toM?.name}</strong>{' '}
                        <span className="font-bold text-emerald-600">{formatCurrency(s.amount, currency)}</span>
                      </span>
                      <button
                        onClick={() => handleUnmarkSettlement(s.id)}
                        title="Revert settlement"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
