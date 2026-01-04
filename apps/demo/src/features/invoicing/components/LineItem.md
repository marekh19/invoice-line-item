# LineItem Component

A line item component for invoice editing with VAT calculations.

## Features

- Enter net or gross amount
- Select VAT rate from predefined options
- Automatic recalculation of the other amount
- Precise decimal math using big.js
- Validation indicator for inconsistent data from server

## Behavior

- When net is edited and blurred, gross is recalculated
- When gross is edited and blurred, net is recalculated
- When VAT rate changes, gross is recalculated from net
- Clearing a field and blurring clears both fields
- If initial data is inconsistent, a red indicator and fix button appear

## Usage

```tsx
<LineItem
  value={{ net: 100, gross: 121, vatRate: 21 }}
  onChange={(value) => console.log('Updated:', value)}
/>
```

## Props

See TypeScript types in `LineItem.tsx` for complete prop definitions.

## Validation

The component validates initial data from props (server data). If net and gross don't match the calculated relationship, an error indicator appears. Once the user starts editing, validation is disabled (we trust user input).

## Accessibility

- Labels are always present (visually hidden with `sr-only` when `hasVisibleLabels={false}`)
- Labels are associated with inputs via `htmlFor`/`id`
- Error states are announced to screen readers
- Keyboard navigation supported (Tab, Enter to commit)
