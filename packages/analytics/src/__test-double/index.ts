import type { AnalyticsClient } from '../client.js';
import type { AnalyticsEvent } from '../events.js';

export class InMemoryAnalyticsClient implements AnalyticsClient {
  readonly events: AnalyticsEvent[] = [];
  readonly identifications: Array<{ distinctId: string; properties?: Record<string, unknown> }> = [];
  private _resetCount = 0;

  capture(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  identify(distinctId: string, properties?: Record<string, unknown>): void {
    this.identifications.push({ distinctId, properties });
  }

  reset(): void {
    this._resetCount++;
  }

  async flush(): Promise<void> {
    // no-op for tests
  }

  get resetCount(): number {
    return this._resetCount;
  }

  findEvents<T extends string>(name: T): AnalyticsEvent<T>[] {
    return this.events.filter((e) => e.name === name) as AnalyticsEvent<T>[];
  }

  clear(): void {
    this.events.length = 0;
    this.identifications.length = 0;
    this._resetCount = 0;
  }
}
