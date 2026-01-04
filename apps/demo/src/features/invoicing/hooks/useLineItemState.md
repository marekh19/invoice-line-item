# useLineItemState Hook

Hook for managing line item state with VAT calculations.

## Controlled with Optimistic State Pattern

This hook implements a "controlled with optimistic state" pattern:

- The `value` prop represents the **confirmed** state (from parent/server)
- `pendingValue` holds **committed but unconfirmed** changes
- Display shows: `editingValue > pendingValue > propValue`
- When props change externally, pending state is cleared

This pattern allows the component to:

1. Work standalone (even if parent ignores `onChange`)
2. React to external prop changes (server refetch)
3. Integrate with form libraries (which update props on change)

## How It Works

```
User edits → commit() → pendingValue set → component shows new value
                      → onChange() called → parent may or may not update

If parent updates props → pendingValue cleared → show new props
If parent ignores       → pendingValue persists → user sees their edits ✓
```

## Key Behaviors

1. **Optimistic updates**: After commit, component shows the new value immediately, even before parent updates props.
2. **External sync**: When props change (different from pending), all internal state is reset to adopt the new external value.
3. **Net wins for VAT changes**: When VAT rate changes, gross is recalculated from net.
4. **Precise math**: Uses big.js internally for accurate decimal calculations.
5. **Dirty tracking**: Only recalculates on blur if the field was actually modified (prevents rounding drift).

## State Flow

```
Props (value) → prevPropValue (tracking)
              → pendingValue (committed but unconfirmed)
              → editingField/editingValue (currently typing)
              → Display values
```

## Server Refetch Behavior

When the parent passes new props (e.g., after server refetch):

- `pendingValue` is cleared (new server data takes precedence)
- `editingField`/`editingValue` are cleared
- `hasUserInteracted` resets (validation re-runs on new data)
