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
  const { activeMembers, currency, addMeal, updateMeal, user, selectedMonth, setSelectedMonth } = useApp();

  const getInitialDate = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;
    const currentMonthKey = `${currentYear}-${currentMonth}`;

    if (selectedMonth && selectedMonth !== currentMonthKey) {
      return `${selectedMonth}-01`;
    }
    return todayStr;
  };

  const [date, setDate] = useState<string>(getInitialDate);
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
      setDate(getInitialDate());
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
  }, [editingMeal, initialType, activeMembers, user, isOpen, selectedMonth]);

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
      if (date) {
        const mealMonth = date.slice(0, 7);
        if (mealMonth && /^\d{4}-\d{2}$/.test(mealMonth)) {
          setSelectedMonth(mealMonth);
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up overflow-y-auto">
      <div className="glass-card rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-8 border border-white/80 dark:border-white/[0.1] animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
              mealType === 'lunch'
                ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-amber-500/25'
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
            }`}>
              {mealType === 'lunch' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingMeal ? 'Edit Meal Entry' : 'Add Meal Entry'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Split food expense automatically across eaters
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date & Meal Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meal Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white text-xs font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
              />
            </div>

            {/* Meal Type Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meal Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setMealType('lunch')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Total Meal Amount
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-black text-xl">
                {currency}
              </div>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Who Ate? (Checkboxes) */}
          <div className="border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Who Ate?
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  {eaterIds.length} {eaterIds.length === 1 ? 'person' : 'persons'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Members checkboxes grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeMembers.map((member) => {
                const isSelected = eaterIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleEater(member.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
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
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>
                  {numAmount > 0 && eaterIds.length > 0
                    ? `${formatCurrency(numAmount, currency)} ÷ ${eaterIds.length} =`
                    : 'Cost per head:'}
                </span>
              </div>
              <div className="font-black text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                {formatCurrency(splitDetails.perPersonCost, currency)}
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400"> / head</span>
              </div>
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Who Paid for this?
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all cursor-pointer"
            >
              <option value="" disabled>
                Select who paid the bill
              </option>
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id} className="dark:bg-slate-800">
                  {m.name} {m.name.toLowerCase() === user?.name?.toLowerCase() ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Live Impact Preview */}
          {numAmount > 0 && eaterIds.length > 0 && paidBy && (
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Split Impact</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">{payerMember?.name}</strong> paid {formatCurrency(numAmount, currency)}.
                {splitDetails.balances[paidBy] > 0 ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">
                    Will receive {formatCurrency(splitDetails.balances[paidBy], currency)} back.
                  </span>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400 ml-1">Own share is {formatCurrency(splitDetails.perPersonCost, currency)}.</span>
                )}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">
                Other eaters ({eaterIds.filter(id => id !== paidBy).map(id => activeMembers.find(m => m.id === id)?.name).join(', ')}) owe {formatCurrency(splitDetails.perPersonCost, currency)} each.
              </p>
            </div>
          )}

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy order, Paneer Handi, Grocery rotis..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200/60 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="shimmer-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-500/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingMeal ? 'Update Meal' : 'Save Meal Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
