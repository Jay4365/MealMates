import type { Meal, GroupMember, MemberBalance, SettlementInstruction, MonthlyStats } from '../types';

/**
 * Format currency amount with sign and symbol
 */
export const formatCurrency = (amount: number, symbol: string = '₹', includeSign: boolean = false): string => {
  const rounded = Math.round(amount * 100) / 100;
  const absFormatted = `${symbol}${Math.abs(rounded).toLocaleString('en-IN', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

  if (!includeSign) return absFormatted;
  if (rounded > 0.001) return `+${absFormatted}`;
  if (rounded < -0.001) return `-${absFormatted}`;
  return absFormatted;
};

/**
 * Calculate per-person split and detailed share breakdown for a meal
 */
export const calculateMealSplit = (
  totalAmount: number,
  eaterIds: string[],
  payerId: string,
  allMembers: GroupMember[]
) => {
  if (!totalAmount || totalAmount <= 0 || eaterIds.length === 0) {
    return {
      perPersonCost: 0,
      shares: {},
      balances: {},
    };
  }

  const count = eaterIds.length;
  // Round share to 2 decimal places
  const perPersonCost = Math.round((totalAmount / count) * 100) / 100;
  
  const shares: Record<string, number> = {};
  const balances: Record<string, number> = {};

  // Assign share to each person who ate
  eaterIds.forEach((id) => {
    shares[id] = perPersonCost;
  });

  // Calculate net balance impact for every member
  allMembers.forEach((member) => {
    const paid = member.id === payerId ? totalAmount : 0;
    const share = shares[member.id] || 0;
    balances[member.id] = Math.round((paid - share) * 100) / 100;
  });

  return {
    perPersonCost,
    shares,
    balances,
  };
};

/**
 * Calculate balances for all members across a set of meals
 */
export const calculateMemberBalances = (
  members: GroupMember[],
  meals: Meal[]
): MemberBalance[] => {
  const memberMap = new Map<string, MemberBalance>();

  // Initialize
  members.forEach((m) => {
    memberMap.set(m.id, {
      member_id: m.id,
      member_name: m.name,
      avatar_color: m.avatar_color || '#10B981',
      is_active: m.is_active,
      total_paid: 0,
      total_share: 0,
      net_balance: 0,
      meals_eaten_count: 0,
      lunch_count: 0,
      dinner_count: 0,
    });
  });

  // Process each meal
  meals.forEach((meal) => {
    const amount = Number(meal.total_amount) || 0;
    const eaterCount = meal.eater_ids?.length || 0;
    if (eaterCount === 0 || amount <= 0) return;

    const perPerson = Math.round((amount / eaterCount) * 100) / 100;

    // Credit payer
    const payer = memberMap.get(meal.paid_by);
    if (payer) {
      payer.total_paid += amount;
    }

    // Debit eaters
    meal.eater_ids.forEach((eaterId) => {
      const eater = memberMap.get(eaterId);
      if (eater) {
        eater.total_share += perPerson;
        eater.meals_eaten_count += 1;
        if (meal.meal_type === 'lunch') {
          eater.lunch_count += 1;
        } else {
          eater.dinner_count += 1;
        }
      }
    });
  });

  // Calculate final net balance = total_paid - total_share
  const result: MemberBalance[] = [];
  memberMap.forEach((mb) => {
    mb.total_paid = Math.round(mb.total_paid * 100) / 100;
    mb.total_share = Math.round(mb.total_share * 100) / 100;
    mb.net_balance = Math.round((mb.total_paid - mb.total_share) * 100) / 100;
    result.push(mb);
  });

  return result;
};

/**
 * Min-Cash-Flow Algorithm for optimal debt simplification
 * Minimizes the total number of transactions required to settle up
 */
export const calculateSimplifiedSettlements = (
  balances: MemberBalance[]
): SettlementInstruction[] => {
  interface Account {
    id: string;
    name: string;
    amount: number;
  }

  const debtors: Account[] = [];
  const creditors: Account[] = [];

  balances.forEach((b) => {
    const net = Math.round(b.net_balance * 100) / 100;
    if (net < -0.01) {
      debtors.push({ id: b.member_id, name: b.member_name, amount: Math.abs(net) });
    } else if (net > 0.01) {
      creditors.push({ id: b.member_id, name: b.member_name, amount: net });
    }
  });

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SettlementInstruction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmount = Math.min(debtor.amount, creditor.amount);
    const roundedSettled = Math.round(settledAmount * 100) / 100;

    if (roundedSettled > 0.01) {
      transactions.push({
        from_id: debtor.id,
        from_name: debtor.name,
        to_id: creditor.id,
        to_name: creditor.name,
        amount: roundedSettled,
      });
    }

    debtor.amount = Math.round((debtor.amount - settledAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - settledAmount) * 100) / 100;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return transactions;
};

/**
 * Monthly analytics generation
 */
export const generateMonthlyStats = (
  allMeals: Meal[],
  members: GroupMember[],
  yearMonth: string // "YYYY-MM" e.g. "2026-09"
): MonthlyStats => {
  const [year, month] = yearMonth.split('-').map(Number);
  const dateObj = new Date(year, month - 1, 1);
  const month_str = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filter meals for this month
  const monthMeals = allMeals.filter((m) => m.date.startsWith(yearMonth));

  let total_expense = 0;
  let lunch_count = 0;
  let dinner_count = 0;
  let total_person_meals = 0;

  monthMeals.forEach((meal) => {
    const amount = Number(meal.total_amount) || 0;
    total_expense += amount;
    if (meal.meal_type === 'lunch') {
      lunch_count += 1;
    } else {
      dinner_count += 1;
    }
    total_person_meals += meal.eater_ids?.length || 0;
  });

  const total_meals = monthMeals.length;
  const avg_cost_per_meal = total_meals > 0 ? Math.round((total_expense / total_meals) * 100) / 100 : 0;

  const balances = calculateMemberBalances(members, monthMeals);
  const settlements = calculateSimplifiedSettlements(balances);

  const member_summaries = balances.map((b) => ({
    member_id: b.member_id,
    member_name: b.member_name,
    avatar_color: b.avatar_color,
    meals_count: b.meals_eaten_count,
    total_share: b.total_share,
    total_paid: b.total_paid,
    net_balance: b.net_balance,
  }));

  return {
    month_str,
    month_key: yearMonth,
    total_expense: Math.round(total_expense * 100) / 100,
    total_meals,
    lunch_count,
    dinner_count,
    avg_cost_per_meal,
    total_person_meals,
    member_summaries,
    settlements,
  };
};

/**
 * Helper to get initial avatar colors
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
