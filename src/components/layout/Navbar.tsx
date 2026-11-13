import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Utensils, Plus, Database, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAddMeal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddMeal }) => {
  const { user, group, theme, toggleTheme, isSupabaseConnected, logout } = useApp();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-[#07090e]/80 border-b border-slate-200/70 dark:border-white/[0.06] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse-glow"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Utensils className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Meal<span className="gradient-text">Mates</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  {group.name}
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Split Meals • Settle Fairly • Live Better
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase status indicator */}
            <div
              title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL Database' : 'Running in Local Demo Storage Mode'}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-indigo-500' : 'text-amber-500'}`} />
              <span>{isSupabaseConnected ? 'Cloud Sync' : 'Local Mode'}</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-300 border border-transparent hover:border-indigo-200/60 dark:hover:border-indigo-800/40 cursor-pointer active:scale-90"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12 duration-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-90 duration-500" />
              )}
            </button>

            {/* Quick Add Meal CTA Button */}
            <button
              onClick={onOpenAddMeal}
              className="shimmer-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-violet-500/40 transition-all duration-300 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Meal</span>
              <Sparkles className="w-3.5 h-3.5 hidden lg:inline opacity-80" />
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80 dark:border-slate-800">
              <div
                title={`Logged in as ${user?.name || 'Roommate'}`}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 p-[1.5px] shadow-sm hover:scale-110 transition-transform duration-300"
              >
                <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-950 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="block font-bold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">
                  {user?.name || 'Roommate'}
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Active
                </span>
              </div>
              <button
                onClick={logout}
                title="Log out / Switch profile"
                aria-label="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-200 cursor-pointer active:scale-90"
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
