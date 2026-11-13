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
    <div className="space-y-5 animate-fade-in-up">
      {/* Header Bento Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bento-pill bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              Roommates Roster
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Household Members ({members.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Manage room members, split participation, and individual ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Scope toggle */}
          <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setScope('month')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                scope === 'month'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {selectedMonthLabel}
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bento-btn px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member: GroupMember) => {
          const activeBalances = scope === 'month' ? monthlyBalances : balances;
          const balance = activeBalances.find((b) => b.member_id === member.id);
          const net = balance?.net_balance || 0;
          const isPos = net > 0.01;
          const isNeg = net < -0.01;

          return (
            <div
              key={member.id}
              className={`bento-card p-5 flex flex-col justify-between ${
                member.is_active ? '' : 'opacity-60 bg-black/[0.02] dark:bg-white/[0.02]'
              }`}
            >
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 dark:text-white text-base">
                          {member.name}
                        </h3>
                        {member.is_active ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                        ) : (
                          <span className="bento-pill bg-black/[0.05] dark:bg-white/[0.08] text-slate-500 text-[10px]">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {member.is_active ? 'In automated splits' : 'Excluded from splits'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                      title="Edit member"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-slate-400 block mb-0.5 text-[11px] font-semibold flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-amber-500" />
                      Meals Eaten
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {balance?.meals_eaten_count || 0} meals
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-slate-400 block mb-0.5 text-[11px] font-semibold flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-indigo-500" />
                      Total Paid
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {formatCurrency(balance?.total_paid || 0, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Balance Footer */}
              <div className="mt-4 pt-3.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isPos && 'Gets back'}
                  {isNeg && 'Needs to pay'}
                  {!isPos && !isNeg && 'Settled'}
                </span>

                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tabular-nums ${
                    isPos
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : isNeg
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-500'
                  }`}
                >
                  {isPos && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                  {isNeg && <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{formatCurrency(net, currency, true)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14151f] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Add Roommate
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-sm font-bold outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bento-btn px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14151f] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Edit Roommate
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-sm font-bold outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Active Status
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Include in meal checklists
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActiveStatus}
                  onChange={(e) => setIsActiveStatus(e.target.checked)}
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bento-btn px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs"
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
