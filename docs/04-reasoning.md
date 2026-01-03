# VAT Recalculation Strategy

## The Problem

When a user changes the VAT rate and both net and gross amounts already have values, which field should be preserved and which should be recalculated?

## Options Considered

### Option A: "Last Edited Wins"

Preserve whichever field the user edited most recently.

**Pros:**
- Respects user's most recent intent
- Flexible for both B2B (net-focused) and B2C (gross-focused) scenarios

**Cons:**
- Behavior depends on invisible state (which field was edited last)
- User may not remember or realize which field is "in control"
- Requires additional UX feedback (icons, styling) to make the behavior visible
- More complex mental model

### Option B: "Net is Always the Source of Truth" ✅ (Chosen)

When VAT rate changes, always recalculate gross from net.

**Pros:**
- Predictable — behavior is always the same
- Matches standard B2B invoicing workflows (net is the "real" price)
- No hidden state affecting behavior
- Simpler to explain and understand
- Net represents the price of goods/services; VAT is tax calculated on top

**Cons:**
- Less flexible for B2C "shelf price" scenarios where gross should be fixed

### Option C: Explicit Toggle

Add a UI control for the user to choose: "Calculate from: [Net] [Gross]"

**Pros:**
- Most explicit — user always knows what will happen
- Supports both B2B and B2C workflows

**Cons:**
- Adds UI complexity
- Extra cognitive load for simple use cases
- Overkill for most invoicing scenarios

## Chosen Approach: Option B

We chose **"Net is Always the Source of Truth"** because:

1. **Predictability**: Users always know what will happen when they change the VAT rate. There's no hidden state or "magic" behavior.

2. **Domain alignment**: In invoicing, net represents the actual price of goods or services. VAT is a tax calculated on top. When tax rates change (which happens in real regulatory scenarios), businesses want their base prices to remain stable.

3. **Covers 90%+ of use cases**: Most invoicing is B2B where net prices are primary. Even in B2C scenarios, once a net price is established, it makes sense to treat it as canonical.

4. **Simplicity**: Fewer edge cases, easier to test, easier to explain.

## Behavior Summary

| User Action | Result |
|-------------|--------|
| Edit **net** → blur | Gross is recalculated from net |
| Edit **gross** → blur | Net is recalculated from gross |
| Change **VAT rate** | Gross is recalculated from net (if net exists) |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Both fields are null, VAT changes | Only VAT rate updates, no calculation |
| Net is null, gross has value, VAT changes | Only VAT rate updates (no source to calculate from) |
| Net has value, gross is null, VAT changes | Gross is calculated from net |

## User Workflow Examples

### Example 1: Standard B2B flow
1. User enters net = €100
2. Blur → gross = €121 (at 21% VAT)
3. User changes VAT to 10%
4. → Net stays €100, gross becomes €110 ✓

### Example 2: Working backwards from final price
1. User enters gross = €150 (target shelf price)
2. Blur → net = €123.97 (at 21% VAT)
3. User changes VAT to 10%
4. → Net stays €123.97, gross becomes €136.37

In Example 2, the user "established" the net price by working backwards from gross. Once established, that net price is treated as the source of truth.

### Example 3: Editing existing invoice
1. Load existing data: { net: 100, gross: 121, vatRate: 21 }
2. User changes VAT to 10%
3. → Net stays 100, gross becomes 110 ✓

## Dirty Tracking: Preventing Rounding Drift

### The Problem

Due to rounding, converting between net and gross is not always reversible:

1. User enters gross = €150 at 15% VAT
2. Blur → net = €130.43 (150 / 1.15, rounded)
3. User clicks on net field (no changes)
4. User clicks back to gross → gross = €149.99 (130.43 × 1.15, rounded) ❌

This "rounding drift" occurs because each blur was triggering recalculation, even without user changes.

### Solution: Dirty Field Tracking

We track whether a field has been modified since the last commit:

```typescript
const [dirtyField, setDirtyField] = useState<'net' | 'gross' | null>(null)

const handleNetBlur = () => {
  if (dirtyField !== 'net') return  // Skip if not modified
  // ... recalculate and commit
  setDirtyField(null)
}
```

**Result:** Clicking between fields without typing does NOT trigger recalculation. Values remain stable.

