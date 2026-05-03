---
description: Audit UI/UX quality of a component, page, or PR. Checks design system compliance.
---

# /design-review

Audit UI components or pages for design system compliance, accessibility, and mobile-first quality.

## Instructions

1. **Load rules:** `.cursor/rules/core/design-system.mdc` and `.cursor/rules/core/animation.mdc`.
2. Identify the target: component file, page, or set of files.
3. Run the audit checklist:

### Visual Consistency
- [ ] Uses semantic color tokens (primary/accent/oneiric), not raw values
- [ ] Typography follows the scale (no custom font sizes)
- [ ] Spacing follows the system (p-4/p-6 cards, gap-3/4/6)
- [ ] Cards use standard pattern (`rounded-xl bg-slate-800/20 border border-slate-700/30`)

### Mobile-First
- [ ] Layout works at 320px width
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable without zooming (min 14px / text-sm)
- [ ] No horizontal scroll at any breakpoint

### Accessibility
- [ ] Semantic HTML (nav, main, section, button vs div)
- [ ] ARIA labels on icon-only buttons
- [ ] Color contrast meets WCAG AA
- [ ] Focus states visible

### Safe Areas
- [ ] Fixed/absolute elements use `safe-top` / `safe-x` where needed
- [ ] Bottom-fixed elements account for `--safe-pad-bottom`

### Animation
- [ ] CSS-only (no JS animation libs)
- [ ] Interaction feedback ≤300ms
- [ ] Entrance animations ≤600ms
- [ ] Ambient animations ≥4s loop

4. Label findings: `[blocking]`, `[nit]`, `[question]`
5. For each finding: cite file + line, explain the issue, propose a fix.

## Output

A structured audit report with pass/fail per category and actionable findings.
