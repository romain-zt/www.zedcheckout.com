import { FLAG_DEFAULTS, type FlagDefinitions } from './flags';
import type { FeatureFlagClient, FeatureFlagContext } from './client';

function toEnvVarName(flagName: string): string {
  return `FF_${flagName.toUpperCase()}`;
}

function parseEnvValue<K extends keyof FlagDefinitions>(
  flagName: K,
  raw: string,
): FlagDefinitions[K] {
  const defaultValue = FLAG_DEFAULTS[flagName];

  if (typeof defaultValue === 'boolean') {
    return (raw.toLowerCase() === 'true') as FlagDefinitions[K];
  }
  if (typeof defaultValue === 'number') {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      return parsed as FlagDefinitions[K];
    }
    return defaultValue;
  }
  return raw as FlagDefinitions[K];
}

export class StaticFeatureFlagClient implements FeatureFlagClient {
  private readonly overrides: Partial<FlagDefinitions>;

  constructor(overrides?: Partial<FlagDefinitions>) {
    this.overrides = overrides ?? {};
  }

  async evaluate<K extends keyof FlagDefinitions>(
    flagName: K,
    _context?: FeatureFlagContext,
  ): Promise<FlagDefinitions[K]> {
    if (flagName in this.overrides) {
      return this.overrides[flagName] as FlagDefinitions[K];
    }

    const envVar = toEnvVarName(flagName);
    const envValue = process.env[envVar];
    if (envValue !== undefined) {
      return parseEnvValue(flagName, envValue);
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
}
