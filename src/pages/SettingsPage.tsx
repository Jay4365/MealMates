import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getSupabaseConfig, setCustomSupabaseConfig } from '../lib/supabase';
import {
  Settings,
  Building,
  Palette,
  Database,
  Download,
  RotateCcw,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    group,
    updateGroup,
    theme,
    toggleTheme,
    resetDemoData,
    isSupabaseConnected,
    showToast,
    meals,
    members,
    user,
    logout,
  } = useApp();

  // Group settings state
  const [groupName, setGroupName] = useState(group.name);
  const [currencySymbol, setCurrencySymbol] = useState(group.currency || '₹');
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Supabase credentials state
  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url || '');
  const [supabaseKey, setSupabaseKey] = useState(config.anonKey || '');
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);

  // Handle saving group
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setIsSavingGroup(true);
    try {
      await updateGroup({
        name: groupName.trim(),
        currency: currencySymbol,
      });
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Handle saving Supabase
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSupabase(true);
    try {
      setCustomSupabaseConfig(supabaseUrl, supabaseKey);
      showToast('Supabase settings updated. Reloading...', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to update Supabase config', 'error');
      setIsSavingSupabase(false);
    }
  };

  const handleDisconnectSupabase = () => {
    if (window.confirm('Disconnect Supabase and switch back to Local Demo Storage?')) {
      setCustomSupabaseConfig('', '');
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to refresh all data directly from the cloud database?'
      )
    ) {
      resetDemoData();
      showToast('Data refreshed from cloud.', 'info');
    }
  };

  // Export full JSON backup
  const handleExportFullJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      group,
      members,
      meals,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `mealmates_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full backup exported successfully.', 'success');
  };

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8 animate-fade-in-up pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Preferences & Cloud Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Settings className="w-5 h-5" />
            </div>
            <span>App & Household Settings</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize room preferences, dynamic currency, visual themes, and cloud backend
          </p>
        </div>
      </div>

      {/* Active Account / Session Card */}
      <div className="glass-card rounded-2xl p-6 hover-lift relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-white font-black text-xl flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-2 ring-white/50 dark:ring-slate-700/50">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                {user?.name || 'Roommate'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3" />
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {user?.email || 'Logged in to MealMates Cloud'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all cursor-pointer self-start sm:self-auto hover:shadow-md hover:shadow-rose-500/15 active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out / Switch Account</span>
        </button>
      </div>

      {/* 1. Group / Household Settings */}
      <div className="glass-card rounded-2xl p-6 hover-lift space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Household Group
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure room name and dynamic display currency
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGroup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Our Room, Flat 402, 5 Roommates"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Currency Symbol
              </label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              >
                <option value="₹">₹ (Indian Rupee - INR)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="€">€ (Euro - EUR)</option>
                <option value="£">£ (British Pound - GBP)</option>
                <option value="AED ">AED (UAE Dirham)</option>
                <option value="C$">C$ (Canadian Dollar)</option>
                <option value="A$">A$ (Australian Dollar)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingGroup}
              className="shimmer-btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSavingGroup ? 'Saving...' : 'Save Household Info'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Appearance */}
      <div className="glass-card rounded-2xl p-6 hover-lift">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Appearance & Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between clean light and sleek dark mode with ambient glow
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-xs cursor-pointer active:scale-95"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Switch to Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Supabase Cloud Backend Connection */}
      <div className="glass-card rounded-2xl p-6 hover-lift space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Supabase PostgreSQL & Auth
                </h3>
                {isSupabaseConnected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                    Local Demo Mode Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your Supabase project for real-time cloud synchronization
              </p>
            </div>
          </div>

          {isSupabaseConnected && (
            <button
              onClick={handleDisconnectSupabase}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-500/5 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-emerald-500" />
            Supabase Schema Ready:
          </p>
          <p>
            Pre-configured schema available at <code className="bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">supabase/schema.sql</code> with all tables, constraints, relations, and RLS policies.
          </p>
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOi..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingSupabase}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSavingSupabase ? 'Connecting...' : 'Connect to Supabase'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Data Management & Backup */}
      <div className="glass-card rounded-2xl p-6 hover-lift space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Data Management & Sync
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export data backup or refresh data directly from cloud database
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleExportFullJSON}
            className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/70 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export Full JSON Backup</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-emerald-500" />
            <span>Sync Fresh from Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
};
