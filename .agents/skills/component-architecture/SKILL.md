# Component Architecture

## When to Use

When creating new UI components, refactoring existing ones, or reviewing component structure. Use before building any component with more than basic markup.

## Prerequisites

- Target component or page identified
- Design system rule loaded (`.cursor/rules/core/design-system.mdc`)

## Principles

### File Organization
```
src/components/
├── brand/          # Logo, branding elements
├── ui/             # Shadcn/Radix primitives (Button, Input, Sheet)
├── layout/         # App shell (Sidebar, MobileNav, LayoutWrapper)
├── forms/          # Domain form components (MirrorWizard, DreamForm)
├── entries/        # Entry display components
├── capture/        # Capture flow components
├── auth/           # Auth-related components
└── [domain]/       # New domain-specific components
```

### Component Size Limits
- **Max 200 lines** per component file. If larger, extract sub-components.
- **Max 3 levels** of nesting in JSX. Beyond that, extract.
- **One concern per file.** Display + logic coupling = extract a hook.

### Composition Over Configuration
```tsx
// Good: composable
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>

// Bad: prop-driven kitchen sink
<Card title="..." subtitle="..." icon="..." variant="..." />
```

### State Boundaries
- **Local state** for UI-only concerns (open/closed, hover, animation)
- **Server state** via server actions + `revalidatePath` (data mutations)
- **URL state** for shareable/bookmarkable state (filters, tabs, dates)
- Never prop-drill more than 2 levels — use composition or context

### Mobile-First Responsive
```tsx
// Always start mobile, add breakpoints up
<div className="p-4 sm:p-6 md:p-8">
  <h1 className="text-2xl sm:text-3xl md:text-4xl">...</h1>
</div>
```

## Steps

1. **Identify the concern** — what does this component do? One sentence.
2. **Choose the directory** — where does it live in the tree?
3. **Define the interface** — props type, no more than 5 required props.
4. **Build mobile-first** — start at 320px, add responsive breakpoints.
5. **Extract early** — if a section grows past 50 lines, it's a sub-component.

## Validation

- Component renders correctly at 320px, 768px, 1440px
- No prop with more than 2 levels of drilling
- File is under 200 lines
- Uses semantic HTML and design system tokens

## Related

- Rule: `.cursor/rules/core/design-system.mdc`
- Rule: `.cursor/rules/core/quality.mdc`
