import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  History,
  FileBarChart2,
  Users,
  Settings,
  PlusCircle,
  Home,
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
      label: 'History',
      icon: History,
    },
    {
      id: 'monthly-report' as NavigationTab,
      label: 'Statement',
      icon: FileBarChart2,
    },
    {
      id: 'members' as NavigationTab,
      label: 'Roommates',
      icon: Users,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 sticky top-20 h-[calc(100vh-6rem)] shrink-0 select-none">
      {/* Bento Navigation Dock */}
      <div className="bento-card p-3 flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Quick Add CTA */}
          <button
            onClick={onOpenAddMeal}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer mb-3"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Meal</span>
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Household Info Bento Footnote */}
        <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04]">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-extrabold mb-1">
            <Home className="w-3 h-3 text-rose-500" />
            <span>Household</span>
          </div>
          <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
            {group.name}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 block">
            Currency: {group.currency} (INR)
          </span>
        </div>
      </div>
    </aside>
  );
};
