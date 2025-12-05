# Requirements Document

## Introduction

This specification defines the business pivot for the landing page system, transforming from a multi-offer approach to a focused dual-audience strategy. The system will serve two distinct audiences: (1) SME store owners seeking a Checkout Booster service, and (2) Shopify developers seeking a technical boilerplate product. The pivot simplifies the value proposition, removes unnecessary form fields, and creates clear pathways for each audience segment.

## Glossary

- **Checkout Booster**: A service offering that provides SMEs with an optimized custom checkout solution integrated with their existing Shopify store
- **Developer Boilerplate**: A technical product (code repository and documentation) that enables Shopify developers to build custom checkout solutions
- **Phase 0**: The initial waitlist period offering early-bird discounts to validate market demand
- **Pre-sale**: An advance purchase period for the Developer Boilerplate before the official Product Hunt launch
- **SME**: Small and Medium Enterprise, specifically e-commerce businesses with €50K-300K annual revenue
- **Waitlist Form**: A lead capture form that collects user information and segments them by audience type
- **Main Landing Page**: The primary landing page targeting SME store owners (/)
- **Developer Landing Page**: The secondary landing page targeting Shopify developers (/developers)
- **Audience Segmentation Field**: A form field that identifies whether the user is a developer or store owner

## Requirements

### Requirement 1

**User Story:** As an SME store owner, I want to see a focused value proposition for Checkout Booster, so that I can quickly understand if this solution fits my needs without being confused by multiple offers.

#### Acceptance Criteria

1. WHEN a user visits the main landing page THEN the system SHALL display only the Checkout Booster offer (€2,990, Phase 0: €1,990)
2. WHEN the offers section renders THEN the system SHALL remove all references to SaaB and Full Migration offers
3. WHEN the hero section displays THEN the system SHALL present a clear value proposition focused on checkout optimization for SMEs
4. WHEN pricing information is shown THEN the system SHALL display the single price point with Phase 0 discount clearly indicated
5. WHEN a user scrolls through the page THEN the system SHALL maintain consistent messaging about the single Checkout Booster offer

### Requirement 2

**User Story:** As a Shopify developer, I want to access a dedicated landing page that speaks to my technical needs, so that I can evaluate the boilerplate product without wading through SME-focused marketing content.

#### Acceptance Criteria

1. WHEN a user navigates to /developers THEN the system SHALL display a developer-focused landing page
2. WHEN the developer landing page renders THEN the system SHALL present technical value propositions (code ownership, documentation, setup time)
3. WHEN pricing is displayed on the developer page THEN the system SHALL show the boilerplate pricing (€997 public, €497 pre-sale)
4. WHEN feature lists are shown THEN the system SHALL highlight technical benefits (GitHub repo, 30-page documentation, template designs, automated setup)
5. WHEN the developer page loads THEN the system SHALL include a waitlist form specific to developer pre-sales

### Requirement 3

**User Story:** As a user filling out the waitlist form, I want to identify myself as either a developer or store owner, so that I receive relevant follow-up communication tailored to my needs.

#### Acceptance Criteria

1. WHEN the waitlist form renders THEN the system SHALL remove the "offer selection" dropdown field
2. WHEN the waitlist form displays THEN the system SHALL include an audience segmentation field asking "Who describes you best?"
3. WHEN the audience segmentation field is shown THEN the system SHALL provide exactly two options: "Shopify Developer" and "Store/E-shop Owner"
4. WHEN a user submits the form THEN the system SHALL capture the audience type selection along with name, email, and phone
5. WHEN form validation occurs THEN the system SHALL require the audience segmentation field to be completed

### Requirement 4

**User Story:** As a marketing manager, I want the waitlist form to be consistent across both landing pages, so that I can segment leads effectively regardless of which page they entered from.

#### Acceptance Criteria

1. WHEN the waitlist form is rendered on the main landing page THEN the system SHALL display the same form structure as the developer landing page
2. WHEN the waitlist form is rendered on the developer landing page THEN the system SHALL display the same form structure as the main landing page
3. WHEN form submissions are processed THEN the system SHALL store audience segmentation data in the same format for both pages
4. WHEN a user completes the form on either page THEN the system SHALL provide identical success confirmation messaging
5. WHEN form data is transmitted THEN the system SHALL include a page source identifier to track which landing page generated the lead

### Requirement 5

**User Story:** As a content manager, I want the main landing page to maintain the existing waitlist and core components, so that we preserve proven conversion elements while simplifying the offer structure.

#### Acceptance Criteria

1. WHEN the main landing page renders THEN the system SHALL retain the Hero, Story, Process, ROI Calculator, and Waitlist components
2. WHEN the Offers component displays THEN the system SHALL show only the Checkout Booster offer with updated pricing
3. WHEN the Choices component renders THEN the system SHALL maintain the three-option comparison (do nothing, Shopify Plus, extract checkout)
4. WHEN the page structure is evaluated THEN the system SHALL preserve the existing component order and layout
5. WHEN translations are applied THEN the system SHALL support both English and French for all updated content

### Requirement 6

**User Story:** As a developer evaluating the boilerplate, I want to see concrete technical details and deliverables, so that I can assess whether the product meets my technical requirements.

#### Acceptance Criteria

1. WHEN the developer landing page displays features THEN the system SHALL list specific technical deliverables (GitHub repo access, documentation pages, template count, setup time)
2. WHEN technical specifications are shown THEN the system SHALL include information about Shopify integration, Stripe configuration, and deployment options
3. WHEN the value proposition is presented THEN the system SHALL emphasize code ownership and customization capabilities
4. WHEN support information is displayed THEN the system SHALL reference GitHub Discussions for public asynchronous support
5. WHEN the pre-sale offer is shown THEN the system SHALL clearly indicate the discount percentage and limited availability

### Requirement 7

**User Story:** As a system administrator, I want form submissions to be processed and stored correctly with the new audience segmentation field, so that the sales team can follow up appropriately with each lead type.

#### Acceptance Criteria

1. WHEN a form submission is received THEN the system SHALL validate that the audience segmentation field contains a valid value
2. WHEN form data is processed THEN the system SHALL store the audience type alongside existing fields (name, email, phone)
3. WHEN a submission succeeds THEN the system SHALL return a success message to the user
4. WHEN a submission fails THEN the system SHALL return an error message and preserve the user's form input
5. WHEN form data is transmitted to the backend THEN the system SHALL include all required fields in the correct format

### Requirement 8

**User Story:** As a user on mobile devices, I want both landing pages to be fully responsive and accessible, so that I can evaluate the offers and submit the waitlist form regardless of my device.

#### Acceptance Criteria

1. WHEN either landing page is viewed on mobile devices THEN the system SHALL render all content in a mobile-optimized layout
2. WHEN the waitlist form is displayed on mobile THEN the system SHALL ensure all form fields are easily tappable and readable
3. WHEN images and graphics are loaded THEN the system SHALL optimize them for the user's viewport size
4. WHEN navigation occurs on mobile THEN the system SHALL provide smooth scrolling to anchor sections
5. WHEN forms are submitted on mobile THEN the system SHALL provide clear visual feedback during the submission process
