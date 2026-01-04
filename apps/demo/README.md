# Invoice Line Item Component

A reusable React component for handling VAT calculations in invoice line items.

## How the Component Works

The `LineItem` component manages three related values:

- **Net amount** (without VAT)
- **Gross amount** (with VAT)
- **VAT rate** (percentage)

When a user edits one value, the component automatically recalculates the other using precise decimal math.

### Core Behavior

| User Action           | Result                                         |
| --------------------- | ---------------------------------------------- |
| Edit **net** → blur   | Gross is recalculated from net                 |
| Edit **gross** → blur | Net is recalculated from gross                 |
| Change **VAT rate**   | Gross is recalculated from net (if net exists) |
| Clear field → blur    | Both fields are cleared                        |

### VAT Rate Change Strategy

**Net is always the source of truth.** When the VAT rate changes, gross is recalculated from net. This ensures:

- Predictable behavior (no hidden state)
- B2B invoicing workflows (net price is primary)
- Stable base prices when tax rates change

## Parent-Child Communication

The component uses a **controlled with optimistic state** pattern:

```tsx
<LineItem
  value={{ net: 100, gross: 121, vatRate: 21 }}
  onChange={(newValue) => {
    // Update parent state or send to server
    updateLineItem(newValue)
  }}
/>
```

**How it works:**

1. Parent passes `value` prop (source of truth)
2. User edits → component shows changes immediately (optimistic)
3. On blur/commit → `onChange` is called with new values
4. Parent updates state → new `value` prop flows back
5. Component syncs with new props

This pattern allows the component to:

- Work standalone (even if parent ignores `onChange`)
- React to external prop changes (server refetch)
- Integrate with form libraries (react-hook-form, etc.)

See [useLineItemState.md](./src/features/invoicing/hooks/useLineItemState.md) for detailed explanation.

## API Contract

### Component Props

```typescript
type LineItemValue = {
  net: number | null      // Net amount (null = empty)
  gross: number | null    // Gross amount (null = empty)
  vatRate: number         // VAT rate percentage (e.g., 21 for 21%)
}

<LineItem
  value: LineItemValue           // Required: current values
  onChange?: (value) => void    // Optional: called on commit (blur/VAT change)
  vatRates?: VatRateOption[]    // Optional: available VAT rates
  disabled?: boolean            // Optional: disable all inputs
  isReadOnly?: boolean          // Optional: read-only mode
  unit?: { prefix?, suffix? }   // Optional: currency unit display
  labels?: FieldLabels          // Optional: custom labels
  hasVisibleLabels?: boolean    // Optional: show/hide labels
/>
```

### Backend API Contract

**Request Shape:**

```typescript
PUT /api/invoices/:id/lines
Body: {
  lines: Array<{
    id: string
    net: number | null
    gross: number | null
    vatRate: number
  }>
}
```

**Response Shape:**

```typescript
{
  id: string
  lines: Array<InvoiceLine>
}
```

**When calls happen:**

- On form submission (all lines updated atomically)
- Not on individual field changes (batched for better UX)

**What parent handles:**

- Loading initial data
- Batching updates
- Error handling
- Optimistic updates (optional)

See [invoiceApi.ts](./src/features/invoicing/api/invoiceApi.ts) for mock implementation.

## VAT Calculation & Rounding Strategy

### Calculation Formulas

- **Net → Gross**: `gross = net × (1 + vatRate / 100)`
- **Gross → Net**: `net = gross / (1 + vatRate / 100)`

### Rounding Strategy

- **Method**: Banker's rounding (round-half-even)
- **Precision**: 2 decimal places (currency standard)
- **Library**: big.js (avoids floating-point precision errors)

**Example:**

```
Net: 100.00, VAT: 21% → Gross: 121.00
Net: 99.99, VAT: 21% → Gross: 120.99 (not 120.99000000000001)
```

### Preventing Rounding Drift

The component tracks which field is actively being edited. Recalculation only happens:

- On blur (when user finishes editing)
- On VAT rate change
- **Not** when clicking between fields without changes

This prevents "rounding drift" where values change slightly when switching between fields.

## Assumptions and Limitations

### Assumptions

1. **B2B invoicing focus**: Net price is primary (VAT calculated on top)
2. **Currency format**: 2 decimal places, thousands separator
3. **Single currency**: No multi-currency conversion support
4. **Synchronous calculations**: No async validation or server-side calculations

### Limitations

1. **UI polish**: Basic styling, not fully responsive
2. **Mock API**: localStorage persistence only (no real backend)
3. **Simple mutations**: Full upsert only (no partial updates)
4. **Basic tests**: Coverage-focused, not exhaustive edge cases and integrations
5. **No error boundaries**: Errors bubble up to parent

## Architecture

### UI Library Choices

**Mantine UI** was chosen for interactive components (Button, Input, Select, etc.) because:

- Robust component library with features out of the box
- No need to reinvent complex components like NumberInput
- Good default styling and accessibility
- Excellent documentation
- Highly customizable and configurable

**Tailwind CSS** was chosen for layout and styling because:

- Choosing a UI library is a big commitment for project lifetime
- Mitigates vendor lock-in by avoiding Mantine layout components (Grid, Stack, Flex)
- Tailwind is just CSS - easier to migrate away from if needed
- CSS layers in `global.css` ensure correct cascade order

This hybrid approach uses Mantine for complex interactive components while keeping layout and styling in Tailwind for flexibility.

### Component Structure

```
LineItem (component)
  └── useLineItemState (hook)
        ├── VAT calculations (utils/vat.ts)
        ├── Money formatting (utils/money.ts)
        └── Validation (utils/validation.ts)
```

### State Management

- **Component state**: Managed by `useLineItemState` hook and couple of `useState`s
- **Form state**: React Hook Form (in demo app)
- **Server state**: TanStack Query
- **No global state**: Component is self-contained

### File Organization

```
src/features/invoicing/
├── components/        # React components
├── hooks/            # Custom hooks
├── utils/            # Pure functions
├── api/              # API client & queries
├── schemas/          # Zod validation schemas
├── types.ts          # TypeScript types
└── constants.ts      # Default values
```

## Development

### Running Locally

```bash
pnpm dev          # Start dev server
pnpm test         # Run tests
pnpm build        # Build for production
pnpm storybook    # Component documentation
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: TanStack config
- **Prettier**: Code formatting
- **Vitest**: Testing framework

## Related Documentation

- [useLineItemState Hook](./src/features/invoicing/hooks/useLineItemState.md) - State management details
- [LineItem Component](./src/features/invoicing/components/LineItem.md) - Component API reference
