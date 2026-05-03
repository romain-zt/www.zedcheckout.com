/**
 * Test double for @zedslot/ui.
 * Satisfies the dependency-isolation rule requirement.
 * UI components are inherently side-effect-free (pure render),
 * so the test double re-exports from the main package.
 */
export * from '../index.js';
