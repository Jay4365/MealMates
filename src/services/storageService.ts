import type { Group, GroupMember, Meal, SettlementRecord, User } from '../types';
import { supabase, getSupabaseConfig } from '../lib/supabase';
import { getAvatarColor } from '../utils/calculations';

// Local storage keys (used as fallback or for caching)
const STORAGE_KEYS = {
  USER: 'mealmates_user',
  GROUP: 'mealmates_active_group',
  MEMBERS: 'mealmates_members',
  MEALS: 'mealmates_meals',
  SETTLEMENTS: 'mealmates_settlements',
};

class StorageService {
  private listeners: (() => void)[] = [];
  private realtimeChannelInitialized = false;

  constructor() {
    this.initRealtime();
  }

  private initRealtime() {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase && !this.realtimeChannelInitialized) {
      try {
        supabase
          .channel('schema-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            this.notify();
          })
          .subscribe();
        this.realtimeChannelInitialized = true;
      } catch (err) {
        console.warn('Realtime subscription setup notice:', err);
      }
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
    return raw ? JSON.parse(raw) : null;
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
      const { data } = await supabase.from('groups').select('*').limit(1).maybeSingle();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          currency: data.currency || '₹',
          owner_id: data.owner_id,
          created_at: data.created_at,
        };
      }
      // If no group exists in Supabase, create one dynamically
      const { data: newGroup } = await supabase.from('groups').insert({
        name: 'Our Room',
        currency: '₹',
      }).select().single();

      if (newGroup) {
        return {
          id: newGroup.id,
          name: newGroup.name,
          currency: newGroup.currency || '₹',
          owner_id: newGroup.owner_id,
          created_at: newGroup.created_at,
        };
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.GROUP);
    if (raw) return JSON.parse(raw);

    const fallbackGroup: Group = {
      id: 'group-default',
      name: 'Our Room',
      currency: '₹',
      owner_id: 'owner',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.GROUP, JSON.stringify(fallbackGroup));
    return fallbackGroup;
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
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch members from Supabase:', error);
      }
      if (data) {
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
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return raw ? JSON.parse(raw) : [];
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

      if (error) {
        console.error('Failed to add member to Supabase:', error);
        throw error;
      }
      if (data) {
        newMember.id = data.id;
      }
    }

    const members = await this.getMembers();
    if (!members.some((m) => m.id === newMember.id)) {
      members.push(newMember);
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    }
    this.notify();
    return newMember;
  }

  public async updateMember(id: string, updates: Partial<GroupMember>): Promise<GroupMember> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('group_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update member in Supabase:', error);
        throw error;
      }
      this.notify();
      return {
        id: data.id,
        group_id: data.group_id,
        name: data.name,
        user_id: data.user_id,
        avatar_color: data.avatar_color || getAvatarColor(data.name),
        is_active: data.is_active,
        created_at: data.created_at,
      };
    }

    const members = await this.getMembers();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const updated = { ...members[index], ...updates };
    members[index] = updated;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
    return updated;
  }

  public async deleteMember(id: string): Promise<{ success: boolean; reason?: string }> {
    const meals = await this.getMeals();
    const hasMeals = meals.some((m) => m.paid_by === id || m.eater_ids.includes(id));

    if (hasMeals) {
      await this.updateMember(id, { is_active: false });
      return {
        success: true,
        reason: 'Roommate was marked inactive instead of deleted to preserve previous meal records.',
      };
    }

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const { error } = await supabase.from('group_members').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete member in Supabase:', error);
        throw error;
      }
    }

    const members = (await this.getMembers()).filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
    return { success: true };
  }

  // --- Meal Methods ---
  public async getMeals(): Promise<Meal[]> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const group = await this.getActiveGroup();
      const { data: mealsData, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_members(member_id, share_amount)
        `)
        .eq('group_id', group.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to fetch meals from Supabase:', error);
      }

      if (mealsData) {
        return mealsData.map((m) => ({
          id: m.id,
          group_id: m.group_id,
          date: m.date,
          meal_type: m.meal_type,
          total_amount: Number(m.total_amount),
          paid_by: m.paid_by,
          notes: m.notes || '',
          created_by: m.created_by,
          created_at: m.created_at,
          eater_ids: m.meal_members ? m.meal_members.map((mm: { member_id: string }) => mm.member_id) : [],
        }));
      }
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    return raw ? JSON.parse(raw) : [];
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

      if (error) {
        console.error('Supabase addMeal error:', error);
        throw error;
      }

      if (data) {
        newMeal.id = data.id;
        if (newMeal.eater_ids.length > 0) {
          const sharePerPerson = newMeal.total_amount / newMeal.eater_ids.length;
          const mealMembers = newMeal.eater_ids.map((eaterId) => ({
            meal_id: data.id,
            member_id: eaterId,
            share_amount: Math.round(sharePerPerson * 100) / 100,
          }));
          const { error: mmErr } = await supabase.from('meal_members').insert(mealMembers);
          if (mmErr) console.error('Failed to insert meal_members:', mmErr);
        }
      }
      this.notify();
      return newMeal;
    }

    const meals = await this.getMeals();
    meals.unshift(newMeal);
    meals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    this.notify();
    return newMeal;
  }

  public async updateMeal(id: string, mealData: Partial<Meal>): Promise<Meal> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      const { error } = await supabase
        .from('meals')
        .update({
          date: mealData.date,
          meal_type: mealData.meal_type,
          total_amount: mealData.total_amount,
          paid_by: mealData.paid_by,
          notes: mealData.notes,
        })
        .eq('id', id);

      if (error) {
        console.error('Failed to update meal in Supabase:', error);
        throw error;
      }

      if (mealData.eater_ids && mealData.total_amount) {
        await supabase.from('meal_members').delete().eq('meal_id', id);
        const sharePerPerson = mealData.total_amount / (mealData.eater_ids.length || 1);
        const mealMembers = mealData.eater_ids.map((eaterId) => ({
          meal_id: id,
          member_id: eaterId,
          share_amount: Math.round(sharePerPerson * 100) / 100,
        }));
        await supabase.from('meal_members').insert(mealMembers);
      }

      this.notify();
      const updatedList = await this.getMeals();
      return updatedList.find((m) => m.id === id) || (mealData as Meal);
    }

    const meals = await this.getMeals();
    const index = meals.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Meal not found');

    const updated: Meal = { ...meals[index], ...mealData };
    meals[index] = updated;
    meals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    this.notify();
    return updated;
  }

  public async deleteMeal(id: string): Promise<void> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      await supabase.from('meal_members').delete().eq('meal_id', id);
      const { error } = await supabase.from('meals').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete meal in Supabase:', error);
        throw error;
      }
      this.notify();
      return;
    }

    const meals = (await this.getMeals()).filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    this.notify();
  }

  // --- Settlement Methods ---
  public async getSettlements(): Promise<SettlementRecord[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    const localSettlements: SettlementRecord[] = raw ? JSON.parse(raw) : [];

    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      try {
        const group = await this.getActiveGroup();
        const { data, error } = await supabase
          .from('settlements')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const supabaseSettlements: SettlementRecord[] = data.map((s) => ({
            id: s.id,
            group_id: s.group_id,
            from_member_id: s.from_member_id,
            to_member_id: s.to_member_id,
            amount: Number(s.amount),
            date: s.date,
            notes: s.notes || undefined,
            created_at: s.created_at,
          }));

          // Merge local and supabase without duplicates
          const merged: SettlementRecord[] = [...supabaseSettlements];
          localSettlements.forEach((ls) => {
            if (!merged.some((m) => m.id === ls.id)) {
              merged.push(ls);
            }
          });
          localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.warn('Supabase fetch settlements notice:', err);
      }
    }

    return localSettlements;
  }

  public async recordSettlement(
    fromId: string,
    toId: string,
    amount: number,
    notes?: string
  ): Promise<SettlementRecord> {
    const group = await this.getActiveGroup();
    const newRecord: SettlementRecord = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      group_id: group.id,
      from_member_id: fromId,
      to_member_id: toId,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes,
      created_at: new Date().toISOString(),
    };

    // 1. ALWAYS persist to localStorage first so it survives page reloads
    const settlements = await this.getSettlements();
    settlements.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));

    // 2. Also try Supabase insert if configured
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('settlements').insert({
          group_id: group.id,
          from_member_id: fromId,
          to_member_id: toId,
          amount,
          notes,
          date: newRecord.date,
        }).select().single();

        if (!error && data) {
          newRecord.id = data.id;
          localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
        }
      } catch (err) {
        console.warn('Supabase recordSettlement notice:', err);
      }
    }

    this.notify();
    return newRecord;
  }

  public async deleteSettlement(id: string): Promise<void> {
    // 1. Remove from localStorage
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    const settlements: SettlementRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = settlements.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(filtered));

    // 2. Remove from Supabase if configured
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured && supabase) {
      try {
        await supabase.from('settlements').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSettlement notice:', err);
      }
    }

    this.notify();
  }

  public resetToDefaultDemo() {
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
    this.notify();
  }
}

export const storageService = new StorageService();
