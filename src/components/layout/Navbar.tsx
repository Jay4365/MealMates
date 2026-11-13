import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Utensils, Plus, Database, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAddMeal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddMeal }) => {
  const { user, group, theme, toggleTheme, isSupabaseConnected, logout } = useApp();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 dark:bg-[#080c14]/75 border-b border-slate-200/70 dark:border-white/[0.06] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Utensils className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Meal<span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Mates</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xs"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span>{isSupabaseConnected ? 'Cloud Sync' : 'Local Mode'}</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 cursor-pointer active:scale-95"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12 duration-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45 duration-200" />
              )}
            </button>

            {/* Quick Add Meal CTA Button */}
            <button
              onClick={onOpenAddMeal}
              className="shimmer-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Meal</span>
              <Sparkles className="w-3.5 h-3.5 hidden lg:inline opacity-80" />
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80 dark:border-slate-800">
              <div
                title={`Logged in as ${user?.name || 'Roommate'}`}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-[1.5px] shadow-sm hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-[10px] bg-slate-900 dark:bg-slate-950 flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="block font-bold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">
                  {user?.name || 'Roommate'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              </div>
              <button
                onClick={logout}
                title="Log out / Switch profile"
                aria-label="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer active:scale-95"
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
