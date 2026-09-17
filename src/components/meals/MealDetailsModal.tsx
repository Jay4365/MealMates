import React from 'react';
import type { Meal } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateMealSplit } from '../../utils/calculations';
import { X, Sun, Moon, Edit, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isLunch
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
              }`}
            >
              {isLunch ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {meal.meal_type} Entry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-5">
          {/* Main Numbers Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Cost</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(meal.total_amount, currency)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Per Person</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(perPersonCost, currency)}
              </div>
            </div>
          </div>

          {/* Quick info list */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-slate-400 block mb-0.5">Paid By</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {payer?.name || 'Unknown'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-slate-400 block mb-0.5">People Ate</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {eaterCount} Roommates
              </span>
            </div>
          </div>

          {meal.notes && (
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
              <span className="font-semibold text-amber-900 dark:text-amber-300">Notes: </span>
              <span className="text-slate-700 dark:text-slate-300">{meal.notes}</span>
            </div>
          )}

          {/* Person-wise breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Person-Wise Split & Balance</span>
              <span className="text-[10px] font-normal lowercase">Sum = {currency}0</span>
            </h4>
            <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {members
                .filter((m) => meal.eater_ids.includes(m.id) || m.id === meal.paid_by)
                .map((m) => {
                  const didEat = meal.eater_ids.includes(m.id);
                  const isPayer = m.id === meal.paid_by;
                  const balance = splitDetails.balances[m.id] || 0;
                  const isPos = balance > 0;
                  const isNeg = balance < 0;

                  return (
                    <div key={m.id} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: m.avatar_color }}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                            <span>{m.name}</span>
                            {isPayer && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold">
                                Payer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {didEat ? `Share: ${formatCurrency(perPersonCost, currency)}` : 'Did not eat'}
                          </span>
                        </div>
                      </div>

                      {/* Net impact for this meal */}
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
                            isPos
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                              : isNeg
                              ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                              : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {isPos && <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />}
                          {isNeg && <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />}
                          {formatCurrency(balance, currency, true)}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {isPos ? 'Gets back' : isNeg ? 'Owes' : 'Settled'}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(meal);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
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
