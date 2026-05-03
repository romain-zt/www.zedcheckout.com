import type { PostHog } from 'posthog-js';
import type { AnalyticsEvent } from './events.js';

export interface AnalyticsClientOptions {
  autocapture?: boolean;
  persistence?: 'localStorage' | 'sessionStorage' | 'memory';
}

export interface AnalyticsClient {
  capture(event: AnalyticsEvent): void;
  identify(distinctId: string, properties?: Record<string, unknown>): void;
  reset(): void;
  flush(): Promise<void>;
}

export class PostHogAnalyticsClient implements AnalyticsClient {
  private readonly posthog: PostHog;

  constructor(posthog: PostHog) {
    this.posthog = posthog;
  }

  capture(event: AnalyticsEvent): void {
    this.posthog.capture(event.name, {
      ...event.properties,
      ...(event.timestamp ? { timestamp: event.timestamp.toISOString() } : {}),
    });
  }

  identify(distinctId: string, properties?: Record<string, unknown>): void {
    this.posthog.identify(distinctId, properties);
  }

  reset(): void {
    this.posthog.reset();
  }

  async flush(): Promise<void> {
    // posthog-js batches and sends automatically; this is a no-op in browser
  }
}

export async function createAnalyticsClient(
  apiKey: string,
  options?: AnalyticsClientOptions,
): Promise<AnalyticsClient> {
  const posthogJs = await import('posthog-js');
  const posthog = posthogJs.default;

  posthog.init(apiKey, {
    autocapture: options?.autocapture ?? false,
    persistence: options?.persistence ?? 'localStorage',
  });

  return new PostHogAnalyticsClient(posthog);
}
