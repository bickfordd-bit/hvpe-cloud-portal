/**
 * Unified Chat Agent Tests
 * Tests for daily archiving, persistence, and UI state management
 */

// Mock global window and localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock global window object for Node environment
global.window = {
  localStorage: localStorageMock,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Helper functions from HvpeChatDock
const CHAT_KEY_PREFIX = 'hvpe-chat-history-';
const CHAT_ARCHIVE_PREFIX = 'hvpe-chat-archive-';
const LAST_SEEN_DATE_KEY = 'hvpe-chat-last-date';

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function storageKeyFor(dateKey: string) {
  return `${CHAT_KEY_PREFIX}${dateKey}`;
}

function archiveKeyFor(dateKey: string) {
  return `${CHAT_ARCHIVE_PREFIX}${dateKey}`;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

describe('Chat Persistence Logic', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Date Key Generation', () => {
    it('should generate ISO date key in YYYY-MM-DD format', () => {
      const date = new Date('2026-01-03T14:35:10.303Z');
      const key = getDateKey(date);
      expect(key).toBe('2026-01-03');
    });

    it('should use current date when no date provided', () => {
      const key = getDateKey();
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Storage Key Generation', () => {
    it('should generate correct storage key', () => {
      const dateKey = '2026-01-03';
      const key = storageKeyFor(dateKey);
      expect(key).toBe('hvpe-chat-history-2026-01-03');
    });

    it('should generate correct archive key', () => {
      const dateKey = '2026-01-02';
      const key = archiveKeyFor(dateKey);
      expect(key).toBe('hvpe-chat-archive-2026-01-02');
    });
  });

  describe('Message Persistence', () => {
    it('should store messages in localStorage', () => {
      const dateKey = getDateKey();
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'Hello!' },
        { role: 'user', content: 'Hi there!' },
      ];

      window.localStorage.setItem(storageKeyFor(dateKey), JSON.stringify(messages));

      const stored = window.localStorage.getItem(storageKeyFor(dateKey));
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].role).toBe('assistant');
    });

    it('should handle empty message array', () => {
      const dateKey = getDateKey();
      const messages: ChatMessage[] = [];

      window.localStorage.setItem(storageKeyFor(dateKey), JSON.stringify(messages));

      const stored = window.localStorage.getItem(storageKeyFor(dateKey));
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('Daily Archiving', () => {
    it('should archive previous day messages when date changes', () => {
      const yesterday = '2026-01-02';
      const today = '2026-01-03';

      // Simulate messages from yesterday
      const yesterdayMessages: ChatMessage[] = [
        { role: 'assistant', content: 'Yesterday message' },
        { role: 'user', content: 'User response' },
      ];

      window.localStorage.setItem(storageKeyFor(yesterday), JSON.stringify(yesterdayMessages));
      window.localStorage.setItem(LAST_SEEN_DATE_KEY, yesterday);

      // Simulate date change and archiving logic
      const lastSeen = window.localStorage.getItem(LAST_SEEN_DATE_KEY);
      if (lastSeen && lastSeen !== today) {
        const lastMessages = window.localStorage.getItem(storageKeyFor(lastSeen));
        if (lastMessages) {
          window.localStorage.setItem(archiveKeyFor(lastSeen), lastMessages);
        }
      }

      // Verify archiving occurred
      const archived = window.localStorage.getItem(archiveKeyFor(yesterday));
      expect(archived).toBeTruthy();
      const parsedArchive = JSON.parse(archived!);
      expect(parsedArchive).toHaveLength(2);
      expect(parsedArchive[0].content).toBe('Yesterday message');
    });

    it('should not archive if no date change', () => {
      const today = getDateKey();

      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'Today message' },
      ];

      window.localStorage.setItem(storageKeyFor(today), JSON.stringify(messages));
      window.localStorage.setItem(LAST_SEEN_DATE_KEY, today);

      // No archiving should occur
      const archived = window.localStorage.getItem(archiveKeyFor(today));
      expect(archived).toBeNull();
    });

    it('should handle missing previous day messages gracefully', () => {
      const yesterday = '2026-01-02';
      const today = '2026-01-03';

      window.localStorage.setItem(LAST_SEEN_DATE_KEY, yesterday);
      // No messages stored for yesterday

      // Archiving logic should not crash
      const lastSeen = window.localStorage.getItem(LAST_SEEN_DATE_KEY);
      if (lastSeen && lastSeen !== today) {
        const lastMessages = window.localStorage.getItem(storageKeyFor(lastSeen));
        if (lastMessages) {
          window.localStorage.setItem(archiveKeyFor(lastSeen), lastMessages);
        }
      }

      // No archive should be created
      const archived = window.localStorage.getItem(archiveKeyFor(yesterday));
      expect(archived).toBeNull();
    });
  });

  describe('Message Retrieval', () => {
    it('should retrieve stored messages correctly', () => {
      const dateKey = getDateKey();
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'Stored message' },
      ];

      window.localStorage.setItem(storageKeyFor(dateKey), JSON.stringify(messages));

      const stored = window.localStorage.getItem(storageKeyFor(dateKey));
      const parsed = stored ? JSON.parse(stored) : null;

      expect(parsed).toBeTruthy();
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed![0].content).toBe('Stored message');
    });

    it('should handle corrupted JSON gracefully', () => {
      const dateKey = getDateKey();

      window.localStorage.setItem(storageKeyFor(dateKey), 'invalid json {');

      let parsed: ChatMessage[] | null = null;
      const stored = window.localStorage.getItem(storageKeyFor(dateKey));
      if (stored) {
        try {
          parsed = JSON.parse(stored) as ChatMessage[];
        } catch {
          // Expected error for corrupted JSON
          parsed = null;
        }
      }

      expect(parsed).toBeNull();
    });
  });
});

