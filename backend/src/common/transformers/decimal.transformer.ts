import { ValueTransformer } from 'typeorm';

/** Converts PostgreSQL decimal strings to JS numbers transparently */
export class DecimalColumnTransformer implements ValueTransformer {
  to(value: number): number {
    return value;
  }

  from(value: string): number {
    return parseFloat(value);
  }
}
