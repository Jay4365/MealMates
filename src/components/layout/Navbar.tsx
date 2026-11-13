import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, UtensilsCrossed, Plus, Database, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenAddMeal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddMeal }) => {
  const { user, group, theme, toggleTheme, isSupabaseConnected, logout } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#f5f5f7]/90 dark:bg-[#0a0b10]/90 backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name (Apple Typography) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  MealMates<span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {group.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right Bento Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Database indicator */}
            <div
              title={isSupabaseConnected ? 'Connected to Cloud Database' : 'Local Storage Mode'}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span>{isSupabaseConnected ? 'Cloud Active' : 'Local Mode'}</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* + Add Meal Bento Button */}
            <button
              onClick={onOpenAddMeal}
              className="bento-btn px-4 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Meal</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.08]">
              <div
                title={`Logged in as ${user?.name || 'Roommate'}`}
                className="w-9 h-9 rounded-2xl bg-black/[0.06] dark:bg-white/[0.1] flex items-center justify-center text-slate-900 dark:text-white font-black text-xs"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="block font-bold text-slate-900 dark:text-white truncate max-w-[80px]">
                  {user?.name || 'Roommate'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                aria-label="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
