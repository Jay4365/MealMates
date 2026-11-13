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
  AlertTriangle,
  LogOut,
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
    <div className="max-w-4xl space-y-5 animate-fade-in-up pb-12">
      {/* Header Bento */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bento-pill bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Preferences & Storage
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-rose-500" />
          <span>App & Household Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Manage currency, visual preferences, room details and cloud synchronization.
        </p>
      </div>

      {/* Active Profile Bento Card */}
      <div className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xl flex items-center justify-center shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {user?.name || 'Roommate'}
              </h3>
              <span className="bento-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]">
                Active Profile
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {user?.email || 'Logged in to MealMates'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="bento-btn px-4 py-2 border border-rose-500/20 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out / Switch</span>
        </button>
      </div>

      {/* 1. Household Bento Card */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              Household Group
            </h3>
            <p className="text-[11px] text-slate-400">
              Room name and display currency symbol
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGroup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Group Name
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Room 402"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-sm font-bold outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-sm font-bold outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
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

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingGroup}
              className="bento-btn px-5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              {isSavingGroup ? 'Saving...' : 'Save Group Info'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Theme Bento Card */}
      <div className="bento-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              Appearance & Theme
            </h3>
            <p className="text-[11px] text-slate-400">
              Clean Light or Sleek Obsidian Dark
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="bento-btn px-4 py-2 bg-black/[0.05] dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
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

      {/* 3. Cloud Database Bento Card */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  Supabase Cloud Persistence
                </h3>
                {isSupabaseConnected ? (
                  <span className="bento-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]">
                    Connected
                  </span>
                ) : (
                  <span className="bento-pill bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px]">
                    Local Storage
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Synchronize across roommates via PostgreSQL
              </p>
            </div>
          </div>

          {isSupabaseConnected && (
            <button
              onClick={handleDisconnectSupabase}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOi..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingSupabase}
              className="bento-btn px-5 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold cursor-pointer"
            >
              {isSavingSupabase ? 'Connecting...' : 'Connect Supabase'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Backup & Sync Bento Card */}
      <div className="bento-card p-6 space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              Data Management & Backup
            </h3>
            <p className="text-[11px] text-slate-400">
              Export full records or re-sync with cloud
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={handleExportFullJSON}
            className="flex-1 bento-btn py-2.5 px-4 border border-black/[0.08] dark:border-white/[0.1] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-2xl cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex-1 bento-btn py-2.5 px-4 border border-rose-500/20 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Sync Fresh from Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
};
