import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase, getSupabaseConfig } from '../lib/supabase';
import type { GroupMember } from '../types';
import {
  Utensils,
  User,
  Users,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  Sparkles,
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
    isSupabaseConnected,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profiles' | 'email'>('profiles');
  
  // Profile quick login state
  const [isAddingNewMember, setIsAddingNewMember] = useState(false);
  const [newRoommateName, setNewRoommateName] = useState('');
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  // Email login state
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isConfigured } = getSupabaseConfig();

  // Quick select roommate
  const handleSelectMember = async (member: GroupMember) => {
    try {
      await setUser({
        id: member.user_id || `user-${member.id}`,
        name: member.name,
        email: `${member.name.toLowerCase().replace(/\s+/g, '')}@mealmates.app`,
      });
      showToast(`Welcome back, ${member.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  // Add a new roommate and immediately log in
  const handleAddMemberAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoommateName.trim()) return;
    setIsCreatingMember(true);
    try {
      const created = await addMember(newRoommateName.trim());
      await setUser({
        id: `user-${created.id}`,
        name: created.name,
        email: `${created.name.toLowerCase().replace(/\s+/g, '')}@mealmates.app`,
      });
      showToast(`Welcome to ${group.name}, ${created.name}!`, 'success');
      setNewRoommateName('');
      setIsAddingNewMember(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to add member', 'error');
    } finally {
      setIsCreatingMember(false);
    }
  };

  // Email / Password Form Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isConfigured && supabase) {
        if (isForgotPassword) {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;
          showToast('Password reset link sent to your email.', 'success');
          setIsForgotPassword(false);
          return;
        }

        if (isLogin) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            const resolvedName =
              data.user.user_metadata?.full_name ||
              email.split('@')[0] ||
              'Roommate';
            
            // Link or create member in group if needed
            const existingMember = members.find(
              (m) => m.name.toLowerCase() === resolvedName.toLowerCase()
            );
            if (!existingMember) {
              await addMember(resolvedName);
            }

            await setUser({
              id: data.user.id,
              email: data.user.email || '',
              name: resolvedName,
            });
            showToast(`Logged in as ${resolvedName}`, 'success');
          }
        } else {
          // Sign Up
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
            },
          });
          if (error) throw error;
          if (data.user) {
            const resolvedName = fullName.trim() || email.split('@')[0];
            const existingMember = members.find(
              (m) => m.name.toLowerCase() === resolvedName.toLowerCase()
            );
            if (!existingMember) {
              await addMember(resolvedName);
            }

            await setUser({
              id: data.user.id,
              email: data.user.email || '',
              name: resolvedName,
            });
            showToast(`Account created! Welcome, ${resolvedName}`, 'success');
          }
        }
      } else {
        // Local Demo Mode
        const resolvedName =
          fullName.trim() || email.split('@')[0] || 'Roommate';

        // Check or add to members
        const existingMember = members.find(
          (m) => m.name.toLowerCase() === resolvedName.toLowerCase()
        );
        if (!existingMember) {
          await addMember(resolvedName);
        }

        await setUser({
          id: `user-${email.split('@')[0] || 'member'}`,
          email: email || `${resolvedName.toLowerCase()}@mealmates.app`,
          name: resolvedName,
        });
        showToast(`Welcome, ${resolvedName}!`, 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse-glow"></div>

      {/* Top Bar with Brand & Theme Toggle */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Meal<span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Mates</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {group.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Eat Together, Share Fairly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cloud sync status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] shadow-xs backdrop-blur-md">
            {isSupabaseConnected ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cloud Sync Active</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Local Storage</span>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 relative z-10 animate-fade-in-up">
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/60 dark:border-white/[0.08]">
          {/* Header text */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/25">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Room Member Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Select your profile or sign in to access household ledger for <span className="font-bold text-emerald-600 dark:text-emerald-400">{group.name}</span>.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => setActiveTab('profiles')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profiles'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Roommates ({activeMembers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email & Password</span>
            </button>
          </div>

          {/* TAB 1: Roommate Profiles (Quick 1-Click Login) */}
          {activeTab === 'profiles' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Who is logging in today?</span>
              </div>

              {/* Members Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {activeMembers.map((m: GroupMember) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m)}
                    className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: m.avatar_color || '#10B981' }}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block font-black text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        Log in as {m.name}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              {/* Add New Roommate Expander */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                {!isAddingNewMember ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewMember(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs font-extrabold transition-all cursor-pointer hover:border-emerald-400"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add New Roommate to {group.name}</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddMemberAndLogin} className="space-y-3 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                        New Roommate's Name:
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewMember(false)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="e.g. Rahul, Meet, Smit"
                        value={newRoommateName}
                        onChange={(e) => setNewRoommateName(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={isCreatingMember || !newRoommateName.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                      >
                        {isCreatingMember ? 'Adding...' : 'Add & Enter'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Email & Password Form */}
          {activeTab === 'email' && (
            <div className="space-y-4 animate-fade-in-up">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && !isForgotPassword && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jay Patel"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="roommate@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="shimmer-btn w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {loading
                      ? 'Authenticating...'
                      : isForgotPassword
                      ? 'Send Recovery Link'
                      : isLogin
                      ? 'Sign In & Enter Room'
                      : 'Create Account & Enter'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Toggle Login / Register / Forgot */}
              <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
                {isForgotPassword ? (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                ) : isLogin ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                    >
                      Register here
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                    >
                      Sign in instead
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center py-2 relative z-10">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          MealMates Household Expense Manager • Modern & Fair Living
        </p>
      </div>
    </div>
  );
};
