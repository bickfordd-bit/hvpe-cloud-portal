/**
 * Financial Life Management System
 * 
 * Copyright (c) 2025 Bickford Technologies LLC
 * Real-time financial tracking with Google Sheets sync
 */

export interface FinancialEntry {
  date: string;
  person: string;
  amount: number;
  category: string;
  description?: string;
}

export interface BudgetPeriod {
  date: string;
  income: {
    jenna: number;
    derek: number;
  };
  expenses: {
    [key: string]: number;
  };
  delta: number;
}

export interface FinancialSnapshot {
  savings: number;
  stock: number;
  total: number;
  periods: BudgetPeriod[];
  todos: TodoItem[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  date?: string;
}

// Google Sheets Configuration
export const SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
  ranges: {
    budget: 'Budget!A1:Z100',
    todos: 'Todos!A1:C100',
    assets: 'Assets!A1:D10'
  },
  syncInterval: 30000 // 30 seconds
};

/**
 * Parse budget data from Google Sheets format
 */
export function parseBudgetData(rows: any[][]): BudgetPeriod[] {
  const periods: BudgetPeriod[] = [];
  
  // This parser handles the specific format from the user's spreadsheet
  // Date row detection, income detection, expense detection
  
  let currentDate = '';
  let currentPeriod: Partial<BudgetPeriod> = {};
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Detect date headers (e.g., "12/12", "12/17")
    if (row[0] && /^\d{1,2}\/\d{1,2}$/.test(String(row[0]).trim())) {
      if (currentDate && currentPeriod.income) {
        periods.push(currentPeriod as BudgetPeriod);
      }
      currentDate = String(row[0]).trim();
      currentPeriod = {
        date: currentDate,
        income: { jenna: 0, derek: 0 },
        expenses: {},
        delta: 0
      };
    }
    
    // Detect income (Jenna/Derek with amounts)
    if (row[0] === 'Jenna' && row[1] && !isNaN(Number(row[1]))) {
      currentPeriod.income = currentPeriod.income || { jenna: 0, derek: 0 };
      currentPeriod.income.jenna = Number(row[1]);
    }
    
    if (row[0] === 'Derek' && row[1] && !isNaN(Number(row[1]))) {
      currentPeriod.income = currentPeriod.income || { jenna: 0, derek: 0 };
      currentPeriod.income.derek = Number(row[1]);
    }
    
    // Detect expenses (negative numbers or expense categories)
    if (row[0] && row[1] && !isNaN(Number(row[1]))) {
      const category = String(row[0]).trim();
      const amount = Number(row[1]);
      
      if (amount < 0 || ['bus', 'DCRA', 'discover', 'subs', 'utilities', 'taxes', 'Mortgage', 'SMIS', 'SF', 'SL', 'mazsa', 'YCCA'].includes(category)) {
        currentPeriod.expenses = currentPeriod.expenses || {};
        currentPeriod.expenses[category] = Math.abs(amount);
      }
    }
    
    // Detect Delta
    if (row[0] === 'Delta' && row[1]) {
      const deltaStr = String(row[1]).replace(/[$,]/g, '');
      currentPeriod.delta = Number(deltaStr) || 0;
    }
  }
  
  // Push last period
  if (currentDate && currentPeriod.income) {
    periods.push(currentPeriod as BudgetPeriod);
  }
  
  return periods;
}

/**
 * Parse asset data (savings, stock)
 */
export function parseAssetData(rows: any[][]): { savings: number; stock: number; total: number } {
  let savings = 0;
  let stock = 0;
  
  for (const row of rows) {
    if (row[0] === 'savings' && row[1]) {
      savings = Number(row[1]) || 0;
    }
    if (row[0] === 'Stock' && row[1]) {
      stock = Number(row[1]) || 0;
    }
  }
  
  return {
    savings,
    stock,
    total: savings + stock
  };
}

/**
 * Parse todo items
 */
export function parseTodoData(rows: any[][]): TodoItem[] {
  const todos: TodoItem[] = [];
  
  for (let i = 1; i < rows.length; i++) { // Skip header
    const row = rows[i];
    if (row[0]) {
      todos.push({
        id: `todo-${i}`,
        text: String(row[0]),
        completed: row[1] === 'TRUE' || row[1] === true,
        date: row[2] ? String(row[2]) : undefined
      });
    }
  }
  
  return todos;
}

/**
 * Calculate financial health metrics
 */
export function calculateFinancialMetrics(snapshot: FinancialSnapshot) {
  const totalIncome = snapshot.periods.reduce((sum, p) => sum + p.income.jenna + p.income.derek, 0);
  const totalExpenses = snapshot.periods.reduce((sum, p) => {
    return sum + Object.values(p.expenses).reduce((expSum, exp) => expSum + exp, 0);
  }, 0);
  const totalDelta = snapshot.periods.reduce((sum, p) => sum + p.delta, 0);
  
  const savingsRate = totalIncome > 0 ? (totalDelta / totalIncome) * 100 : 0;
  const monthlyBurn = totalExpenses / snapshot.periods.length;
  const runwayMonths = monthlyBurn > 0 ? snapshot.total / monthlyBurn : 0;
  
  return {
    totalIncome,
    totalExpenses,
    totalDelta,
    savingsRate: Math.round(savingsRate * 10) / 10,
    monthlyBurn: Math.round(monthlyBurn),
    runwayMonths: Math.round(runwayMonths * 10) / 10
  };
}
