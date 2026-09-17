import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Utensils, Plus, Database } from 'lucide-react';

interface NavbarProps {
  onOpenAddMeal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddMeal }) => {
  const { user, group, theme, toggleTheme, isSupabaseConnected, members } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Meal<span className="text-emerald-600 dark:text-emerald-400">Mates</span>
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {group.name}
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium">
                Eat Together, Share Fairly.
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Supabase status indicator */}
            <div
              title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Running in Local Demo Storage Mode'}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span>{isSupabaseConnected ? 'Supabase Live' : 'Demo Mode'}</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {/* Quick Add Meal CTA */}
            <button
              onClick={onOpenAddMeal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm shadow-md shadow-emerald-600/20 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Meal</span>
            </button>

            {/* User Profile avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || (members[0]?.name ? members[0].name.charAt(0).toUpperCase() : 'R')}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="block font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name || members[0]?.name || 'Roommate'}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                  Roommate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
