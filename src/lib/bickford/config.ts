// Bickford UI Configuration System
// Total control over all UI elements per instance

export interface BickfordUIConfig {
  // Branding
  branding: {
    appName: string;
    tagline: string;
    logo?: string;
    favicon?: string;
    primaryColor: string;
    accentColor: string;
  };

  // Header Configuration
  header: {
    show: boolean;
    title: string;
    subtitle?: string;
    showPoweredBy: boolean;
    customHTML?: string;
  };

  // Chat Interface
  chat: {
    placeholder: string;
    welcomeMessage: string;
    buttonText: string;
    showTimestamps: boolean;
    maxMessageLength: number;
    enableVoice: boolean;
    enableFileUpload: boolean;
  };

  // Features
  features: {
    enableOPTR: boolean;
    enableIntentToReality: boolean;
    enableIPProtection: boolean;
    showMetrics: boolean;
    showFormulaVersion: boolean;
  };

  // Privacy & Security
  privacy: {
    collectAnalytics: boolean;
    storeConversations: boolean;
    dataRetentionDays: number;
    showPrivacyNotice: boolean;
    allowDataExport: boolean;
    allowDataDeletion: boolean;
    encryptData: boolean;
  };

  // Footer
  footer: {
    show: boolean;
    copyright: string;
    links?: Array<{ text: string; url: string }>;
    customHTML?: string;
  };

  // Advanced
  advanced: {
    customCSS?: string;
    customJS?: string;
    apiEndpoint?: string;
    rateLimit?: number;
    enableDebug: boolean;
  };
}

// Default Configuration
export const DEFAULT_CONFIG: BickfordUIConfig = {
  branding: {
    appName: "Bickford",
    tagline: "Intent to Reality Instantly",
    primaryColor: "#9333ea", // purple-600
    accentColor: "#ec4899", // pink-500
  },

  header: {
    show: true,
    title: "Bickford",
    subtitle: "Intent to Reality Instantly",
    showPoweredBy: true,
  },

  chat: {
    placeholder: "Describe your intention... (Press Enter to manifest)",
    welcomeMessage: "Welcome to Bickford. I transform your intentions into reality instantly. What would you like to manifest today?",
    buttonText: "Manifest",
    showTimestamps: true,
    maxMessageLength: 2000,
    enableVoice: false,
    enableFileUpload: false,
  },

  features: {
    enableOPTR: true,
    enableIntentToReality: true,
    enableIPProtection: true,
    showMetrics: true,
    showFormulaVersion: false, // Keep formula details private
  },

  privacy: {
    collectAnalytics: false,
    storeConversations: false,
    dataRetentionDays: 30,
    showPrivacyNotice: true,
    allowDataExport: true,
    allowDataDeletion: true,
    encryptData: true,
  },

  footer: {
    show: true,
    copyright: "© 2025 Bickford Technologies LLC. All Rights Reserved. Patent Pending.",
    links: [
      { text: "Privacy Policy", url: "/privacy-policy" },
      { text: "Terms of Service", url: "/terms" },
    ],
  },

  advanced: {
    enableDebug: false,
  },
};

// Configuration Management
export class ConfigManager {
  private static config: BickfordUIConfig = DEFAULT_CONFIG;

  static getConfig(): BickfordUIConfig {
    // Load from environment or database
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bickford-config');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.warn('Failed to parse config:', e);
        }
      }
    }
    return this.config;
  }

  static setConfig(config: Partial<BickfordUIConfig>) {
    this.config = { ...this.config, ...config };
    if (typeof window !== 'undefined') {
      localStorage.setItem('bickford-config', JSON.stringify(this.config));
    }
  }

  static resetConfig() {
    this.config = DEFAULT_CONFIG;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bickford-config');
    }
  }

  static validateConfig(config: Partial<BickfordUIConfig>): boolean {
    // Validate configuration
    if (config.privacy?.dataRetentionDays && config.privacy.dataRetentionDays < 1) {
      return false;
    }
    if (config.chat?.maxMessageLength && config.chat.maxMessageLength > 10000) {
      return false;
    }
    return true;
  }
}