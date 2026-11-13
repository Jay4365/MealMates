import React from 'react';
import type { NavigationTab } from './Sidebar';
import {
  LayoutDashboard,
  History,
  Plus,
  FileBarChart2,
  Users,
} from 'lucide-react';

interface MobileNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddMeal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddMeal,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-white/85 dark:bg-[#080c14]/90 border-t border-slate-200/80 dark:border-white/[0.08] px-3 py-1.5 pb-safe transition-colors shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            currentTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* History */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            currentTab === 'history'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">History</span>
        </button>

        {/* Center Floating Neon Add Button */}
        <div className="relative -top-3">
          <button
            onClick={onOpenAddMeal}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 active:scale-90 hover:scale-105 transition-all duration-200 ring-4 ring-white dark:ring-[#080c14]"
            aria-label="Add Meal Entry"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Monthly Report */}
        <button
          onClick={() => onSelectTab('monthly-report')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            currentTab === 'monthly-report'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <FileBarChart2 className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Report</span>
        </button>

        {/* Members */}
        <button
          onClick={() => onSelectTab('members')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            currentTab === 'members'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Roommates</span>
        </button>
      </div>
    </nav>
  );
};
