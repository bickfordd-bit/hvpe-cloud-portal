export class EnvironmentValidator {
  validate() {
    return { valid: true, errors: [], warnings: [] };
  }

  logResults() {
    return this.validate();
  }

  static getInstance() {
    return new EnvironmentValidator();
  }
}

export default EnvironmentValidator;

export function validateEnv(requiredVars: string[]): Record<string, string> {
  const env: Record<string, string> = {};
  for (const key of requiredVars) {
    const value = process.env?.[key];
    if (value) env[key] = value;
  }
  return env;
}
