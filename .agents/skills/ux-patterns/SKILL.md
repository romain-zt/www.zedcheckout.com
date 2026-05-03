# UX Patterns

## When to Use

When designing user flows, onboarding experiences, form interactions, or any user-facing feature. Load before making UX decisions.

## Prerequisites

- Feature or flow identified
- Target user and context understood

## Core Patterns for Oneiria

### Progressive Disclosure
Reveal complexity gradually. Start simple, add depth as user engages.
- Onboarding: 4-5 short steps, not one long form
- Settings: show essential options, hide advanced behind "More"
- Analysis: summary first, details on tap

### Micro-Interactions
Small feedback that makes the app feel alive:
- Character count appearing as user types
- Toggle animations (slide, not jump)
- Button press feedback (scale-98, not color change alone)
- Progress indicators that animate smoothly

### Breathing Room
The app's tone is contemplative, not urgent:
- Generous whitespace between sections
- Slow ambient animations (4s+ breathing loops)
- Delayed CTAs on final steps (let user absorb before acting)
- No countdown timers or urgency language

### Mirror Tone
Oneiria reflects, never directs:
- "Il semble que..." not "Tu dois..."
- Questions over directives
- Observations over prescriptions
- Neutral language for all feedback

### Safe Area Awareness
Every fixed/absolute element must clear device notches:
- `safe-top` on fixed headers and overlay tops
- `safe-x` on full-width fixed elements
- `safe-bottom` or `--safe-pad-bottom` on bottom nav/sheets
- Test with `env(safe-area-inset-*)` mentally or on device

## Steps

1. **Map the flow** — what steps does the user take? Draw the sequence.
2. **Identify friction** — where might the user hesitate, get confused, or quit?
3. **Apply patterns** — which of the above patterns reduce friction?
4. **Prototype mobile-first** — does it work on a 375px screen with one thumb?
5. **Test edge states** — empty, loading, error, success. All four.

## Validation

- Flow completable in under 3 minutes (for daily use flows)
- No dead ends (every state has a clear next action)
- Works at 320px without horizontal scroll
- Respects mirror tone (no directive language)

## Related

- Rule: `.cursor/rules/core/design-system.mdc`
- Skill: `component-architecture`