### Updated Behavior Summary

| User Action | Result |
|-------------|--------|
| Edit **net** → blur | Gross is recalculated from net |
| Edit **gross** → blur | Net is recalculated from gross |
| Click **net** (no edit) → blur | Nothing happens (field not dirty) |
| Click **gross** (no edit) → blur | Nothing happens (field not dirty) |
| Change **VAT rate** | Gross is recalculated from net (always triggers) |

---

## Validation: Detecting Inconsistent Initial Data

### The Problem

Data loaded from the server might be inconsistent (e.g., net = 100, gross = 120.99, vatRate = 21). The correct gross should be 121.

We need to:
1. Show the user that the data is inconsistent
2. Provide a way to fix it
3. NOT show false positives during normal editing

### Solution: Validate Initial Props Only

We track whether the user has interacted with the component:

```typescript
const [hasUserInteracted, setHasUserInteracted] = useState(false)

// In component:
const hasInitialDataError =
  !hasUserInteracted && !isGrossValid(value.net, value.gross, value.vatRate)
```

### Validation Behavior

| Scenario | Error Shown? |
|----------|--------------|
| Initial data is inconsistent | ✅ Yes |
| User starts editing (any field) | ❌ No (error disappears) |
| User types value that doesn't match | ❌ No (trust user input) |
| User changes VAT rate | ❌ No (auto-recalculates) |

### Fix Button

When initial data is inconsistent, a fix button appears next to the gross field:
- Shows red error state on gross input
- Clicking fix button recalculates gross from net
- Error disappears after any user interaction

### Why This Approach?

1. **No false positives**: Users won't see errors while typing intermediate values
2. **Clear intent**: Error only appears for data that came from outside (server)
3. **Easy recovery**: One-click fix, or user can just start editing normally

---

## Prop Synchronization: Handling Server Refetch

### The Problem

When data is fetched from the server and the component re-renders with new `value` props, the internal state needs to sync. Without this, a server refetch would be ignored.

### Solution: useEffect Sync

We synchronize internal state when `initialValue` prop changes:

```typescript
useEffect(() => {
  setNet(initialValue.net)
  setGross(initialValue.gross)
  setVatRate(initialValue.vatRate)
  setDirtyField(null)
  setHasUserInteracted(false)
}, [initialValue.net, initialValue.gross, initialValue.vatRate])
```

This ensures:
- New server data is reflected immediately
- Interaction state is reset (validation re-runs on new data)
- Dirty tracking is cleared

### Alternative: Key-based Remount

Consumers can also force a full remount using React keys:

```tsx
<LineItem key={invoice.id} value={invoice.lineItem} />
```

Both approaches work. The `useEffect` approach is less disruptive (preserves focus, animations), while key-based remount is simpler but fully resets the component.

---

## Why Not "Last Edited Wins"?

We initially considered tracking `lastEdited` to preserve whichever field the user edited most recently when VAT rate changes. We intentionally chose against this because:

1. **Hidden state problem**: Users can't see which field is "in control"
2. **Unpredictable behavior**: Same action (changing VAT) produces different results
3. **Complexity**: Requires additional UI feedback to make behavior visible
4. **B2B focus**: In invoicing, net is almost always the primary value

The simpler "net is always source of truth" approach provides predictable, explainable behavior without hidden state.

---

## Debouncing Considerations

### Current Behavior

The component calls `onChange` on every commit event:
- Blur of net/gross input (if field was modified)
- VAT rate change

This is intentional for immediate feedback and form validation.

### For Auto-Save Scenarios

If consumers implement auto-save (e.g., saving to server on every change), they should debounce on their side:

```typescript
const debouncedSave = useDebouncedCallback(
  (value: LineItemValue) => saveToServer(value),
  500
)

<LineItem
  value={lineItem}
  onChange={debouncedSave}
/>
```

This keeps the component simple and gives consumers control over their specific timing requirements.

---

## Future Considerations

If B2C "fixed gross price" scenarios become important, we could add Option C (explicit toggle) as an enhancement. The current architecture supports this — we'd just need to add a `priceEntryMode: 'net' | 'gross'` prop and use it to determine the source of truth for VAT changes.
