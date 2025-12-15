/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

import { logger } from './logger';

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
  default?: string;
}

const envVars: EnvConfig[] = [
  // Critical
  {
    name: 'OPENAI_API_KEY',
    required: false, // Either this or HVPE_OPENAI_API_KEY
    description: 'OpenAI API key for AI features'
  },
  {
    name: 'HVPE_OPENAI_API_KEY',
    required: false,
    description: 'Preferred OpenAI API key alias'
  },

  // Instance metadata (optional)
  {
    name: 'INSTANCE_OWNER',
    required: false,
    description: 'Instance owner flag for feature gating (e.g., derek)'
  },

  // External data (optional)
  {
    name: 'SAM_API_KEY',
    required: false,
    description: 'SAM.gov API key for opportunity ingestion'
  },
  
  // Optional but recommended
  {
    name: 'DATABASE_URL',
    required: false,
    description: 'PostgreSQL connection string (optional, enables persistence)'
  },
  {
    name: 'OPTR_PASSCODE',
    required: false,
    description: 'Login passcode',
    default: 'billionaire'
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Environment mode',
    default: 'development'
  },
  
  // Stripe (optional)
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret key for payments'
  },
  
  // Communication (optional)
  {
    name: 'TWILIO_ACCOUNT_SID',
    required: false,
    description: 'Twilio account SID for SMS'
  },
  
  // Admin (recommended)
  {
    name: 'ADMIN_DASH_TOKEN',
    required: false,
    description: 'Admin dashboard authentication token'
  },
  
  // OPTR Trading (optional)
  {
    name: 'OPTR_ADMIN_KEY',
    required: false,
    description: 'Admin key for OPTR trade trigger API'
  },
  {
    name: 'OPTR_WORKER_URL',
    required: false,
    description: 'URL of OPTR execution worker (e.g., http://localhost:8787)'
  }
];

export class EnvironmentValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    // Check if at least one OpenAI key is present
    const hasOpenAIKey = process.env.OPENAI_API_KEY || process.env.HVPE_OPENAI_API_KEY;
    if (!hasOpenAIKey) {
      this.warnings.push(
        'No OpenAI API key configured. AI features will not work. ' +
        'Set OPENAI_API_KEY or HVPE_OPENAI_API_KEY in .env.local'
      );
    }

    // Check optional vars
    for (const config of envVars) {
      const value = process.env[config.name];
      
      if (config.required && !value) {
        this.errors.push(
          `Missing required environment variable: ${config.name}. ` +
          `Description: ${config.description}`
        );
      } else if (!value && config.default) {
        logger.info(`Using default value for ${config.name}`, { default: config.default });
      }
    }

    // Database warning
    if (!process.env.DATABASE_URL) {
      this.warnings.push(
        'DATABASE_URL not set. Running without database persistence. ' +
        'Core features will work, but data will be lost on restart.'
      );
    }

    // Admin security warning
    if (!process.env.ADMIN_DASH_TOKEN && process.env.NODE_ENV === 'production') {
      this.warnings.push(
        'ADMIN_DASH_TOKEN not set in production. Admin features are not secured!'
      );
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  logResults() {
    const result = this.validate();

    if (result.errors.length > 0) {
      logger.error('Environment validation failed', undefined, {
        errors: result.errors
      });
      
      console.error('\n❌ ENVIRONMENT VALIDATION ERRORS:\n');
      result.errors.forEach(err => console.error(`  - ${err}`));
      console.error('\n');
    }

    if (result.warnings.length > 0) {
      logger.warn('Environment validation warnings', {
        warnings: result.warnings
      });
      
      console.warn('\n⚠️  ENVIRONMENT WARNINGS:\n');
      result.warnings.forEach(warn => console.warn(`  - ${warn}`));
      console.warn('\n');
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      logger.info('Environment validation passed');
      console.log('✅ Environment configuration valid\n');
    }

    return result;
  }

  static getInstance() {
    return new EnvironmentValidator();
  }
}

// Run validation on module load (server-side only)
if (typeof window === 'undefined') {
  const validator = EnvironmentValidator.getInstance();
  validator.logResults();
}

export default EnvironmentValidator;

export function validateEnv(requiredVars: string[]): Record<string, string> {
  const missing: string[] = [];
  const env: Record<string, string> = {};

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else {
      env[varName] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.\n' +
      'See README.md for required environment variables.'
    );
  }

  return env;
}
