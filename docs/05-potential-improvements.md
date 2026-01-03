# Potential Improvements

This document tracks known limitations and potential improvements for the LineItem component.

---

## UI Polish

### Hardcoded Styling

The fix button alignment uses a hardcoded Tailwind class:

```tsx
className="self-end mb-6"
```

This assumes Mantine's default input height and may break if:
- Labels are hidden (`hasVisibleLabels={false}`)
- Error messages wrap to multiple lines
- Custom themes change input heights

**Recommendation:** Use CSS-in-JS or dynamic calculation based on actual input height for production use.

### Responsive Design

The current layout uses `flex gap-4` which may not work well on:
- Mobile devices (inputs might overflow)
- Very narrow containers
- RTL languages

**Recommendation:** Add responsive breakpoints, consider stacking inputs vertically on mobile.

### General UI Considerations

- Input widths are not controlled (rely on Mantine defaults)
- No loading states for async operations
- No skeleton/placeholder when data is being fetched
- Error state styling is minimal (just red border + button)

---

## Data Fetching

### VAT Rates from Server

Currently, VAT rates are passed as a static prop with defaults in `constants.ts`:

```typescript
export const DEFAULT_VAT_RATES = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  // ...
]
```

**Recommendation:** Fetch available VAT rates from the server using React Query:

```typescript
const { data: vatRates } = useQuery({
  queryKey: ['vatRates'],
  queryFn: fetchVatRates,
})

<LineItem
  value={lineItem}
  vatRates={vatRates}
  onChange={handleChange}
/>
```

This would support:
- Country-specific VAT rates
- Dynamic rate changes (regulatory updates)
- User-specific rate permissions

**Future work:** Implement mock API and React Query integration as outlined in `docs/02-thoughts.md`.

---

## Form Integration

### React Hook Form

The component currently manages its own state. For complex forms with many line items, integration with `react-hook-form` would be beneficial:

```typescript
const { control } = useForm<InvoiceForm>()

<Controller
  name="lineItems.0"
  control={control}
  render={({ field }) => (
    <LineItem
      value={field.value}
      onChange={field.onChange}
    />
  )}
/>
```

**Future work:** Create a `LineItemField` wrapper component for seamless react-hook-form integration.

---

## Performance

### Memoization

The component doesn't use `React.memo()` or `useMemo()` for derived values. This is intentional because:
- React Compiler handles automatic memoization
- The component is simple enough that manual optimization isn't needed

If React Compiler is not available, consider adding:
- `React.memo()` wrapper for the component
- `useMemo()` for `selectData` computation
- `useCallback()` for event handlers (if passed to child components)

---

## Accessibility

### Keyboard Navigation

- VAT select dropdown should support keyboard navigation (handled by Mantine)
- Fix button should be focusable and operable with Enter/Space (handled by Mantine ActionIcon)
- Consider adding keyboard shortcuts for power users (e.g., Tab between fields)

### Screen Reader Announcements

- Error state changes should be announced to screen readers
- Consider adding `aria-live` region for dynamic validation messages

---

## Testing

### Visual Regression Testing

Current tests cover functionality but not visual appearance. Consider adding:
- Storybook visual regression tests
- Playwright visual snapshots
- Chromatic or similar service

### E2E Testing

Current tests are unit/integration level. For critical flows, consider:
- Playwright E2E tests for full invoice creation flow
- API mocking with MSW for realistic scenarios
