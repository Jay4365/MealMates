import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateSimplifiedSettlements } from '../../utils/calculations';
import confetti from 'canvas-confetti';
import { X, ArrowRight, CheckCircle2, Scale, Sparkles, Send } from 'lucide-react';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose }) => {
  const { balances, currency, recordSettlement } = useApp();
  const [settledTxns, setSettledTxns] = useState<string[]>([]);
  const [recordingId, setRecordingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const simplifiedTransactions = calculateSimplifiedSettlements(balances);

  const debtors = balances.filter((b) => b.net_balance < -0.01);
  const creditors = balances.filter((b) => b.net_balance > 0.01);

  const totalDebt = debtors.reduce((acc, b) => acc + Math.abs(b.net_balance), 0);
  const totalCredit = creditors.reduce((acc, b) => acc + b.net_balance, 0);

  const handleSettle = async (txnKey: string, fromId: string, toId: string, amount: number, fromName: string, toName: string) => {
    setRecordingId(txnKey);
    try {
      await recordSettlement(
        fromId,
        toId,
        amount,
        `Settled ₹${amount} from ${fromName} to ${toName}`
      );
      setSettledTxns((prev) => [...prev, txnKey]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Final Settlement</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  Optimal Flow
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Minimum transactions to balance all debts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Summary Balance Check */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40">
              <span className="text-rose-700 dark:text-rose-400 block font-medium">Total To Pay</span>
              <span className="text-lg font-black text-rose-800 dark:text-rose-300">
                {formatCurrency(totalDebt, currency)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40">
              <span className="text-emerald-700 dark:text-emerald-400 block font-medium">Total To Receive</span>
              <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                {formatCurrency(totalCredit, currency)}
              </span>
            </div>
          </div>

          {/* Optimized Transactions List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Recommended Payments ({simplifiedTransactions.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Min Cash Flow</span>
            </div>

            {simplifiedTransactions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  All Roommates Are Squared Up!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  No outstanding balances or payments required.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {simplifiedTransactions.map((txn, index) => {
                  const txnKey = `${txn.from_id}-${txn.to_id}-${txn.amount}`;
                  const isSettled = settledTxns.includes(txnKey);
                  const isRecording = recordingId === txnKey;

                  return (
                    <div
                      key={index}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSettled
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 opacity-80'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-left">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                            {txn.from_name}
                          </span>
                          <span className="text-[10px] text-rose-500 font-semibold">Payer</span>
                        </div>

                        <div className="flex flex-col items-center px-1">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            {formatCurrency(txn.amount, currency)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 mt-0.5" />
                        </div>

                        <div className="text-left">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                            {txn.to_name}
                          </span>
                          <span className="text-[10px] text-emerald-500 font-semibold">Receiver</span>
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        {isSettled ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled
                          </span>
                        ) : (
                          <button
                            disabled={isRecording}
                            onClick={() =>
                              handleSettle(txnKey, txn.from_id, txn.to_id, txn.amount, txn.from_name, txn.to_name)
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-slate-950 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isRecording ? 'Saving...' : 'Mark Paid'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Explanatory note */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            By following this settlement plan, the room is fully settled in the fewest bank/UPI transfers possible.
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
