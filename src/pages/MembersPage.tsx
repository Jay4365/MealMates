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
  const { members, balances, currency, addMember, updateMember, deleteMember } = useApp();

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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Roommates Roster</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage household members, active status, and track individual contributions
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Member</span>
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member: GroupMember) => {
          const balance = balances.find((b) => b.member_id === member.id);
          const net = balance?.net_balance || 0;
          const isPos = net > 0.01;
          const isNeg = net < -0.01;

          return (
            <div
              key={member.id}
              className={`bg-white dark:bg-slate-800/90 rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                member.is_active
                  ? 'border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700'
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
                  <span className="text-[11px] text-slate-400 font-medium block">Current Balance</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {isPos && 'Will get back'}
                    {isNeg && 'Needs to pay'}
                    {!isPos && !isNeg && 'All settled'}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-black ${
                    isPos
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add New Roommate
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit Roommate
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
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
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
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
