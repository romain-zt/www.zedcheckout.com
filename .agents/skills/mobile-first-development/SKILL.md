# Mobile-First Development

## When to Use

When building any UI component or page. This skill enforces the mobile-first development workflow.

## Prerequisites

- Component or page to build/modify identified
- Design system rule loaded

## The Process

### 1. Start at 320px
Every component begins at the smallest breakpoint. No desktop-first.

```tsx
// CORRECT: mobile base, scale up
<div className="p-4 sm:p-6 md:p-8">
  <h1 className="text-2xl sm:text-3xl md:text-4xl">Title</h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

```tsx
// WRONG: desktop base, scale down
<div className="p-8 md:p-6 sm:p-4">
  <h1 className="text-4xl md:text-3xl sm:text-2xl">Title</h1>
```

### 2. Breakpoints
| Name | Width | Target |
|------|-------|--------|
| Base | 0-639px | Phone (portrait) |
| `sm` | 640px+ | Phone (landscape), small tablet |
| `md` | 768px+ | Tablet, small desktop |
| `lg` | 1024px+ | Desktop |
| `xl` | 1280px+ | Wide desktop |

### 3. Touch Targets
- Minimum 44x44px for all interactive elements
- Use `min-h-[44px] min-w-[44px]` or `touch-target` utility
- Spacing between targets: at least 8px

### 4. Safe Areas
- `safe-top` on fixed headers
- `safe-x` on full-width fixed elements
- Bottom nav: `paddingBottom: var(--safe-pad-bottom)`

### 5. Typography
- Base font size: 16px (browser default) — never smaller for body text
- Labels/meta: `text-xs` (12px) minimum
- Headings scale: `text-xl` → `sm:text-2xl` → `md:text-3xl`

### 6. Testing Checklist
- [ ] Renders at 320px without horizontal scroll
- [ ] Renders at 375px (iPhone SE)
- [ ] Renders at 768px (iPad)
- [ ] Renders at 1024px (desktop)
- [ ] Renders at 1440px (wide desktop)
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable without zooming

## Validation

- No `hidden` class without a corresponding breakpoint `block`
- No fixed pixel widths on containers (use max-w-* or %)
- Grid columns reduce at smaller breakpoints
- Font sizes increase with breakpoints, never decrease

## Related

- Rule: `.cursor/rules/core/design-system.mdc`
- Rule: `.cursor/rules/core/quality.mdc`
