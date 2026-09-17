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
    <div className="max-w-4xl space-y-6 sm:space-y-8 animate-in fade-in duration-150 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          <span>App & Household Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your room preferences, currency, theme, and backend connectivity
        </p>
      </div>

      {/* 1. Group / Household Settings */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Household Group
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure room name and currency symbol
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Currency Symbol
              </label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
            >
              {isSavingGroup ? 'Saving...' : 'Save Household Info'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Appearance */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Appearance & Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between clean light and sleek dark mode
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-650 transition-colors"
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
      </div>

      {/* 3. Supabase Cloud Backend Connection */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Supabase PostgreSQL & Auth
                </h3>
                {isSupabaseConnected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                    Local Demo Mode Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your Supabase project for real-time cloud persistence
              </p>
            </div>
          </div>

          {isSupabaseConnected && (
            <button
              onClick={handleDisconnectSupabase}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-emerald-600" />
            Supabase Schema Ready:
          </p>
          <p>
            We have generated <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">supabase/schema.sql</code> with all tables, relations, and Row Level Security policies. Simply run it in your Supabase SQL Editor!
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingSupabase}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 font-bold text-xs shadow-xs transition-all"
            >
              {isSavingSupabase ? 'Connecting...' : 'Connect to Supabase'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Data Management & Backup */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center">
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
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Full JSON Backup</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-emerald-500" />
            <span>Sync Fresh from Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
};
