# Implementation Plan

- [x] 1. Update translation files with new content
  - Add developer page translation keys (devHero, devFeatures, devPricing, devTimeline)
  - Update waitlist translation keys (remove offer fields, add audienceType fields)
  - Update offers translation keys to show single Checkout Booster offer
  - Apply changes to both en-EN.json and fr-FR.json
  - _Requirements: 1.1, 2.2, 3.2, 5.5_

- [x] 2. Update Waitlist component with audience segmentation
  - Remove offer selection dropdown field from form
  - Add audience segmentation field with two options: "Shopify Developer" and "Store/E-shop Owner"
  - Update WaitlistFormData interface to replace 'offer' with 'audienceType'
  - Add pageSource prop to component interface
  - Update form submission to include audienceType and pageSource
  - Maintain existing validation and error handling
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

- [ ] 2.1 Write property test for audience field presence
  - **Property 2: Audience segmentation field presence**
  - **Validates: Requirements 3.1, 3.2**

- [ ] 2.2 Write property test for form field persistence
  - **Property 4: Form field persistence**
  - **Validates: Requirements 7.4**

- [x] 3. Update server action for new form data structure
  - Update WaitlistFormData type to include audienceType and pageSource
  - Remove offer field from type definition
  - Update email template to display audienceType instead of offer
  - Add validation for audienceType enum values
  - Update email subject line to include audience type
  - _Requirements: 3.4, 7.1, 7.2_

- [ ] 3.1 Write property test for audience type validation
  - **Property 3: Audience type validation**
  - **Validates: Requirements 3.3, 7.1**

- [ ] 3.2 Write property test for data completeness
  - **Property 8: Form submission data completeness**
  - **Validates: Requirements 7.2**

- [x] 4. Update Offers component to display single offer
  - Modify offers array to contain only Checkout Booster
  - Update pricing to €2,990 (Phase 0: €1,990)
  - Remove Full Migration and SaaB offer cards
  - Update translation key references
  - Maintain existing card styling and layout
  - _Requirements: 1.2, 1.4, 5.2_

- [ ]* 4.1 Write property test for single offer display
  - **Property 1: Single offer display consistency**
  - **Validates: Requirements 1.2**

- [x] 5. Create developer landing page route
  - Create app/[locale]/developers/page.tsx file
  - Set up page structure with proper Next.js metadata
  - Import and render developer-specific components
  - Configure internationalization for developer page
  - _Requirements: 2.1_

- [x] 6. Create DevHero component
  - Create components/DevHero.tsx file
  - Implement technical value proposition headline
  - Add CTA buttons linking to waitlist section
  - Include code snippet or architecture visual
  - Style with developer-focused aesthetic
  - _Requirements: 2.2, 6.1_

- [x] 7. Create DevFeatures component
  - Create components/DevFeatures.tsx file
  - Implement 6-card feature grid (GitHub repo, documentation, templates, integrations, A/B testing, support)
  - Display technical deliverables with icons
  - Use translation keys for all content
  - Style consistently with main landing page
  - _Requirements: 2.2, 6.1, 6.2_

- [x] 8. Create DevPricing component
  - Create components/DevPricing.tsx file
  - Display regular price (€997) and pre-sale price (€497)
  - Show 50% discount badge
  - List included features (lifetime access, updates, support)
  - Add CTA button to waitlist section
  - _Requirements: 2.3, 6.3_

- [ ]* 8.1 Write property test for pricing calculation
  - **Property 7: Pricing display accuracy**
  - **Validates: Requirements 2.3**

- [x] 9. Create DevTimeline component
  - Create components/DevTimeline.tsx file
  - Display pre-sale timeline (11 December)
  - Display Product Hunt launch timeline (21 December)
  - Show key milestones and benefits for each phase
  - Style as visual timeline with dates
  - _Requirements: 2.2, 6.4_

- [x] 10. Update main landing page
  - Update app/[locale]/page.tsx to pass pageSource='main' to Waitlist
  - Verify all existing components render correctly
  - Ensure Offers component shows updated single offer
  - Test navigation to waitlist section
  - _Requirements: 4.1, 5.1, 5.4_

- [x] 11. Integrate Waitlist component on developer page
  - Add Waitlist component to developer page with pageSource='developers'
  - Configure variant prop for developer context
  - Ensure form styling matches developer page aesthetic
  - Test form submission from developer page
  - _Requirements: 2.5, 4.2, 4.3_

- [ ]* 11.1 Write property test for page source tracking
  - **Property 5: Page source tracking**
  - **Validates: Requirements 4.5**

- [x] 12. Implement mobile responsive styles
  - Ensure all new developer components are mobile-responsive
  - Verify form fields meet minimum tap target size (44x44px)
  - Test layout on viewport widths < 768px
  - Optimize images for mobile devices
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 12.1 Write property test for mobile tap targets
  - **Property 9: Mobile responsive rendering**
  - **Validates: Requirements 8.2**

- [x] 13. Add SEO metadata for developer page
  - Add page title: "Shopify Checkout Boilerplate - Production-Ready in 30 Minutes"
  - Add meta description focusing on technical benefits
  - Add relevant keywords for developer audience
  - Configure Open Graph tags for social sharing
  - _Requirements: 2.1_

- [ ]* 14. Write property test for translation consistency
  - **Property 10: Translation key consistency**
  - **Validates: Requirements 5.5**

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
