# Design Document

## Overview

This design implements a dual-landing-page architecture to serve two distinct audiences: SME store owners and Shopify developers. The main landing page (/) focuses exclusively on the Checkout Booster service offering, while a new developer landing page (/developers) targets technical buyers interested in the boilerplate product. Both pages share a unified waitlist form component with audience segmentation, replacing the previous offer-selection approach.

The architecture leverages Next.js 16 with App Router, next-intl for internationalization, and server actions for form processing. The design maintains the existing component structure while introducing new developer-focused components and updating the form data model.

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Main Landing    │         │   Developer      │          │
│  │  / (locale)      │         │   /developers    │          │
│  │                  │         │   (locale)       │          │
│  │  - Hero          │         │   - DevHero      │          │
│  │  - Choices       │         │   - DevFeatures  │          │
│  │  - Story         │         │   - DevPricing   │          │
│  │  - Process       │         │   - DevTimeline  │          │
│  │  - ROI Calc      │         │   - Waitlist     │          │
│  │  - Offers (1)    │         │   - Footer       │          │
│  │  - Waitlist      │         │                  │          │
│  │  - Footer        │         │                  │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        │                                     │
│                  ┌─────▼──────┐                              │
│                  │  Waitlist  │                              │
│                  │  Component │                              │
│                  │  (Shared)  │                              │
│                  └─────┬──────┘                              │
│                        │                                     │
│                  ┌─────▼──────┐                              │
│                  │   Server   │                              │
│                  │   Action   │                              │
│                  │ (waitlist) │                              │
│                  └─────┬──────┘                              │
│                        │                                     │
│                  ┌─────▼──────┐                              │
│                  │  Nodemailer│                              │
│                  │   (Email)  │                              │
│                  └────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

### Routing Structure

```
app/
├── [locale]/
│   ├── page.tsx              # Main landing (SME focus)
│   ├── developers/
│   │   └── page.tsx          # Developer landing
│   └── layout.tsx
├── actions/
│   └── waitlist.ts           # Updated server action
└── layout.tsx
```

### Component Organization

**Shared Components:**
- `Waitlist.tsx` - Updated with audience segmentation
- `Footer.tsx` - Unchanged

**Main Landing Components:**
- `Hero.tsx` - Unchanged
- `Choices.tsx` - Unchanged
- `Story.tsx` - Unchanged
- `Process.tsx` - Unchanged
- `ROICalculator.tsx` - Unchanged
- `Offers.tsx` - Modified to show single offer

**New Developer Components:**
- `DevHero.tsx` - Technical value proposition
- `DevFeatures.tsx` - Technical deliverables showcase
- `DevPricing.tsx` - Boilerplate pricing with pre-sale
- `DevTimeline.tsx` - Pre-sale and launch timeline

## Components and Interfaces

### Updated Waitlist Form Component

**File:** `components/Waitlist.tsx`

**Interface Changes:**

```typescript
// OLD
type WaitlistFormData = {
  name: string;
  email: string;
  phone: string;
  offer: string;  // REMOVED
};

// NEW
type WaitlistFormData = {
  name: string;
  email: string;
  phone: string;
  audienceType: 'developer' | 'store-owner';  // NEW
  pageSource?: string;  // NEW - tracks which page submitted
};
```

**Component Props:**

```typescript
interface WaitlistProps {
  variant?: 'sme' | 'developer';  // Determines messaging context
  pageSource: 'main' | 'developers';  // For analytics
}
```

**Key Changes:**
- Remove offer selection dropdown
- Add audience segmentation radio buttons or dropdown
- Pass pageSource to server action
- Maintain existing validation and error handling

### Updated Offers Component

**File:** `components/Offers.tsx`

**Changes:**
- Display only Checkout Booster offer
- Update pricing to €2,990 (€1,990 Phase 0)
- Remove Full Migration and SaaB cards
- Maintain existing styling and layout
- Update translation keys

### New Developer Hero Component

**File:** `components/DevHero.tsx`

**Purpose:** Technical value proposition for developers

