import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

/**
 * Google Sheets Sync API
 * 
 * Syncs financial data from Google Sheets
 */

async function getGoogleSheetsAuth() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  
  if (apiKey) {
    // Simple API key auth (read-only)
    return google.sheets({ version: 'v4', auth: apiKey });
  }
  
  if (credentials) {
    // Service account auth (full access)
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    return google.sheets({ version: 'v4', auth });
  }
  
  throw new Error("Google Sheets credentials not configured");
}

export async function GET(request: NextRequest) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Google Sheets ID not configured" },
        { status: 500 }
      );
    }
    
    const sheets = await getGoogleSheetsAuth();
    
    // Fetch all ranges
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [
        'Sheet1!A1:Z100', // Main budget sheet
      ]
    });
    
    const data = response.data.valueRanges?.[0]?.values || [];
    
    // Parse the data structure from user's spreadsheet
    const parsedData = parseFinancialData(data);
    
    return NextResponse.json({
      success: true,
      data: parsedData,
      lastSync: new Date().toISOString(),
      spreadsheetId
    });
    
  } catch (error: any) {
    console.error("Google Sheets sync error:", error);
    
    // Return fallback data if Google Sheets fails
    return NextResponse.json({
      success: false,
      error: error.message,
      data: getFallbackData(),
      lastSync: new Date().toISOString()
    });
  }
}

function parseFinancialData(rows: any[][]) {
  const periods: any[] = [];
  const todos: any[] = [];
  let savings = 0;
  let stock = 0;
  
  let currentPeriod: any = null;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Detect date headers (12/12, 12/17, etc.)
    if (row[0] && /^\d{1,2}\/\d{1,2}$/.test(String(row[0]).trim())) {
      if (currentPeriod) {
        periods.push(currentPeriod);
      }
      currentPeriod = {
        date: String(row[0]).trim(),
        income: { jenna: 0, derek: 0 },
        expenses: [],
        delta: 0
      };
    }
    
    // Parse income
    if (currentPeriod) {
      if (row[0] === 'Jenna' && row[1]) {
        currentPeriod.income.jenna = Number(row[1]) || 0;
      }
      if (row[2] === 'Derek' && row[3]) {
        currentPeriod.income.derek = Number(row[3]) || 0;
      }
      
      // Parse expenses
      if (row[0] && row[1] && !isNaN(Number(row[1]))) {
        const expense = String(row[0]).trim();
        const amount = Number(row[1]);
        if (amount < 0 || ['bus', 'DCRA', 'discover', 'subs', 'utilities', 'taxes', 'Mortgage', 'SMIS', 'SF', 'SL', 'mazsa', 'YCCA'].includes(expense)) {
          currentPeriod.expenses.push({
            category: expense,
            amount: Math.abs(amount)
          });
        }
      }
      
      // Parse delta
      if (row[0] === 'Delta' && row[1]) {
        const deltaStr = String(row[1]).replace(/[$,]/g, '');
        currentPeriod.delta = Number(deltaStr) || 0;
      }
    }
    
    // Parse assets
    if (row[0] === 'savings' && row[1]) {
      savings = Number(row[1]) || 0;
    }
    if (row[0] === 'Stock' && row[1]) {
      stock = Number(row[1]) || 0;
    }
    
    // Parse todos (look for specific markers)
    if (row[0] && ['refill out bus form', 'do DCRA today'].some(todo => String(row[0]).includes(todo))) {
      todos.push({
        text: String(row[0]).trim(),
        completed: false,
        date: currentPeriod?.date
      });
    }
  }
  
  if (currentPeriod) {
    periods.push(currentPeriod);
  }
  
  return {
    periods,
    assets: {
      savings,
      stock,
      total: savings + stock
    },
    todos
  };
}

function getFallbackData() {
  return {
    periods: [
      {
        date: '12/12',
        income: { jenna: 4179, derek: 3780 },
        expenses: [
          { category: 'bus', amount: 300 },
          { category: 'DCRA', amount: 451 },
          { category: 'Mortgage', amount: 1560 },
          { category: 'SMIS', amount: 1560 },
          { category: 'SF', amount: 455 },
          { category: 'SL', amount: 745 }
        ],
        delta: 1419
      },
      {
        date: '12/17',
        income: { jenna: 0, derek: 3780 },
        expenses: [
          { category: 'discover', amount: 1000 },
          { category: 'utilities', amount: 1000 },
          { category: 'taxes', amount: 415 }
        ],
        delta: 2116
      },
      {
        date: '12/29',
        income: { jenna: 5000, derek: 0 },
        expenses: [
          { category: 'subs', amount: 446 },
          { category: 'mazsa', amount: 502 },
          { category: 'YCCA', amount: 1538 }
        ],
        delta: 2514
      },
      {
        date: '1/7',
        income: { jenna: 0, derek: 3780 },
        expenses: [
          { category: 'bus', amount: 300 }
        ],
        delta: 3480
      }
    ],
    assets: {
      savings: 3500,
      stock: 9301,
      total: 12801
    },
    todos: [
      { text: 'refill out bus form', completed: false, date: '12/12' },
      { text: 'do DCRA today', completed: false, date: '12/12' }
    ]
  };
}
