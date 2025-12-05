# Task 05: Update Waitlist Backend Action

## Objective
Update the server action to handle new qualification fields and flag non-qualified prospects in email notifications.

## File to Modify
- `app/actions/waitlist.ts`

## Dependencies
- Task 04 must be completed (Waitlist form updated)

## Type Updates

### Extend WaitlistFormData
```typescript
export type WaitlistFormData = {
  name: string;
  email: string;
  phone: string;
  audienceType: 'developer' | 'store-owner';
  pageSource: 'main' | 'developers';
  // NEW FIELDS
  annualRevenue: string;
  monthlyTraffic: string;
  isShopifyPlus: 'yes' | 'no';
  preferredOption: string;
};
```

## Email Template Updates

### Add Qualification Section
```html
<h3>📊 Qualification</h3>
<p><strong>CA annuel:</strong> ${annualRevenue}</p>
<p><strong>Trafic mensuel:</strong> ${monthlyTraffic}</p>
<p><strong>Shopify Plus:</strong> ${isShopifyPlus}</p>
<p><strong>Formule préférée:</strong> ${preferredOption}</p>
```

### Add Warning Flag
If prospect is non-qualified (CA < 50K OR traffic < 1K OR Shopify Plus = yes):
```html
<div style="background: #FEE2E2; padding: 16px; border-left: 4px solid #DC2626; margin: 20px 0;">
  <strong>⚠️ PROSPECT NON-QUALIFIÉ</strong>
  <ul>
    <!-- List specific disqualifying criteria -->
  </ul>
</div>
```

## Validation Logic

### Add Business Logic
```typescript
const isQualified = 
  !annualRevenue.includes('< 50K') &&
  !monthlyTraffic.includes('< 1,000') &&
  isShopifyPlus === 'no';
```

### Use in Email Subject
```typescript
subject: `[Waitlist] ${isQualified ? '✅ QUALIFIÉ' : '⚠️ NON-QUALIFIÉ'} - ${name}`
```

## Success Criteria
- [ ] Type updated with new fields
- [ ] Email includes all qualification data
- [ ] Non-qualified prospects flagged visually
- [ ] Email subject indicates qualification status
- [ ] No TypeScript errors
- [ ] Email sends successfully

