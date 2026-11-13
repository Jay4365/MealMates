import React from 'react';
import type { Meal } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateMealSplit } from '../../utils/calculations';
import { X, Sun, Moon, Edit, Trash2 } from 'lucide-react';

interface MealDetailsModalProps {
  meal: Meal | null;
  onClose: () => void;
  onEdit: (meal: Meal) => void;
}

export const MealDetailsModal: React.FC<MealDetailsModalProps> = ({ meal, onClose, onEdit }) => {
  const { members, currency, deleteMeal } = useApp();

  if (!meal) return null;

  const isLunch = meal.meal_type === 'lunch';
  const payer = members.find((m) => m.id === meal.paid_by);
  const eaterCount = meal.eater_ids?.length || 1;
  const perPersonCost = Math.round((meal.total_amount / eaterCount) * 100) / 100;
  const splitDetails = calculateMealSplit(meal.total_amount, meal.eater_ids, meal.paid_by, members);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this meal entry?')) {
      await deleteMeal(meal.id);
      onClose();
    }
  };

  const formattedDate = new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up overflow-y-auto">
      <div className="glass-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden my-8 border border-white/80 dark:border-white/[0.1] animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
                isLunch
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-amber-500/25'
                  : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
              }`}
            >
              {isLunch ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize flex items-center gap-2">
                <span>{meal.meal_type} Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">{formattedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-5">
          {/* Main Numbers Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Bill</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {formatCurrency(meal.total_amount, currency)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Per Eater</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
                {formatCurrency(perPersonCost, currency)}
              </div>
            </div>
          </div>

          {/* Paid By Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.06] text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Paid by Roommate:</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-1 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-600">
                {payer?.name || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Notes if any */}
          {meal.notes && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.06] text-xs">
              <span className="text-slate-400 dark:text-slate-500 block font-bold mb-1">Notes / Items:</span>
              <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{meal.notes}"</p>
            </div>
          )}

          {/* Split Details List */}
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
              Roommate Share ({meal.eater_ids.length} Participants)
            </span>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.05] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-slate-850">
              {members.map((m) => {
                const ate = meal.eater_ids.includes(m.id);
                const isPayer = m.id === meal.paid_by;
                const netEffect = splitDetails.balances[m.id] || 0;

                return (
                  <div
                    key={m.id}
                    className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-xs"
                        style={{ backgroundColor: m.avatar_color }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {isPayer && (
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded-md font-extrabold">
                              Payer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {ate ? 'Participated in meal' : 'Did not eat'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {ate ? formatCurrency(perPersonCost, currency) : '₹0'}
                      </span>
                      {isPayer ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                          +{formatCurrency(netEffect, currency)}
                        </span>
                      ) : ate ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold">
                          -{formatCurrency(perPersonCost, currency)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Neutral</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Entry</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(meal);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer active:scale-95"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="shimmer-btn px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
