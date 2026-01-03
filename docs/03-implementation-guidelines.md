## Implementation guidelines (numeric-only, Mantine-first)

### 1) Decide the “source of truth” rules up front

* Default `sourceOfTruth = 'net'` on mount (when nothing was touched yet).
* Track `lastEdited: 'net' | 'gross' | null`.

  * `null` means “pristine”, so behave as if `'net'`.

**Effective source used for recalculation:**

```ts
const source = lastEdited ?? 'net';
```

### 2) Keep state as numbers (but represent “empty” explicitly)

`NumberInput` typically gives you `number | ''` (or `number | undefined` depending on config). Treat “no value” as `null` in your domain.

Internal normalized state:

* `net: number | null`
* `gross: number | null`
* `vatRate: number` (or an id)

**Rule:** never store `NaN`. Convert invalid/empty to `null` immediately.

### 3) Use **commit-based** recalculation (blur + rate change only)

You already picked:

* recalc on `onBlur` of net/gross
* recalc on VAT rate change

That’s clean and predictable.

Behavior:

* `onChange` of net/gross: update that field and set `lastEdited`.
* `onBlur` of net/gross:

  * if edited field is `null` → clear the other field (or leave it unchanged, but pick one; recommended: clear for consistency)
  * else compute the other field from it using VAT rate
  * round to 2 decimals
  * emit to parent

VAT rate change:

* update rate
* if `source` value exists → recompute the other from it
* if neither exists → do nothing else, just emit updated rate

### 4) Money math standard in TS apps

For “standard, robust, predictable” money math in TS, the most common production choice is:

* **Store money as integer minor units** (cents) in domain/backend
* Convert to decimals only for display/inputs

However, because VAT computation involves division (gross → net), you either:

* use a **decimal library** for calculations, or
* do integer math carefully with rounding.

**Recommended pragmatic standard (clean, not overengineered):**

* Use a small decimal library (`big.js` or `decimal.js`) **inside a tiny `money.ts` helper**.
* Keep your component API as `number` in “major units” (e.g., `123.45`) if you want, but compute via decimals and round.

This gives:

* no float surprises
* stable round-trip behavior

### 5) One canonical rounding function

Even if Mantine limits decimals, still round in code on commit (because `0.1 * 1.21` is still a float problem).

Define:

* `round2(x) -> number` using decimal lib
* `toNumberOrNull(valueFromNumberInput)`

### 6) Single compute functions (the “no ambiguity” core)

Centralize logic:

* `computeGross(net, rate) -> gross`
* `computeNet(gross, rate) -> net`

Where `rate` is e.g. `21` meaning 21%:

* `gross = net * (1 + rate/100)`
* `net = gross / (1 + rate/100)`

Always `round2` the result.

### 7) Parent/child contract

Props (suggested):

* `value: { net?: number | null; gross?: number | null; vatRate: number }`
* `vatRates: Array<{ value: number; label: string }>` (component transforms to Mantine `Select` string values internally)
* `onChange(nextValue: { net: number | null; gross: number | null; vatRate: number })`

**Emit only on commits** (blur + rate change). That keeps parent state stable and avoids saving on every keystroke.

### 8) Mantine Select string constraint (simple bridge)

Internally:

* `Select` gets `{ value: string, label: string }[]`
* Convert `number <-> string` at the boundary:

  * `value={String(vatRate)}`
  * `onChange={(v) => setVatRate(Number(v))}` (guard null)

Keep `vatRates` prop typed as numbers; string conversion is purely view-layer.

---

## Edge cases to handle + test

### A) Empty / clearing behavior

1. User clears **net** then blurs → gross should become `null` (recommended).
2. User clears **gross** then blurs → net should become `null`.
3. VAT rate change while both are `null` → no amounts created; only rate changes.

### B) Pristine initial state

4. Load `{ net: 100, gross: 121, vatRate: 21 }`, user changes VAT rate before touching inputs:

   * treat net as source → recompute gross from net.

### C) Last edited precedence

5. User edits net → blur → gross computed.
6. Then user edits gross → blur → net computed.
7. Then VAT rate change:

   * recompute the *other* from `lastEdited` field (gross edited last → preserve gross).

### D) Partial data loaded

8. Load only `{ net: 100, gross: null }`:

   * changing VAT or blurring net should compute gross.
9. Load only `{ gross: 121, net: null }`:

   * default source is net, but net is missing → on VAT rate change do nothing.
   * once gross blurred/edited, net can be computed.

### E) “Inconsistent initial data”

10. Load `{ net: 100, gross: 120.99, vatRate: 21 }`:

* decide policy and test it:

  * **Policy option (simple):** do not auto-fix on mount; only fix when user commits something or changes rate.
  * or **Policy option (strict):** normalize on mount using default source = net (recompute gross).
* Whatever you pick, document and test.

### F) VAT rate edge cases

11. VAT 0%:

* gross = net
* division doesn’t change value

12. Very high VAT rates (e.g. 100%):

* still stable and rounded

### G) Rounding stability

13. net = `0.01`, VAT = 21% → gross rounds to `0.01` or `0.01*1.21=0.0121 -> 0.01` (make sure it’s deterministic)
14. gross → net → gross round-trip: ensure you don’t drift unexpectedly beyond rounding expectations.

### H) Large numbers

15. net = `999999999.99` with 21% VAT should not overflow / become `1e+…` in UI.

* ensure formatting/display is acceptable (Mantine typically handles it, but test).

### I) User interaction ordering

16. User changes VAT rate while focused in net input but hasn’t blurred yet:

* decide: do you recompute using current net value immediately? (recommended: yes, using current numeric state)

17. Rapid VAT changes should not cause stale updates (ensure you’re using latest state in handlers).

### J) Disabled/readonly states (if you add them)

18. If parent says line is locked, ensure component doesn’t emit.

---

## Suggested minimal helper package choice

If you want “industry standard, tiny, non-weird”:

* **big.js** is small and straightforward.
* Keep it isolated in `money.ts` so the rest of the app remains plain numbers.