**Key Elements:**
- Headline: Focus on time savings and code ownership
- Subheadline: Technical benefits (30min setup, full customization)
- CTA: "Get Pre-Sale Access" → #waitlist
- Visual: Code snippet or architecture diagram

**Translation Keys:**
```typescript
{
  "devHero": {
    "tag": "🚀 Developer Boilerplate · Production-Ready",
    "title": "Build Custom Shopify Checkouts in 30 Minutes",
    "subtitle": "Production-ready boilerplate with Stripe, A/B testing, and 4 design templates. Own the code. Ship faster.",
    "cta": "Join Pre-Sale (-50%)",
    "ctaSecondary": "View Documentation"
  }
}
```

### New Developer Features Component

**File:** `components/DevFeatures.tsx`

**Purpose:** Showcase technical deliverables

**Feature Grid:**
1. **GitHub Repository**
   - Private repo access
   - Clean, documented code
   - Regular updates

2. **Comprehensive Documentation**
   - 30-40 pages
   - Step-by-step setup
   - Deployment guides

3. **Design Templates**
   - 4 pre-built templates
   - Customizable themes
   - Responsive layouts

4. **Integrations**
   - Shopify bridge configured
   - Stripe setup included
   - Webhook automation

5. **A/B Testing System**
   - Google Optimize configured
   - Analytics tracking
   - Conversion goals

6. **Support & Community**
   - GitHub Discussions
   - Public async support
   - Community knowledge base

### New Developer Pricing Component

**File:** `components/DevPricing.tsx`

**Purpose:** Display boilerplate pricing with pre-sale offer

**Pricing Structure:**
```
┌─────────────────────────────────────┐
│         PRE-SALE PRICING            │
│                                     │
│  Regular Price: €997                │
│  Pre-Sale: €497 (-50%)              │
│                                     │
│  ✓ Limited to 50 spots              │
│  ✓ Lifetime access                  │
│  ✓ 6 months updates                 │
│  ✓ GitHub Discussions support       │
│                                     │
│  [Join Pre-Sale Waitlist →]        │
└─────────────────────────────────────┘
```

**Alternative Pricing (if €497 chosen):**
- Regular: €497
- Pre-Sale: €247 (-50%)

### New Developer Timeline Component

**File:** `components/DevTimeline.tsx`

**Purpose:** Show pre-sale and launch timeline

**Timeline Display:**
```
11 December → Pre-Sale Opens
  ├─ €497 early bird pricing
  ├─ Limited to 50 spots
  └─ Immediate repo access

21 December → Product Hunt Launch
  ├─ Public launch
  ├─ Regular pricing (€997)
  └─ Community showcase
```

## Data Models

### Waitlist Form Data

```typescript
interface WaitlistFormData {
  name: string;              // User's first name
  email: string;             // Valid email address
  phone: string;             // Phone number (international format)
  audienceType: 'developer' | 'store-owner';  // Audience segmentation
  pageSource: 'main' | 'developers';          // Submission source
  timestamp?: Date;          // Submission timestamp (server-side)
}
```

### Form Validation Rules

```typescript
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    required: true,
    minLength: 10,
    maxLength: 20
  },
  audienceType: {
    required: true,
    enum: ['developer', 'store-owner']
  }
};
```

### Email Template Data

