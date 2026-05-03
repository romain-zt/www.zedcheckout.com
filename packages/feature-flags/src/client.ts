import type { PostHog } from 'posthog-node';
import { FLAG_DEFAULTS, type FlagDefinitions } from './flags';

export interface FeatureFlagContext {
  tenantId?: string;
  userId?: string;
}

export interface FeatureFlagClient {
  evaluate<K extends keyof FlagDefinitions>(
    flagName: K,
    context?: FeatureFlagContext,
  ): Promise<FlagDefinitions[K]>;

  evaluateAll(context?: FeatureFlagContext): Promise<FlagDefinitions>;
}

export class PostHogFeatureFlagClient implements FeatureFlagClient {
  private readonly posthog: PostHog;

  constructor(posthog: PostHog) {
    this.posthog = posthog;
  }

  async evaluate<K extends keyof FlagDefinitions>(
    flagName: K,
    context?: FeatureFlagContext,
  ): Promise<FlagDefinitions[K]> {
    const distinctId = context?.userId ?? 'anonymous';
    const groups = context?.tenantId ? { tenant: context.tenantId } : undefined;

    const value = await this.posthog.getFeatureFlag(flagName, distinctId, {
      groups,
    });

    if (value === null || value === undefined) {
      return FLAG_DEFAULTS[flagName];
    }

    return value as FlagDefinitions[K];
  }

  async evaluateAll(context?: FeatureFlagContext): Promise<FlagDefinitions> {
    const result = { ...FLAG_DEFAULTS };
    const keys = Object.keys(FLAG_DEFAULTS) as Array<keyof FlagDefinitions>;
    for (const key of keys) {
      (result as Record<string, unknown>)[key] = await this.evaluate(key, context);
    }
    return result;
  }
}

export async function createFeatureFlagClient(
  apiKey: string,
  options?: { host?: string },
): Promise<FeatureFlagClient> {
  const { PostHog: PostHogClass } = await import('posthog-node');
  const posthog = new PostHogClass(apiKey, { host: options?.host });
  return new PostHogFeatureFlagClient(posthog);
}
