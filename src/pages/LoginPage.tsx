import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase, getSupabaseConfig } from '../lib/supabase';
import type { GroupMember } from '../types';
import {
  UtensilsCrossed,
  Users,
  Mail,
  UserPlus,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    members,
    activeMembers,
    group,
    theme,
    toggleTheme,
    setUser,
    addMember,
    showToast,
  } = useApp();

  const [loginMode, setLoginMode] = useState<'quick' | 'email'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add new roommate form
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Quick Roommate Select
  const handleSelectMember = (member: GroupMember) => {
    setUser({
      id: member.id,
      name: member.name,
      email: `${member.name.toLowerCase()}@mealmates.local`,
    });
    showToast(`Welcome back, ${member.name}!`, 'success');
  };

  // Add New Roommate Submit
  const handleAddNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setIsSubmitting(true);
    try {
      const added = await addMember(newMemberName.trim());
      setUser({
        id: added.id,
        name: added.name,
        email: `${added.name.toLowerCase()}@mealmates.local`,
      });
      showToast(`Welcome to ${group.name}, ${added.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add roommate', 'error');
    } finally {
      setIsSubmitting(false);
      setIsAddingMember(false);
      setNewMemberName('');
    }
  };

  // Email / Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const config = getSupabaseConfig();
      if (!config.url || !config.anonKey) {
        // Fallback demo auth
        const namePart = email.split('@')[0] || 'Roommate';
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        let existing = members.find((m) => m.name.toLowerCase() === formattedName.toLowerCase());
        if (!existing) {
          existing = await addMember(formattedName);
        }
        setUser({
          id: existing.id,
          name: existing.name,
          email: email,
        });
        showToast(`Welcome, ${existing.name}!`, 'success');
        return;
      }

      if (!supabase) {
        throw new Error('Supabase client is not configured.');
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          showToast('Account created! Logging in...', 'success');
          setUser({
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'Roommate',
            email: data.user.email || email,
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          showToast('Welcome back!', 'success');
          setUser({
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'Roommate',
            email: data.user.email || email,
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0b10] flex flex-col justify-center items-center p-4 select-none">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#14151f] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Main Bento Login Card */}
      <div className="bento-card max-w-md w-full p-7 sm:p-9">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 mx-auto flex items-center justify-center shadow-md mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1">
            MealMates<span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Shared meal splitting for {group.name}
          </p>
        </div>

        {/* Mode Selector (Quick Select vs Email) */}
        <div className="flex bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-2xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLoginMode('quick')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginMode === 'quick'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Select Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('email')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginMode === 'email'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Login</span>
          </button>
        </div>

        {/* QUICK SELECT ROOMMATE PROFILES */}
        {loginMode === 'quick' && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Who is logging in?
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {activeMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMember(m)}
                  className="p-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.2] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] flex items-center gap-2.5 transition-all cursor-pointer text-left group"
                >
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ backgroundColor: m.avatar_color }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {m.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Add New Roommate Trigger */}
            {!isAddingMember ? (
              <button
                type="button"
                onClick={() => setIsAddingMember(true)}
                className="w-full mt-3.5 py-2.5 px-4 rounded-2xl border border-dashed border-black/[0.15] dark:border-white/[0.15] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add New Roommate</span>
              </button>
            ) : (
              <form onSubmit={handleAddNewMember} className="mt-3.5 space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Enter name (e.g. Rahul)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-slate-900 text-xs font-bold outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="flex-1 py-1.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs"
                  >
                    {isSubmitting ? 'Adding...' : 'Add & Enter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* EMAIL & PASSWORD LOGIN */}
        {loginMode === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-slate-900 text-xs font-bold outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-slate-900 text-xs font-bold outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer info */}
      <p className="mt-4 text-[11px] text-slate-400 font-medium">
        MealMates • Minimal & Fair Roommate Finance
      </p>
    </div>
  );
};
