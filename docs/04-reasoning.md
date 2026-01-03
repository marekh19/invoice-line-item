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

## Future Considerations

If B2C "fixed gross price" scenarios become important, we could add Option C (explicit toggle) as an enhancement. The current architecture supports this — we'd just need to add a `priceEntryMode: 'net' | 'gross'` prop and use it to determine the source of truth for VAT changes.
