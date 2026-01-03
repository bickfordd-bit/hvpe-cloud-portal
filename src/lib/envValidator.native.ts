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

