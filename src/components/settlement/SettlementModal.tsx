import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateSimplifiedSettlements } from '../../utils/calculations';
import confetti from 'canvas-confetti';
import { X, ArrowRight, CheckCircle2, Scale, Sparkles, Send, RotateCcw } from 'lucide-react';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose }) => {
  const {
    balances,
    monthlyBalances,
    currency,
    recordSettlement,
    deleteSettlement,
    settlements,
    monthSettlements,
    members,
    selectedMonthLabel,
    selectedMonth,
  } = useApp();
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [scope, setScope] = useState<'month' | 'all'>('month');

  if (!isOpen) return null;

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Roommate';
  };

  const activeBalances = scope === 'month' ? monthlyBalances : balances;
  const displaySettlements = scope === 'month' ? monthSettlements : settlements;
  const simplifiedTransactions = calculateSimplifiedSettlements(activeBalances);

  const debtors = activeBalances.filter((b) => b.net_balance < -0.01);
  const creditors = activeBalances.filter((b) => b.net_balance > 0.01);

  const totalDebt = debtors.reduce((acc, b) => acc + Math.abs(b.net_balance), 0);
  const totalCredit = creditors.reduce((acc, b) => acc + b.net_balance, 0);

  const handleSettle = async (txnKey: string, fromId: string, toId: string, amount: number, fromName: string, toName: string) => {
    setRecordingId(txnKey);
    try {
      const today = new Date();
      const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const [selY, selM] = selectedMonth.split('-').map(Number);
      const lastDay = new Date(selY, selM, 0).getDate();
      // When settling for a specific past month, record the date as the last day of that month
      const settlementDate = scope === 'month' && selectedMonth !== currentMonthKey
        ? `${selectedMonth}-${String(lastDay).padStart(2, '0')}`
        : todayStr;

      await recordSettlement(
        fromId,
        toId,
        amount,
        `Settled ₹${amount} from ${fromName} to ${toName}`,
        settlementDate
      );

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setRecordingId(null);
    }
  };

  const handleUndo = async (settlementId: string) => {
    setDeletingId(settlementId);
    try {
      await deleteSettlement(settlementId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up overflow-y-auto">
      <div className="glass-card rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-8 border border-white/80 dark:border-white/[0.1] animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Final Settlement</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Smart Split
                </span>
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Minimum transactions required to balance all roommate accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Scope Selector: Month vs All-Time */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setScope('month')}
              className={`flex-1 py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                scope === 'month'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {selectedMonthLabel}
            </button>
            <button
              onClick={() => setScope('all')}
              className={`flex-1 py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All-Time
            </button>
          </div>

          {/* Summary Balance Check */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/20">
              <span className="text-rose-700 dark:text-rose-400 block font-bold text-[11px] uppercase tracking-wider">Total Pending Debt</span>
              <span className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1 block">
                {formatCurrency(totalDebt, currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20">
              <span className="text-emerald-700 dark:text-emerald-400 block font-bold text-[11px] uppercase tracking-wider">Total To Collect</span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
                {formatCurrency(totalCredit, currency)}
              </span>
            </div>
          </div>

          {/* Optimal Transactions List */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggested Settlement Payments</span>
            </h3>

            {simplifiedTransactions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                  All Debts Are Cleared!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Every roommate is at ₹0 balance for {scope === 'month' ? selectedMonthLabel : 'all-time'}.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {simplifiedTransactions.map((t, idx) => {
                  const txnKey = `${t.from_id}-${t.to_id}-${t.amount}-${idx}`;
                  const isRecording = recordingId === txnKey;

                  return (
                    <div
                      key={txnKey}
                      className="p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover-lift transition-all"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold min-w-0">
                        <span className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 truncate max-w-[90px]">
                          {t.from_name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 truncate max-w-[90px]">
                          {t.to_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(t.amount, currency)}
                        </span>
                        <button
                          type="button"
                          disabled={isRecording}
                          onClick={() => handleSettle(txnKey, t.from_id, t.to_id, t.amount, t.from_name, t.to_name)}
                          className="shimmer-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isRecording ? 'Settling...' : 'Settle'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Previous Settlement History */}
          {displaySettlements.length > 0 && (
            <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Settled Records History ({displaySettlements.length})
              </span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {displaySettlements.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        <strong>{getMemberName(s.from_member_id)}</strong> paid <strong>{getMemberName(s.to_member_id)}</strong>
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(s.amount, currency)}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={deletingId === s.id}
                      onClick={() => handleUndo(s.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Undo this settlement"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{deletingId === s.id ? 'Undoing...' : 'Undo'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Close */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
