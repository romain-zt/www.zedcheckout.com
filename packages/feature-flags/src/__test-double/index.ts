import { FLAG_DEFAULTS, type FlagDefinitions } from '../flags';
import type { FeatureFlagClient, FeatureFlagContext } from '../client';

export class InMemoryFeatureFlagClient implements FeatureFlagClient {
  private readonly flags = new Map<keyof FlagDefinitions, FlagDefinitions[keyof FlagDefinitions]>();

  setFlag<K extends keyof FlagDefinitions>(name: K, value: FlagDefinitions[K]): void {
    this.flags.set(name, value);
  }

  async evaluate<K extends keyof FlagDefinitions>(
    flagName: K,
    _context?: FeatureFlagContext,
  ): Promise<FlagDefinitions[K]> {
    if (this.flags.has(flagName)) {
      return this.flags.get(flagName) as FlagDefinitions[K];
    }
    return FLAG_DEFAULTS[flagName];
  }

  async evaluateAll(_context?: FeatureFlagContext): Promise<FlagDefinitions> {
    const result = { ...FLAG_DEFAULTS };
    const keys = Object.keys(FLAG_DEFAULTS) as Array<keyof FlagDefinitions>;
    for (const key of keys) {
      (result as Record<string, unknown>)[key] = await this.evaluate(key);
    }
    return result;
  }

  reset(): void {
    this.flags.clear();
  }
}
