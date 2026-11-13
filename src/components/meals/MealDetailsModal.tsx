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
  const splitDetails = calculateMealSplit(meal.total_amount, meal.eater_ids, meal.paid_by, members);

  const handleDelete = async () => {
    if (window.confirm('Delete this meal entry permanently?')) {
      await deleteMeal(meal.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14151f] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                isLunch
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {isLunch ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white capitalize">
                {meal.meal_type} Details
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">{meal.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Total Cost Bento Banner */}
          <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Amount Paid
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatCurrency(meal.total_amount, currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Cost Per Person
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                {formatCurrency(splitDetails.perPersonCost, currency)}
              </span>
            </div>
          </div>

          {/* Paid By info */}
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Paid by:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: payer?.avatar_color || '#3b82f6' }}
              >
                {payer?.name?.charAt(0) || 'U'}
              </div>
              <strong className="text-slate-900 dark:text-white">{payer?.name || 'Unknown'}</strong>
            </div>
          </div>

          {/* Roommates Who Ate */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Roommates Who Ate ({eaterCount}):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {meal.eater_ids?.map((id) => {
                const member = members.find((m) => m.id === id);
                return (
                  <div
                    key={id}
                    className="p-2.5 rounded-xl border border-black/[0.05] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.02] flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0"
                      style={{ backgroundColor: member?.avatar_color || '#888' }}
                    >
                      {member?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                      {member?.name || 'Unknown'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes if any */}
          {meal.notes && (
            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Notes:</strong>
              {meal.notes}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2.5 border-t border-black/[0.05] dark:border-white/[0.06]">
            <button
              onClick={() => {
                onClose();
                onEdit(meal);
              }}
              className="flex-1 bento-btn py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-2xl border border-rose-500/20 text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete meal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
