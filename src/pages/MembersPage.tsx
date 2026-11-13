import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { GroupMember } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Utensils,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { members, balances, monthlyBalances, currency, addMember, updateMember, deleteMember, selectedMonthLabel } = useApp();
  const [scope, setScope] = useState<'month' | 'all'>('month');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [editName, setEditName] = useState('');
  const [isActiveStatus, setIsActiveStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Edit Modal
  const handleOpenEdit = (m: GroupMember) => {
    setEditingMember(m);
    setEditName(m.name);
    setIsActiveStatus(m.is_active);
  };

  // Add Member submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setIsSubmitting(true);
    try {
      await addMember(newMemberName.trim());
      setNewMemberName('');
      setIsAddModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Member submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editName.trim()) return;
    setIsSubmitting(true);
    try {
      await updateMember(editingMember.id, {
        name: editName.trim(),
        is_active: isActiveStatus,
      });
      setEditingMember(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (m: GroupMember) => {
    if (window.confirm(`Are you sure you want to remove ${m.name}? If they have past meals, they will be marked as inactive to protect history.`)) {
      await deleteMember(m.id);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Household Team
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Roommates Roster</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage household members, active statuses, and track individual contributions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Scope toggle */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md">
            <button
              onClick={() => setScope('month')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                scope === 'month'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {selectedMonthLabel}
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="shimmer-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member: GroupMember) => {
          const activeBalances = scope === 'month' ? monthlyBalances : balances;
          const balance = activeBalances.find((b) => b.member_id === member.id);
          const net = balance?.net_balance || 0;
          const isPos = net > 0.01;
          const isNeg = net < -0.01;

          return (
            <div
              key={member.id}
              className={`glass-card hover-lift rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                member.is_active
                  ? 'border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-400/50'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/30'
              }`}
            >
              {/* Member Top Info */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                      style={{ backgroundColor: member.avatar_color }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {member.name}
                        </h3>
                        {member.is_active ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {member.is_active ? 'Participates in meal splits' : 'Excluded from auto-splits'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown / buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit member"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 gap-2 mt-5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-emerald-500" />
                      Meals Eaten
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {balance?.meals_eaten_count || 0} meals
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-blue-500" />
                      Total Paid
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {formatCurrency(balance?.total_paid || 0, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Balance footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {scope === 'month' ? `${selectedMonthLabel.split(' ')[0]} Balance` : 'Cumulative Balance'}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {isPos && 'Will get back'}
                    {isNeg && 'Needs to pay'}
                    {!isPos && !isNeg && 'All settled'}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-black ${
                    isPos
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-emerald-200/60 dark:border-emerald-800/60'
                      : isNeg
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isPos && <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />}
                  {isNeg && <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />}
                  <span>{formatCurrency(net, currency, true)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel border border-slate-200/80 dark:border-white/[0.12] rounded-3xl shadow-2xl max-w-sm w-full p-6 overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-400 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Add New Roommate
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Roommate Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shimmer-btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Roommate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel border border-slate-200/80 dark:border-white/[0.12] rounded-3xl shadow-2xl max-w-sm w-full p-6 overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-xs">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Edit Roommate
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/70">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                    Active Status
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Include in automated meal checklists
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActiveStatus}
                  onChange={(e) => setIsActiveStatus(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shimmer-btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
