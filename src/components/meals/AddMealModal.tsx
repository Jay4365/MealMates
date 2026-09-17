import React, { useState, useEffect, useMemo } from 'react';
import type { Meal, MealType } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateMealSplit } from '../../utils/calculations';
import { X, Sun, Moon, Check, Calculator, Sparkles, AlertCircle } from 'lucide-react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: MealType;
  editingMeal?: Meal | null;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  initialType = 'lunch',
  editingMeal = null,
}) => {
  const { activeMembers, currency, addMeal, updateMeal, user } = useApp();

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<MealType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [eaterIds, setEaterIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or reset form
  useEffect(() => {
    if (editingMeal) {
      setDate(editingMeal.date);
      setMealType(editingMeal.meal_type);
      setAmount(editingMeal.total_amount.toString());
      setPaidBy(editingMeal.paid_by);
      setEaterIds(editingMeal.eater_ids || []);
      setNotes(editingMeal.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setMealType(initialType);
      setAmount('');
      setNotes('');
      // Default: all active members selected to eat
      setEaterIds(activeMembers.map((m) => m.id));
      // Default payer: current user's member ID or first active member
      const myMember = activeMembers.find((m) => 
        m.name.toLowerCase() === (user?.name?.toLowerCase() || 'jay')
      ) || activeMembers[0];
      setPaidBy(myMember?.id || '');
    }
    setErrorMsg(null);
  }, [editingMeal, initialType, activeMembers, user, isOpen]);

  // Real-time calculation computation
  const numAmount = parseFloat(amount) || 0;
  const splitDetails = useMemo(() => {
    return calculateMealSplit(numAmount, eaterIds, paidBy, activeMembers);
  }, [numAmount, eaterIds, paidBy, activeMembers]);

  if (!isOpen) return null;

  // Toggle individual eater
  const toggleEater = (memberId: string) => {
    setEaterIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Select all or deselect all
  const selectAll = () => {
    setEaterIds(activeMembers.map((m) => m.id));
  };
  const deselectAll = () => {
    setEaterIds([]);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validations
    if (!date) {
      setErrorMsg('Please select a valid date.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Meal amount must be greater than zero.');
      return;
    }
    if (eaterIds.length === 0) {
      setErrorMsg('Please select at least one person who ate.');
      return;
    }
    if (!paidBy) {
      setErrorMsg('Please select who paid for this meal.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMeal) {
        await updateMeal(editingMeal.id, {
          date,
          meal_type: mealType,
          total_amount: numAmount,
          paid_by: paidBy,
          eater_ids: eaterIds,
          notes: notes.trim(),
        });
      } else {
        await addMeal({
          date,
          meal_type: mealType,
          total_amount: numAmount,
          paid_by: paidBy,
          eater_ids: eaterIds,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const payerMember = activeMembers.find((m) => m.id === paidBy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              mealType === 'lunch' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
            }`}>
              {mealType === 'lunch' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingMeal ? 'Edit Meal Entry' : 'Add Meal Entry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Split food expense automatically
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date & Meal Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-colors"
              />
            </div>

            {/* Meal Type Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Meal Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setMealType('lunch')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mealType === 'lunch'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>☀️ Lunch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMealType('dinner')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mealType === 'dinner'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>🌙 Dinner</span>
                </button>
              </div>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Total Meal Amount
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                {currency}
              </div>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="e.g. 400"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Who Ate? (Checkboxes) */}
          <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 bg-slate-50/40 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Who Ate?
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  {eaterIds.length} {eaterIds.length === 1 ? 'person' : 'persons'} ate
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  All
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:underline font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Members checkboxes list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeMembers.map((member) => {
                const isSelected = eaterIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleEater(member.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{member.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Real-time Per Person calculation preview */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {numAmount > 0 && eaterIds.length > 0
                    ? `${formatCurrency(numAmount, currency)} ÷ ${eaterIds.length} =`
                    : 'Split per person:'}
                </span>
              </div>
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg">
                {formatCurrency(splitDetails.perPersonCost, currency)}
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400"> / person</span>
              </div>
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Who Paid?
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-colors"
            >
              <option value="" disabled>
                Select who paid
              </option>
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.name.toLowerCase() === user?.name?.toLowerCase() ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Live Impact Preview */}
          {numAmount > 0 && eaterIds.length > 0 && paidBy && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Calculation Breakdown</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">{payerMember?.name}</strong> paid {formatCurrency(numAmount, currency)}.
                {splitDetails.balances[paidBy] > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                    Will receive {formatCurrency(splitDetails.balances[paidBy], currency)} back.
                  </span>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400 ml-1">Own share is {formatCurrency(splitDetails.perPersonCost, currency)}.</span>
                )}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Other eaters ({eaterIds.filter(id => id !== paidBy).map(id => activeMembers.find(m => m.id === id)?.name).join(', ')}) owe {formatCurrency(splitDetails.perPersonCost, currency)} each.
              </p>
            </div>
          )}

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Biryani, Rotis, Swiggy order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : editingMeal ? 'Update Meal' : 'Save Meal Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
