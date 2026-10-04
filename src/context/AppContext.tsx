import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Group, GroupMember, Meal, MemberBalance, User, SettlementRecord } from '../types';
import { storageService } from '../services/storageService';
import { calculateMemberBalances } from '../utils/calculations';
import { getSupabaseConfig, supabase } from '../lib/supabase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  group: Group;
  currency: string;
  members: GroupMember[];
  activeMembers: GroupMember[];
  meals: Meal[];
  balances: MemberBalance[];
  settlements: SettlementRecord[];
  isSupabaseConnected: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loading: boolean;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Selected Month State & Derived Monthly Data
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  monthOptions: { key: string; label: string }[];
  selectedMonthLabel: string;
  monthlyBalances: MemberBalance[];
  monthMeals: Meal[];
  monthSettlements: SettlementRecord[];
  
  // Actions
  addMeal: (mealData: Omit<Meal, 'id' | 'created_at' | 'group_id'>) => Promise<Meal>;
  updateMeal: (id: string, mealData: Partial<Meal>) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
  addMember: (name: string) => Promise<GroupMember>;
  updateMember: (id: string, updates: Partial<GroupMember>) => Promise<GroupMember>;
  deleteMember: (id: string) => Promise<{ success: boolean; reason?: string }>;
  updateGroup: (updates: Partial<Group>) => Promise<Group>;
  recordSettlement: (fromId: string, toId: string, amount: number, notes?: string, date?: string) => Promise<SettlementRecord>;
  deleteSettlement: (id: string) => Promise<void>;
  resetDemoData: () => void;
  setUser: (user: User | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [group, setGroup] = useState<Group>({
    id: 'group-our-room',
    name: 'Our Room',
    currency: '₹',
    owner_id: 'user-jay',
    created_at: new Date().toISOString(),
  });
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Selected Month State (only September and October 2026 allowed)
  const [selectedMonth, setSelectedMonthState] = useState<string>(() => {
    const saved = localStorage.getItem('mealmates_selected_month');
    if (saved === '2026-09' || saved === '2026-10') return saved;
    return '2026-10';
  });

  const setSelectedMonth = useCallback((month: string) => {
    if (month !== '2026-09' && month !== '2026-10') return;
    setSelectedMonthState(month);
    try {
      localStorage.setItem('mealmates_selected_month', month);
    } catch {
      // ignore
    }
  }, []);

  const monthOptions = useMemo(() => {
    // Strictly keep only September 2026 and October 2026 as required
    return [
      { key: '2026-10', label: 'October 2026' },
      { key: '2026-09', label: 'September 2026' },
    ];
  }, []);

  const selectedMonthLabel = useMemo(() => {
    const opt = monthOptions.find((o: { key: string; label: string }) => o.key === selectedMonth);
    if (opt) return opt.label;
    const [y, m] = selectedMonth.split('-');
    const date = new Date(Number(y), (Number(m) || 1) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [monthOptions, selectedMonth]);

  // Meals and settlements specifically for the selected month
  const monthMeals = useMemo(() => {
    return meals.filter((m) => m.date.startsWith(selectedMonth));
  }, [meals, selectedMonth]);

  const monthSettlements = useMemo(() => {
    return settlements.filter((s) => s.date.startsWith(selectedMonth));
  }, [settlements, selectedMonth]);

  // Balances calculated strictly for the selected month
  const monthlyBalances = useMemo(() => {
    return calculateMemberBalances(members, monthMeals, monthSettlements);
  }, [members, monthMeals, monthSettlements]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('mealmates_theme') as 'light' | 'dark') || 'light';
  });

  const { isConfigured } = getSupabaseConfig();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [currUser, activeGroup, memberList, mealList, settlementList] = await Promise.all([
        storageService.getCurrentUser(),
        storageService.getActiveGroup(),
        storageService.getMembers(),
        storageService.getMeals(),
        storageService.getSettlements(),
      ]);

      setUserState(currUser);
      setGroup(activeGroup);
      setMembers(memberList);
      setMeals(mealList);
      setSettlements(settlementList);

      const calculatedBalances = calculateMemberBalances(memberList, mealList, settlementList);
      setBalances(calculatedBalances);
    } catch (err) {
      console.error('Failed to load application data:', err);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [loadData]);

  // Theme handling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body?.classList.remove('dark');
    }
    localStorage.setItem('mealmates_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setUser = async (newUser: User | null) => {
    await storageService.setCurrentUser(newUser);
    setUserState(newUser);
    await loadData();
  };

  const logout = async () => {
    try {
      if (isConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signout notice:', err);
    }
    await storageService.setCurrentUser(null);
    setUserState(null);
    showToast('Logged out successfully', 'info');
  };

  // Actions wrapped with toasts
  const addMeal = async (mealData: Omit<Meal, 'id' | 'created_at' | 'group_id'>) => {
    try {
      const created = await storageService.addMeal(mealData);
      showToast('Meal added successfully.', 'success');
      return created;
    } catch (e: any) {
      showToast(e.message || 'Failed to add meal', 'error');
      throw e;
    }
  };

  const updateMeal = async (id: string, mealData: Partial<Meal>) => {
    try {
      const updated = await storageService.updateMeal(id, mealData);
      showToast('Meal updated successfully.', 'success');
      return updated;
    } catch (e: any) {
      showToast(e.message || 'Failed to update meal', 'error');
      throw e;
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await storageService.deleteMeal(id);
      showToast('Meal deleted successfully.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete meal', 'error');
      throw e;
    }
  };

  const addMember = async (name: string) => {
    try {
      const member = await storageService.addMember(name);
      showToast(`Added ${member.name} to group.`, 'success');
      return member;
    } catch (e: any) {
      showToast(e.message || 'Failed to add member', 'error');
      throw e;
    }
  };

  const updateMember = async (id: string, updates: Partial<GroupMember>) => {
    try {
      const member = await storageService.updateMember(id, updates);
      showToast('Member updated successfully.', 'success');
      return member;
    } catch (e: any) {
      showToast(e.message || 'Failed to update member', 'error');
      throw e;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const res = await storageService.deleteMember(id);
      if (res.reason) {
        showToast(res.reason, 'info');
      } else {
        showToast('Member deleted successfully.', 'success');
      }
      return res;
    } catch (e: any) {
      showToast(e.message || 'Failed to delete member', 'error');
      throw e;
    }
  };

  const updateGroup = async (updates: Partial<Group>) => {
    try {
      const updated = await storageService.updateActiveGroup(updates);
      showToast('Group settings updated.', 'success');
      return updated;
    } catch (e: any) {
      showToast(e.message || 'Failed to update group', 'error');
      throw e;
    }
  };

  const recordSettlement = async (fromId: string, toId: string, amount: number, notes?: string, date?: string) => {
    try {
      const res = await storageService.recordSettlement(fromId, toId, amount, notes, date);
      await loadData();
      showToast('Settlement recorded successfully! 🎉', 'success');
      return res;
    } catch (e: any) {
      showToast(e.message || 'Failed to record settlement', 'error');
      throw e;
    }
  };

  const deleteSettlement = async (id: string) => {
    try {
      await storageService.deleteSettlement(id);
      await loadData();
      showToast('Settlement returned back to pending.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to undo settlement', 'error');
      throw e;
    }
  };

  const resetDemoData = () => {
    storageService.resetToDefaultDemo();
    showToast('Demo data reloaded to defaults.', 'info');
  };

  const activeMembers = members.filter((m) => m.is_active);

  return (
    <AppContext.Provider
      value={{
        user,
        group,
        currency: group.currency || '₹',
        members,
        activeMembers,
        meals,
        balances,
        settlements,
        selectedMonth,
        setSelectedMonth,
        monthOptions,
        selectedMonthLabel,
        monthlyBalances,
        monthMeals,
        monthSettlements,
        isSupabaseConnected: isConfigured,
        theme,
        toggleTheme,
        loading,
        toasts,
        showToast,
        removeToast,
        addMeal,
        updateMeal,
        deleteMeal,
        addMember,
        updateMember,
        deleteMember,
        updateGroup,
        recordSettlement,
        deleteSettlement,
        resetDemoData,
        setUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
