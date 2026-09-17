import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileBarChart2,
  Users,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'history' | 'monthly-report' | 'members' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddMeal: () => void;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddMeal,
}) => {
  const { user, group, isSupabaseConnected } = useApp();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'history' as NavigationTab,
      label: 'History',
      icon: History,
      badge: null,
    },
    {
      id: 'monthly-report' as NavigationTab,
      label: 'Monthly Report',
      icon: FileBarChart2,
      badge: null,
    },
    {
      id: 'members' as NavigationTab,
      label: 'Members',
      icon: Users,
      badge: null,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-[calc(100vh-4rem)] sticky top-16 transition-colors select-none">
      {/* Group Household Card */}
      <div className="p-4 pb-2">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Active Household
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
            {group.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            Currency: <span className="font-semibold text-slate-700 dark:text-slate-300">{group.currency} (INR)</span>
          </p>
        </div>
      </div>

      {/* Add Meal Direct Button */}
      <div className="px-4 py-2">
        <button
          onClick={onOpenAddMeal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium text-sm shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Meal Entry</span>
        </button>
      </div>

      {/* Main Navigation links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status / Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Backend Info */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          {isSupabaseConnected ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Supabase Auth & DB</span>
                <p className="text-[10px] text-slate-400">Cloud Sync Active</p>
              </div>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Demo Storage</span>
                <p className="text-[10px] text-slate-400">Connect in Settings</p>
              </div>
            </>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'Jay'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'jay@mealmates.app'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('settings')}
            title="Account Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