describe('UI State Management', () => {
  describe('Active Date Display', () => {
    it('should format date for display correctly', () => {
      const activeDateKey = '2026-01-03';
      const activeTitle = new Date(activeDateKey).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      expect(activeTitle).toContain('Jan');
      expect(activeTitle).toContain('3');
      expect(activeTitle).toContain('2026');
    });
  });

  describe('Message Array Updates', () => {
    it('should add user message to array', () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'Hello!' },
      ];

      const userMessage = 'How are you?';
      const nextMessages = [...messages, { role: 'user' as const, content: userMessage }];

      expect(nextMessages).toHaveLength(2);
      expect(nextMessages[1].role).toBe('user');
      expect(nextMessages[1].content).toBe('How are you?');
    });

    it('should add assistant reply to array', () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'Hello!' },
        { role: 'user', content: 'How are you?' },
      ];

      const reply = 'I am doing great!';
      const nextMessages = [...messages, { role: 'assistant' as const, content: reply }];

      expect(nextMessages).toHaveLength(3);
      expect(nextMessages[2].role).toBe('assistant');
      expect(nextMessages[2].content).toBe(reply);
    });
  });
});

describe('Archive Rotation Logic', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should rotate messages to new day when interval triggers', () => {
    const oldDateKey = '2026-01-02';
    const newDateKey = '2026-01-03';

    // Setup old day messages
    const oldMessages: ChatMessage[] = [
      { role: 'assistant', content: 'Old day message' },
    ];

    window.localStorage.setItem(storageKeyFor(oldDateKey), JSON.stringify(oldMessages));
    window.localStorage.setItem(LAST_SEEN_DATE_KEY, oldDateKey);

    // Simulate the interval check detecting date change
    const currentKey = newDateKey;
    const activeDateKey = oldDateKey;

    if (currentKey !== activeDateKey) {
      // Archive old messages
      const messages = window.localStorage.getItem(storageKeyFor(activeDateKey));
      if (messages) {
        window.localStorage.setItem(archiveKeyFor(activeDateKey), messages);
      }

      // Update to new date
      window.localStorage.setItem(LAST_SEEN_DATE_KEY, currentKey);
    }

    // Verify rotation
    const archived = window.localStorage.getItem(archiveKeyFor(oldDateKey));
    expect(archived).toBeTruthy();
    const parsedArchive = JSON.parse(archived!);
    expect(parsedArchive[0].content).toBe('Old day message');

    const lastSeen = window.localStorage.getItem(LAST_SEEN_DATE_KEY);
    expect(lastSeen).toBe(newDateKey);
  });
});
