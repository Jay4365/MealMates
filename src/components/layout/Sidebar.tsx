import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileBarChart2,
  Users,
  Settings,
  Sparkles,
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
  const { group } = useApp();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'history' as NavigationTab,
      label: 'Meal History',
      icon: History,
    },
    {
      id: 'monthly-report' as NavigationTab,
      label: 'Monthly Statement',
      icon: FileBarChart2,
    },
    {
      id: 'members' as NavigationTab,
      label: 'Roommates Roster',
      icon: Users,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/70 dark:border-white/[0.06] bg-white/70 dark:bg-[#080c14]/70 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16 transition-colors select-none">
      {/* Group Household Card */}
      <div className="p-4 pb-2">
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 dark:border-emerald-500/15 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active Household
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight truncate">
            {group.name}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Currency:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
              {group.currency} (INR)
            </span>
          </p>
        </div>
      </div>

      {/* Add Meal Direct Button */}
      <div className="px-4 py-2">
        <button
          onClick={onOpenAddMeal}
          className="shimmer-btn w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Meal Entry</span>
        </button>
      </div>

      {/* Main Navigation links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-700 dark:text-emerald-400 shadow-xs border border-emerald-500/20 dark:border-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-500"></span>
              )}
              <div className={`p-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Pro Tip Footer */}
      <div className="p-4 border-t border-slate-200/60 dark:border-white/[0.06]">
        <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fair Split Magic</span>
          </div>
          <span>Automatic math for lunch, dinner & instant settlements.</span>
        </div>
      </div>
    </aside>
  );
};
