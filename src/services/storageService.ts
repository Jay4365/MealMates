import type { Group, GroupMember, Meal, SettlementRecord, User } from '../types';
import { supabase, getSupabaseConfig } from '../lib/supabase';
import { getAvatarColor } from '../utils/calculations';

// Local storage keys
const STORAGE_KEYS = {
  USER: 'mealmates_user',
  GROUP: 'mealmates_active_group',
  MEMBERS: 'mealmates_members',
  MEALS: 'mealmates_meals',
  SETTLEMENTS: 'mealmates_settlements',
};

// Default seed data based on user specification
const DEFAULT_USER: User = {
  id: 'user-jay',
  email: 'jay@mealmates.app',
  name: 'Jay',
};

const DEFAULT_GROUP: Group = {
  id: 'group-our-room',
  name: 'Our Room',
  currency: '₹',
  owner_id: 'user-jay',
  created_at: '2026-09-01T00:00:00Z',
};

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: 'm-jay', group_id: 'group-our-room', name: 'Jay', user_id: 'user-jay', avatar_color: '#10B981', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'm-aniket', group_id: 'group-our-room', name: 'Aniket', user_id: null, avatar_color: '#3B82F6', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'm-gautam', group_id: 'group-our-room', name: 'Gautam', user_id: null, avatar_color: '#F59E0B', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'm-rohit', group_id: 'group-our-room', name: 'Rohit', user_id: null, avatar_color: '#EC4899', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'm-parth', group_id: 'group-our-room', name: 'Parth', user_id: null, avatar_color: '#8B5CF6', is_active: true, created_at: '2026-09-01T00:00:00Z' },
];

/**
 * Seed meals for September 2026 that yield the exact balances requested:
 * Jay: -₹320
 * Aniket: +₹210
 * Gautam: +₹150
 * Rohit: -₹80
 * Parth: +₹40
 */
