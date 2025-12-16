/**
 * BCS Ledger Management
 * 
 * Append-only event ledger with date-based subdirectories.
 * Events are stored as JSON files in .bick/ledger/YYYY-MM-DD/<id>.json
 */

import fs from 'fs';
import path from 'path';
import { BickEvent, LedgerMetadata, EventType } from './types';

const LEDGER_ROOT = path.join(process.cwd(), '.bick', 'ledger');

/**
 * Ensure ledger directory structure exists
 */
function ensureLedgerDir(date: string): string {
  const dateDir = path.join(LEDGER_ROOT, date);
  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true });
  }
  return dateDir;
}

/**
 * Write an event to the ledger
 */
export function writeEvent(event: BickEvent): void {
  const eventDate = event.timestamp.split('T')[0]; // Extract YYYY-MM-DD
  const dateDir = ensureLedgerDir(eventDate);
  const filePath = path.join(dateDir, `${event.id}.json`);
  
  fs.writeFileSync(filePath, JSON.stringify(event, null, 2), 'utf-8');
}

/**
 * Read all events from the ledger
 */
export function readAllEvents(): BickEvent[] {
  const events: BickEvent[] = [];
  
  if (!fs.existsSync(LEDGER_ROOT)) {
    return events;
  }
  
  // Read all date directories
  const dateDirs = fs.readdirSync(LEDGER_ROOT)
    .filter(name => /^\d{4}-\d{2}-\d{2}$/.test(name))
    .sort();
  
  for (const dateDir of dateDirs) {
    const datePath = path.join(LEDGER_ROOT, dateDir);
    if (!fs.statSync(datePath).isDirectory()) continue;
    
    // Read all JSON files in this date directory
    const files = fs.readdirSync(datePath)
      .filter(name => name.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(datePath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const event = JSON.parse(content) as BickEvent;
        events.push(event);
      } catch (error) {
        console.error(`Failed to read event from ${filePath}:`, error);
      }
    }
  }
  
  // Sort by timestamp
  events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  
  return events;
}

/**
 * Get ledger metadata
 */
export function getLedgerMetadata(): LedgerMetadata {
  const events = readAllEvents();
  
  const eventTypes: Record<EventType, number> = {
    'intent.created': 0,
    'intent.closed': 0,
    'proof.attached': 0,
    'outcome.verified': 0,
    'milestone.external': 0,
    'revenue.received': 0,
    'burden.reported': 0,
    'artifact.shipped': 0,
  };
  
  for (const event of events) {
    eventTypes[event.type]++;
  }
  
  const timestamps = events.map(e => e.timestamp).sort();
  
  return {
    totalEvents: events.length,
    eventTypes,
    dateRange: {
      earliest: timestamps[0] || '',
      latest: timestamps[timestamps.length - 1] || '',
    },
  };
}

/**
 * Check if ledger exists and has events
 */
export function hasEvents(): boolean {
  return fs.existsSync(LEDGER_ROOT) && readAllEvents().length > 0;
}

/**
 * Get events by type
 */
export function getEventsByType<T extends BickEvent>(type: EventType): T[] {
  const allEvents = readAllEvents();
  return allEvents.filter(e => e.type === type) as T[];
}

/**
 * Get events in a date range
 */
export function getEventsInRange(startDate: string, endDate: string): BickEvent[] {
  const allEvents = readAllEvents();
  return allEvents.filter(e => {
    const eventDate = e.timestamp.split('T')[0];
    return eventDate >= startDate && eventDate <= endDate;
  });
}
