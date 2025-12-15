/**
 * BICK computation logic
 */

import { BickRequest, BickResponse, BickComponents, BickDelta } from './types';

/**
 * Validation error
 */
export class BickValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BickValidationError';
  }
}

/**
 * Validate BICK input parameters
 * @param input - Input to validate
 * @throws BickValidationError if validation fails
 */
export function validateBickInput(input: any): asserts input is BickRequest {
  // Check required fields exist
  if (typeof input.V !== 'number') {
    throw new BickValidationError('V (Value) is required and must be a number');
  }
  if (typeof input.T !== 'number') {
    throw new BickValidationError('T (Time) is required and must be a number');
  }
  if (typeof input.E !== 'number') {
    throw new BickValidationError('E (Efficiency) is required and must be a number');
  }
  if (typeof input.L !== 'number') {
    throw new BickValidationError('L (Leverage) is required and must be a number');
  }

  // Validate V and T must be > 0
  if (input.V <= 0) {
    throw new BickValidationError('V (Value) must be greater than 0');
  }
  if (input.T <= 0) {
    throw new BickValidationError('T (Time) must be greater than 0');
  }

  // Validate E and L must be between 0 and 1 (inclusive)
  if (input.E < 0 || input.E > 1) {
    throw new BickValidationError('E (Efficiency) must be between 0 and 1 (inclusive)');
  }
  if (input.L < 0 || input.L > 1) {
    throw new BickValidationError('L (Leverage) must be between 0 and 1 (inclusive)');
  }

  // Validate D if provided
  if (input.D !== undefined && typeof input.D !== 'number') {
    throw new BickValidationError('D (Dimension) must be a number if provided');
  }

  // Validate baseline if provided
  if (input.baseline !== undefined) {
    if (typeof input.baseline !== 'object' || input.baseline === null) {
      throw new BickValidationError('baseline must be an object if provided');
    }
    
    // Recursively validate baseline (without its own baseline)
    const baselineInput = { ...input.baseline };
    delete (baselineInput as any).baseline; // Remove nested baseline if any
    validateBickInput(baselineInput);
  }
}

/**
 * Compute BICK value
 * Formula: BICK = (V / T) * E * L
 * @param components - Input components
 * @returns BICK value
 */
export function computeBick(components: BickComponents): number {
  const { V, T, E, L } = components;
  return (V / T) * E * L;
}

/**
 * Process BICK computation request
 * @param input - BICK request
 * @returns BICK response with computation results
 */
export function processBickRequest(input: BickRequest): BickResponse {
  // Validate input
  validateBickInput(input);

  // Extract components
  const components: BickComponents = {
    V: input.V,
    T: input.T,
    E: input.E,
    L: input.L
  };
  
  if (input.D !== undefined) {
    components.D = input.D;
  }

  // Compute BICK
  const bick = computeBick(components);

  // Build response
  const response: BickResponse = {
    bick,
    components
  };

  // Compute delta if baseline provided
  if (input.baseline) {
    const baselineComponents: BickComponents = {
      V: input.baseline.V,
      T: input.baseline.T,
      E: input.baseline.E,
      L: input.baseline.L
    };
    
    if (input.baseline.D !== undefined) {
      baselineComponents.D = input.baseline.D;
    }

    const baselineBick = computeBick(baselineComponents);
    const deltaBick = bick - baselineBick;

    response.delta = {
      currentBick: bick,
      baselineBick,
      deltaBick,
      baselineComponents
    };
  }

  return response;
}
