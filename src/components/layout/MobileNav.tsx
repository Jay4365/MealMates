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
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto bg-white/95 dark:bg-[#14151f]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] rounded-[24px] px-2 py-1.5 shadow-xl transition-all">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-rose-500 font-extrabold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* History */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
            currentTab === 'history'
              ? 'text-rose-500 font-extrabold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">History</span>
        </button>

        {/* Floating Add Meal Pill */}
        <button
          onClick={onOpenAddMeal}
          className="w-11 h-11 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
          aria-label="Add Meal Entry"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Monthly Report */}
        <button
          onClick={() => onSelectTab('monthly-report')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
            currentTab === 'monthly-report'
              ? 'text-rose-500 font-extrabold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileBarChart2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Statement</span>
        </button>

        {/* Members */}
        <button
          onClick={() => onSelectTab('members')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
            currentTab === 'members'
              ? 'text-rose-500 font-extrabold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Roommates</span>
        </button>
      </div>
    </nav>
  );
};