const DEFAULT_MEALS: Meal[] = [
  {
    id: 'meal-sep15-lunch',
    group_id: 'group-our-room',
    date: '2026-09-15',
    meal_type: 'lunch',
    total_amount: 400,
    paid_by: 'm-jay',
    notes: 'Paneer Thali and Rotis',
    eater_ids: ['m-jay', 'm-aniket', 'm-gautam', 'm-parth'],
    created_at: '2026-09-15T13:30:00Z',
  },
  {
    id: 'meal-sep15-dinner',
    group_id: 'group-our-room',
    date: '2026-09-15',
    meal_type: 'dinner',
    total_amount: 500,
    paid_by: 'm-aniket',
    notes: 'Biryani Feast for everyone',
    eater_ids: ['m-jay', 'm-aniket', 'm-gautam', 'm-rohit', 'm-parth'],
    created_at: '2026-09-15T21:00:00Z',
  },
  {
    id: 'meal-sep14-dinner',
    group_id: 'group-our-room',
    date: '2026-09-14',
    meal_type: 'dinner',
    total_amount: 450,
    paid_by: 'm-gautam',
    notes: 'Dal Makhani & Naan',
    eater_ids: ['m-jay', 'm-aniket', 'm-gautam', 'm-rohit', 'm-parth'],
    created_at: '2026-09-14T20:45:00Z',
  },
  {
    id: 'meal-sep14-lunch',
    group_id: 'group-our-room',
    date: '2026-09-14',
    meal_type: 'lunch',
    total_amount: 320,
    paid_by: 'm-parth',
    notes: 'South Indian Dosa Platter',
    eater_ids: ['m-jay', 'm-aniket', 'm-gautam', 'm-parth'],
    created_at: '2026-09-14T13:15:00Z',
  },
  {
    id: 'meal-sep13-dinner',
    group_id: 'group-our-room',
    date: '2026-09-13',
    meal_type: 'dinner',
    total_amount: 550,
    paid_by: 'm-aniket',
    notes: 'Weekend Pasta & Garlic Bread',
    eater_ids: ['m-jay', 'm-aniket', 'm-gautam', 'm-rohit', 'm-parth'],
    created_at: '2026-09-13T21:15:00Z',
  },
  {
    id: 'meal-sep12-dinner',
    group_id: 'group-our-room',
    date: '2026-09-12',
    meal_type: 'dinner',
    total_amount: 480,
    paid_by: 'm-gautam',
    notes: 'Special Rajma Chawal',
    eater_ids: ['m-jay', 'm-aniket', 'm-gautam', 'm-rohit'],
    created_at: '2026-09-12T20:30:00Z',
  },
  {
    id: 'meal-sep11-lunch',
    group_id: 'group-our-room',
    date: '2026-09-11',
    meal_type: 'lunch',
    total_amount: 350,
    paid_by: 'm-jay',
    notes: 'Healthy salad & wraps',
    eater_ids: ['m-jay', 'm-aniket', 'm-rohit', 'm-parth', 'm-gautam'],
    created_at: '2026-09-11T13:00:00Z',
  },
  {
    id: 'meal-sep10-dinner',
    group_id: 'group-our-room',
    date: '2026-09-10',
    meal_type: 'dinner',
    total_amount: 400,
    paid_by: 'm-rohit',
    notes: 'Veg Korma & Jeera Rice',
    eater_ids: ['m-jay', 'm-aniket', 'm-gautam', 'm-rohit', 'm-parth'],
    created_at: '2026-09-10T20:45:00Z',
  },
];

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUP)) {
      localStorage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(DEFAULT_GROUP));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEALS)) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(DEFAULT_MEALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTLEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify([]));
    }
  }

  // Subscribe to changes
  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Listener notification error:', e);
      }
    });
  }

  // --- Auth / User Methods ---
  public async getCurrentUser(): Promise<User | null> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Roommate',
          avatar_url: user.user_metadata?.avatar_url,
        };
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : DEFAULT_USER;
  }

  public async setCurrentUser(user: User | null): Promise<void> {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    this.notify();
  }

  // --- Group Methods ---
  public async getActiveGroup(): Promise<Group> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const { data } = await supabase.from('groups').select('*').limit(1).single();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          currency: data.currency || '₹',
          owner_id: data.owner_id,
          created_at: data.created_at,
        };
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.GROUP);
    return raw ? JSON.parse(raw) : DEFAULT_GROUP;
  }

  public async updateActiveGroup(updates: Partial<Group>): Promise<Group> {
    const current = await this.getActiveGroup();
    const updated = { ...current, ...updates };

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      await supabase.from('groups').update({
        name: updated.name,
        currency: updated.currency,
      }).eq('id', current.id);
    }

    localStorage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- Member Methods ---
  public async getMembers(): Promise<GroupMember[]> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const group = await this.getActiveGroup();
      const { data } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          group_id: d.group_id,
          name: d.name,
          user_id: d.user_id,
          avatar_color: d.avatar_color || getAvatarColor(d.name),
          is_active: d.is_active,
          created_at: d.created_at,
        }));
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return raw ? JSON.parse(raw) : DEFAULT_MEMBERS;
  }

  public async addMember(name: string): Promise<GroupMember> {
    const group = await this.getActiveGroup();
    const newMember: GroupMember = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      group_id: group.id,
      name: name.trim(),
      user_id: null,
      avatar_color: getAvatarColor(name),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('group_members').insert({
        group_id: group.id,
        name: newMember.name,
        avatar_color: newMember.avatar_color,
        is_active: true,
      }).select().single();
      if (!error && data) {
        newMember.id = data.id;
      }
    }

    const members = await this.getMembers();
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
    return newMember;
  }

  public async updateMember(id: string, updates: Partial<GroupMember>): Promise<GroupMember> {
    const members = await this.getMembers();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const updated = { ...members[index], ...updates };
    members[index] = updated;

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      await supabase.from('group_members').update({
        name: updated.name,
        is_active: updated.is_active,
        avatar_color: updated.avatar_color,
      }).eq('id', id);
    }

    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
    return updated;
  }

  public async deleteMember(id: string): Promise<{ success: boolean; reason?: string }> {
    const meals = await this.getMeals();
    const hasMeals = meals.some((m) => m.paid_by === id || m.eater_ids.includes(id));
    
    if (hasMeals) {
      // Deactivate instead of hard deleting to preserve historical meal data
      await this.updateMember(id, { is_active: false });
      return {
        success: true,
        reason: 'Member marked as inactive because they have existing meal records.',
      };
    }

    const members = await this.getMembers();
    const filtered = members.filter((m) => m.id !== id);

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      await supabase.from('group_members').delete().eq('id', id);
    }

    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filtered));
    this.notify();
    return { success: true };
  }

  // --- Meal Methods ---
  public async getMeals(): Promise<Meal[]> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const group = await this.getActiveGroup();
      const { data: mealsData } = await supabase
        .from('meals')
        .select(`
          *,
          meal_members(member_id, share_amount)
        `)
        .eq('group_id', group.id)
        .order('date', { ascending: false });

      if (mealsData && mealsData.length > 0) {
        return mealsData.map((m) => ({
          id: m.id,
          group_id: m.group_id,
          date: m.date,
          meal_type: m.meal_type,
          total_amount: Number(m.total_amount),
          paid_by: m.paid_by,
          notes: m.notes,
          created_by: m.created_by,
          created_at: m.created_at,
          eater_ids: m.meal_members ? m.meal_members.map((mm: { member_id: string }) => mm.member_id) : [],
        }));
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    return raw ? JSON.parse(raw) : DEFAULT_MEALS;
  }

  public async addMeal(mealData: Omit<Meal, 'id' | 'created_at' | 'group_id'>): Promise<Meal> {
    const group = await this.getActiveGroup();
    const newMeal: Meal = {
      ...mealData,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      group_id: group.id,
      created_at: new Date().toISOString(),
    };

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('meals').insert({
        group_id: group.id,
        date: newMeal.date,
        meal_type: newMeal.meal_type,
        total_amount: newMeal.total_amount,
        paid_by: newMeal.paid_by,
        notes: newMeal.notes,
      }).select().single();

      if (!error && data) {
        newMeal.id = data.id;
        const sharePerPerson = newMeal.total_amount / (newMeal.eater_ids.length || 1);
        const mealMembers = newMeal.eater_ids.map((eaterId) => ({
          meal_id: data.id,
          member_id: eaterId,
          share_amount: Math.round(sharePerPerson * 100) / 100,
        }));
        await supabase.from('meal_members').insert(mealMembers);
      }
    }

    const meals = await this.getMeals();
    // Prepend to maintain newest first
    meals.unshift(newMeal);
    // Sort by date descending
    meals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    this.notify();
    return newMeal;
  }

  public async updateMeal(id: string, mealData: Partial<Meal>): Promise<Meal> {
    const meals = await this.getMeals();
    const index = meals.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Meal not found');

    const updated: Meal = { ...meals[index], ...mealData };
    meals[index] = updated;
    meals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      await supabase.from('meals').update({
        date: updated.date,
        meal_type: updated.meal_type,
        total_amount: updated.total_amount,
        paid_by: updated.paid_by,
        notes: updated.notes,
      }).eq('id', id);

      if (updated.eater_ids) {
        // Delete old and re-insert
        await supabase.from('meal_members').delete().eq('meal_id', id);
        const sharePerPerson = updated.total_amount / (updated.eater_ids.length || 1);
        const mealMembers = updated.eater_ids.map((eaterId) => ({
          meal_id: id,
          member_id: eaterId,
          share_amount: Math.round(sharePerPerson * 100) / 100,
        }));
        await supabase.from('meal_members').insert(mealMembers);
      }
    }

    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    this.notify();
    return updated;
  }

  public async deleteMeal(id: string): Promise<void> {
    const meals = await this.getMeals();
    const filtered = meals.filter((m) => m.id !== id);

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      await supabase.from('meal_members').delete().eq('meal_id', id);
      await supabase.from('meals').delete().eq('id', id);
    }

    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(filtered));
    this.notify();
  }

  // --- Settlements Methods ---
  public async getSettlements(): Promise<SettlementRecord[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public async recordSettlement(
    fromId: string,
    toId: string,
    amount: number,
    notes?: string
  ): Promise<SettlementRecord> {
    const group = await this.getActiveGroup();
    const record: SettlementRecord = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      group_id: group.id,
      from_member_id: fromId,
      to_member_id: toId,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes,
      created_at: new Date().toISOString(),
    };

    const records = await this.getSettlements();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(records));
    this.notify();
    return record;
  }

  // Reset demo data to defaults
  public resetToDefaultDemo(): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    localStorage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(DEFAULT_GROUP));
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(DEFAULT_MEALS));
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify([]));
    this.notify();
  }
}

export const storageService = new StorageService();
