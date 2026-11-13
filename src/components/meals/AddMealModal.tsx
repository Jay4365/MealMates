import React, { useState, useEffect, useMemo } from 'react';
import type { Meal, MealType } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateMealSplit } from '../../utils/calculations';
import { X, Sun, Moon, Check, Sparkles, AlertCircle } from 'lucide-react';

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

  const [date, setDate] = useState(getInitialDate());
  const [mealType, setMealType] = useState<MealType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [eaterIds, setEaterIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setEaterIds(activeMembers.map((m) => m.id));

      if (user && activeMembers.some((m) => m.id === user.id)) {
        setPaidBy(user.id);
      } else if (activeMembers.length > 0) {
        setPaidBy(activeMembers[0].id);
      }
    }
    setErrorMessage('');
  }, [editingMeal, initialType, isOpen, activeMembers, user]);

  const numAmount = parseFloat(amount) || 0;
  const splitDetails = useMemo(() => {
    return calculateMealSplit(numAmount, eaterIds, paidBy, activeMembers);
  }, [numAmount, eaterIds, paidBy, activeMembers]);

  const toggleEater = (id: string) => {
    if (eaterIds.includes(id)) {
      if (eaterIds.length === 1) {
        setErrorMessage('At least one person must be selected as eater.');
        return;
      }
      setErrorMessage('');
      setEaterIds(eaterIds.filter((e) => e !== id));
    } else {
      setErrorMessage('');
      setEaterIds([...eaterIds, id]);
    }
  };

  const selectAll = () => setEaterIds(activeMembers.map((m) => m.id));
  const deselectAll = () => {
    if (activeMembers.length > 0) {
      setEaterIds([activeMembers[0].id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (numAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }
    if (!paidBy) {
      setErrorMessage('Please select who paid for the meal.');
      return;
    }
    if (eaterIds.length === 0) {
      setErrorMessage('Please select at least one person who ate.');
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
          notes: notes.trim() || undefined,
        });
      } else {
        await addMeal({
          date,
          meal_type: mealType,
          total_amount: numAmount,
          paid_by: paidBy,
          eater_ids: eaterIds,
          notes: notes.trim() || undefined,
        });

        const entryMonthKey = date.substring(0, 7);
        if (entryMonthKey && entryMonthKey !== selectedMonth) {
          setSelectedMonth(entryMonthKey);
        }
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14151f] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] shadow-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900 dark:text-white">
                {editingMeal ? 'Edit Meal Entry' : 'Log New Meal'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Split evenly across all roommates eating
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Date & Meal Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-bold outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meal Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setMealType('lunch')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mealType === 'lunch'
                      ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Lunch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMealType('dinner')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mealType === 'dinner'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dinner</span>
                </button>
              </div>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Total Amount
            </label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-black text-xl">
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] font-black text-2xl outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Who Ate Checkboxes */}
          <div className="border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Who Ate? ({eaterIds.length})
              </span>
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeMembers.map((member) => {
                const isSelected = eaterIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleEater(member.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-white dark:bg-slate-900 border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-rose-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{member.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Split Preview */}
            <div className="mt-3.5 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Cost per person:</span>
              <span className="font-black text-sm text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(splitDetails.perPersonCost, currency)} / head
              </span>
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Who Paid?
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-bold outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="" disabled>Select payer</option>
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id} className="dark:bg-slate-900">
                  {m.name} {m.name.toLowerCase() === user?.name?.toLowerCase() ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Groceries, Paneer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-black/[0.05] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-black/[0.1] dark:border-white/[0.1] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bento-btn px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingMeal ? 'Update' : 'Save Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