```typescript
interface EmailTemplateData {
  name: string;
  email: string;
  phone: string;
  audienceType: string;
  pageSource: string;
  submittedAt: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single offer display consistency
*For any* render of the main landing page Offers component, the displayed offers array should contain exactly one offer with the title "Instant Checkout Booster"
**Validates: Requirements 1.2**

### Property 2: Audience segmentation field presence
*For any* render of the Waitlist component, the form should contain an audience segmentation field and should not contain an offer selection field
**Validates: Requirements 3.1, 3.2**

### Property 3: Audience type validation
*For any* form submission, if the audienceType field is not one of ['developer', 'store-owner'], the submission should be rejected with a validation error
**Validates: Requirements 3.3, 7.1**

### Property 4: Form field persistence
*For any* form submission that fails validation, all user-entered field values should be preserved in the form inputs
**Validates: Requirements 7.4**

### Property 5: Page source tracking
*For any* form submission from either landing page, the pageSource field should correctly identify the originating page ('main' or 'developers')
**Validates: Requirements 4.5**

### Property 6: Developer page routing
*For any* navigation to /developers or /[locale]/developers, the system should render the developer landing page with DevHero, DevFeatures, DevPricing, and DevTimeline components
**Validates: Requirements 2.1**

### Property 7: Pricing display accuracy
*For any* render of the developer pricing component, the displayed pre-sale price should be exactly 50% of the regular price
**Validates: Requirements 2.3**

### Property 8: Form submission data completeness
*For any* successful form submission, the transmitted data should include all required fields (name, email, phone, audienceType, pageSource) with non-empty values
**Validates: Requirements 7.2**

### Property 9: Mobile responsive rendering
*For any* viewport width less than 768px, all form fields should render with a minimum tap target size of 44x44 pixels
**Validates: Requirements 8.2**

### Property 10: Translation key consistency
*For any* supported locale, all translation keys referenced in components should exist in the corresponding messages file
**Validates: Requirements 5.5**

## Error Handling

### Form Validation Errors

**Client-Side Validation:**
- Empty required fields → Display inline error message
- Invalid email format → Display format hint
- Invalid phone format → Display format hint
- Missing audience selection → Highlight field with error state

**Error Message Display:**
```typescript
interface FieldError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length';
}
```

### Server Action Errors

**Network Errors:**
- Timeout → "Connection timeout. Please try again."
- No connection → "No internet connection. Please check your network."

**Email Delivery Errors:**
- SMTP failure → "Unable to send email. Please try again later."
- Authentication failure → Log error, show generic message to user

**Error Response Format:**
```typescript
interface ServerActionResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message: string;
  errors?: FieldError[];
}
```

### Graceful Degradation

**JavaScript Disabled:**
- Form should still submit via native HTML form submission
- Server-side validation should handle all cases
- Success/error messages should display via page reload

**Translation Missing:**
- Fall back to English (en-EN) if translation key not found
- Log missing keys for developer attention
- Never show raw translation keys to users

## Testing Strategy

### Unit Testing

**Framework:** Jest + React Testing Library

**Test Coverage:**

1. **Waitlist Component Tests**
   - Renders with correct fields (name, email, phone, audienceType)
   - Does not render offer selection field
   - Validates required fields on submit
   - Displays success message on successful submission
   - Displays error message on failed submission
   - Preserves form values on validation error

2. **Offers Component Tests**
   - Renders exactly one offer card
   - Displays correct pricing (€2,990 / €1,990)
   - Shows "Checkout Booster" title
   - Does not render SaaB or Full Migration cards

3. **Developer Components Tests**
   - DevHero renders with correct CTAs
   - DevFeatures displays all 6 feature cards
   - DevPricing shows correct pre-sale discount
   - DevTimeline displays timeline milestones

4. **Server Action Tests**
   - Validates all required fields
   - Rejects invalid email formats
   - Rejects invalid audience types
   - Sends email with correct template
   - Returns success response on successful send
   - Returns error response on failure

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:** Minimum 100 iterations per property test

**Property Tests:**

1. **Property 1: Single offer display**
   - Generate random component states
   - Verify offers array length === 1
   - Verify offer title === "Instant Checkout Booster"

2. **Property 2: Audience field presence**
   - Generate random form renders
   - Verify audienceType field exists
   - Verify offer field does not exist

3. **Property 3: Audience type validation**
   - Generate random strings (including invalid values)
   - Submit forms with generated audienceType values
   - Verify only 'developer' and 'store-owner' are accepted

4. **Property 4: Form field persistence**
   - Generate random valid form data
   - Trigger validation error (e.g., invalid email)
   - Verify all other fields retain their values

5. **Property 5: Page source tracking**
   - Generate random form submissions from both pages
   - Verify pageSource matches originating page

6. **Property 7: Pricing calculation**
   - Generate random regular prices
   - Verify pre-sale price === regular price * 0.5

7. **Property 8: Data completeness**
   - Generate random valid form submissions
   - Verify all required fields present in transmitted data

8. **Property 10: Translation consistency**
   - Generate list of all translation keys used in components
   - Verify each key exists in en-EN.json and fr-FR.json

### Integration Testing

**Test Scenarios:**

1. **End-to-End Form Submission (Main Page)**
   - Navigate to main landing page
   - Fill out waitlist form with "store-owner" selection
   - Submit form
   - Verify success message displays
   - Verify email sent with correct data

2. **End-to-End Form Submission (Developer Page)**
   - Navigate to /developers
   - Fill out waitlist form with "developer" selection
   - Submit form
   - Verify success message displays
   - Verify email sent with correct data and pageSource

3. **Mobile Responsive Flow**
   - Load pages on mobile viewport (375px width)
   - Verify all components render correctly
   - Verify form is usable and submittable
   - Verify tap targets meet minimum size

4. **Internationalization Flow**
   - Switch between English and French locales
   - Verify all content translates correctly
   - Verify form labels and messages translate
   - Verify form submission works in both locales

### Manual Testing Checklist

- [ ] Main landing page displays only Checkout Booster offer
- [ ] Developer landing page renders all new components
- [ ] Waitlist form shows audience segmentation field
- [ ] Waitlist form does not show offer selection field
- [ ] Form submission works from main page
- [ ] Form submission works from developer page
- [ ] Email includes correct audience type
- [ ] Email includes correct page source
- [ ] Mobile layout works on iOS Safari
- [ ] Mobile layout works on Android Chrome
- [ ] French translations display correctly
- [ ] English translations display correctly
- [ ] Form validation errors display inline
- [ ] Success message displays after submission
- [ ] Error message displays on failure

## Implementation Notes

### Translation File Updates

**New Keys Required:**

```json
{
  "devHero": { ... },
  "devFeatures": { ... },
  "devPricing": { ... },
  "devTimeline": { ... },
  "waitlist": {
    "audienceLabel": "Who describes you best?",
    "audienceOption1": "Shopify Developer",
    "audienceOption2": "Store/E-shop Owner",
    // Remove: offerLabel, offerPlaceholder, offerOption1-4
  }
}
```

### Styling Considerations

**Shared Styles:**
- Maintain existing color palette (#1E2A47, #FFC9B9, #F5EDE4)
- Use existing button styles
- Maintain consistent spacing and typography

**Developer Page Styles:**
- More technical, code-focused aesthetic
- Monospace fonts for code snippets
- Darker, more professional color scheme
- Maintain brand consistency

### Performance Optimization

**Image Optimization:**
- Use Next.js Image component for all images
- Provide appropriate width/height attributes
- Use placeholder blur for better UX

**Code Splitting:**
- Developer components only loaded on /developers route
- Lazy load ROI Calculator on main page
- Minimize initial bundle size

**Caching Strategy:**
- Static generation for both landing pages
- Revalidate on translation file changes
- Cache translation files at build time

### Accessibility

**WCAG 2.1 AA Compliance:**
- All form fields have associated labels
- Color contrast ratios meet minimum standards
- Keyboard navigation fully supported
- Screen reader announcements for form errors
- Focus indicators visible on all interactive elements

**ARIA Attributes:**
- `aria-required` on required form fields
- `aria-invalid` on fields with validation errors
- `aria-describedby` linking fields to error messages
- `role="alert"` on success/error message containers

### SEO Considerations

**Main Landing Page:**
- Title: "Checkout Booster - Double Your Conversions Without Shopify Plus"
- Description: Focus on SME benefits, conversion optimization
- Keywords: Shopify checkout, conversion optimization, SME e-commerce

**Developer Landing Page:**
- Title: "Shopify Checkout Boilerplate - Production-Ready in 30 Minutes"
- Description: Focus on technical benefits, time savings, code ownership
- Keywords: Shopify boilerplate, custom checkout, developer tools

**Structured Data:**
- Product schema for both offerings
- Organization schema for brand
- FAQ schema for common questions
