import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FLAG_DEFAULTS, type FlagDefinitions } from '../src/flags';
import { StaticFeatureFlagClient } from '../src/static';
import { InMemoryFeatureFlagClient } from '../src/__test-double/index';

describe('StaticFeatureFlagClient', () => {
  const savedEnv: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    Object.keys(savedEnv).forEach((k) => delete savedEnv[k]);
  });

  function setEnv(key: string, value: string) {
    savedEnv[key] = process.env[key];
    process.env[key] = value;
  }

  it('returns defaults when no overrides provided', async () => {
    const client = new StaticFeatureFlagClient();

    for (const [key, defaultValue] of Object.entries(FLAG_DEFAULTS)) {
      const value = await client.evaluate(key as keyof FlagDefinitions);
      expect(value).toBe(defaultValue);
    }
  });

  it('respects constructor overrides', async () => {
    const client = new StaticFeatureFlagClient({
      checkout_variant: 'experimental',
      pack_redemption_enabled: false,
      notifications_email_reminder_hours: 48,
    });

    expect(await client.evaluate('checkout_variant')).toBe('experimental');
    expect(await client.evaluate('pack_redemption_enabled')).toBe(false);
    expect(await client.evaluate('notifications_email_reminder_hours')).toBe(48);
    expect(await client.evaluate('language_default')).toBe('fr');
  });

  it('parses boolean env var overrides', async () => {
    setEnv('FF_PACK_REDEMPTION_ENABLED', 'false');
    const client = new StaticFeatureFlagClient();
    expect(await client.evaluate('pack_redemption_enabled')).toBe(false);
  });

  it('parses numeric env var overrides', async () => {
    setEnv('FF_NOTIFICATIONS_EMAIL_REMINDER_HOURS', '12');
    const client = new StaticFeatureFlagClient();
    expect(await client.evaluate('notifications_email_reminder_hours')).toBe(12);
  });

  it('parses string enum env var overrides', async () => {
    setEnv('FF_CHECKOUT_VARIANT', 'experimental');
    const client = new StaticFeatureFlagClient();
    expect(await client.evaluate('checkout_variant')).toBe('experimental');
  });

  it('constructor overrides take precedence over env vars', async () => {
    setEnv('FF_CHECKOUT_VARIANT', 'experimental');
    const client = new StaticFeatureFlagClient({ checkout_variant: 'classic' });
    expect(await client.evaluate('checkout_variant')).toBe('classic');
  });

  it('evaluateAll returns all flag values', async () => {
    const client = new StaticFeatureFlagClient({ checkout_variant: 'experimental' });
    const all = await client.evaluateAll();

    expect(all.checkout_variant).toBe('experimental');
    expect(all.payment_method_order).toBe('card_first');
    expect(all.pack_redemption_enabled).toBe(true);
    expect(all.customer_account_auth_provider).toBe('magic_link_email');
    expect(all.language_default).toBe('fr');
    expect(all.experimental_room_only_renting).toBe(false);
    expect(all.notifications_email_reminder_hours).toBe(24);
  });
});

describe('InMemoryFeatureFlagClient', () => {
  let client: InMemoryFeatureFlagClient;

  beforeEach(() => {
    client = new InMemoryFeatureFlagClient();
  });

  it('returns defaults for unset flags', async () => {
    for (const [key, defaultValue] of Object.entries(FLAG_DEFAULTS)) {
      const value = await client.evaluate(key as keyof FlagDefinitions);
      expect(value).toBe(defaultValue);
    }
  });

  it('returns override after setFlag', async () => {
    client.setFlag('checkout_variant', 'experimental');
    expect(await client.evaluate('checkout_variant')).toBe('experimental');

    client.setFlag('notifications_email_reminder_hours', 2);
    expect(await client.evaluate('notifications_email_reminder_hours')).toBe(2);

    client.setFlag('pack_redemption_enabled', false);
    expect(await client.evaluate('pack_redemption_enabled')).toBe(false);
  });

  it('reset clears all overrides', async () => {
    client.setFlag('checkout_variant', 'experimental');
    client.setFlag('pack_redemption_enabled', false);

    client.reset();

    expect(await client.evaluate('checkout_variant')).toBe('classic');
    expect(await client.evaluate('pack_redemption_enabled')).toBe(true);
  });

  it('evaluateAll returns all flag values with overrides', async () => {
    client.setFlag('language_default', 'en');
    client.setFlag('experimental_room_only_renting', true);

    const all = await client.evaluateAll();

    expect(all.language_default).toBe('en');
    expect(all.experimental_room_only_renting).toBe(true);
    expect(all.checkout_variant).toBe('classic');
    expect(all.payment_method_order).toBe('card_first');
    expect(all.notifications_email_reminder_hours).toBe(24);
  });
});

describe('Type safety', () => {
  it('flag defaults match FlagDefinitions type', () => {
    const defaults: FlagDefinitions = FLAG_DEFAULTS;
    expect(defaults).toBeDefined();
  });

  it('InMemoryFeatureFlagClient enforces typed setFlag', () => {
    const client = new InMemoryFeatureFlagClient();
    client.setFlag('checkout_variant', 'experimental');
    client.setFlag('pack_redemption_enabled', true);
    client.setFlag('notifications_email_reminder_hours', 12);
    expect(true).toBe(true);
  });
});
