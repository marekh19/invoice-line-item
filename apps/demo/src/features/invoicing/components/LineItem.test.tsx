import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { LineItem } from './LineItem'
import type { Mock } from 'vitest'
import type { LineItemValue } from '../types'

// =============================================================================
// TEST UTILITIES
// =============================================================================

type OnChangeMock = Mock<(value: LineItemValue) => void>

/**
 * Renders the LineItem component wrapped in MantineProvider
 */
function renderLineItem(
  props: Partial<Omit<React.ComponentProps<typeof LineItem>, 'onChange'>> & {
    value: LineItemValue
    onChange?: OnChangeMock
  },
) {
  const onChange = props.onChange ?? vi.fn<(value: LineItemValue) => void>()

  const result = render(
    <MantineProvider>
      <LineItem {...props} onChange={onChange} />
    </MantineProvider>,
  )

  return {
    ...result,
    onChange,
  }
}

/**
 * Gets the input elements by their data-testid
 */
function getInputs() {
  return {
    netInput: screen.getByTestId('line-item-net'),
    grossInput: screen.getByTestId('line-item-gross'),
    vatSelect: screen.getByTestId('line-item-vat-rate'),
  }
}

/**
 * Gets the fix button if visible
 */
function getFixButton() {
  return screen.getByTestId('line-item-fix-button')
}

/**
 * Queries the fix button (returns null if not found)
 */
function queryFixButton() {
  return screen.queryByTestId('line-item-fix-button')
}

/**
 * Simulates typing a value in an input (clears first, then types)
 */
async function typeValue(
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLElement,
  value: string,
) {
  await user.clear(input)
  await user.type(input, value)
}

/**
 * Opens the VAT select dropdown and clicks an option.
 * Uses `hidden: true` because Mantine's dropdown might be styled with display:none
 * but still accessible in the DOM.
 */
async function selectVatRate(
  user: ReturnType<typeof userEvent.setup>,
  rate: string,
) {
  const { vatSelect } = getInputs()
  await user.click(vatSelect)
  // Mantine renders options in a portal, find by role with hidden option
  const option = screen.getByRole('option', { name: rate, hidden: true })
  await user.click(option)
}

// =============================================================================
// HAPPY PATH TESTS
// =============================================================================

describe('LineItem - Happy Paths', () => {
  it('renders with initial values correctly', () => {
    renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
    })

    const { netInput, grossInput, vatSelect } = getInputs()

    expect(netInput).toHaveValue('100.00')
    expect(grossInput).toHaveValue('121.00')
    expect(vatSelect).toHaveValue('21%')
  })

  it('calculates gross from net on blur', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    await typeValue(user, netInput, '100')
    await user.click(grossInput) // blur net by clicking elsewhere

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 121,
      vatRate: 21,
    })
  })

  it('calculates net from gross on blur', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    await typeValue(user, grossInput, '121')
    await user.click(netInput) // blur gross by clicking elsewhere

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 121,
      vatRate: 21,
    })
  })

  it('recalculates gross when VAT rate changes (net as default source)', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
    })

    await selectVatRate(user, '10%')

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 110, // 100 * 1.10
      vatRate: 10,
    })
  })
})

// =============================================================================
// A) EMPTY / CLEARING BEHAVIOR
// =============================================================================

describe('LineItem - Empty / Clearing Behavior', () => {
  it('clearing net and blurring clears gross', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    await user.clear(netInput)
    await user.click(grossInput) // blur

    expect(onChange).toHaveBeenCalledWith({
      net: null,
      gross: null,
      vatRate: 21,
    })
  })

  it('clearing gross and blurring clears net', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    await user.clear(grossInput)
    await user.click(netInput) // blur

    expect(onChange).toHaveBeenCalledWith({
      net: null,
      gross: null,
      vatRate: 21,
    })
  })

  it('VAT rate change with null amounts only changes rate', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 21 },
    })

    await selectVatRate(user, '10%')

    expect(onChange).toHaveBeenCalledWith({
      net: null,
      gross: null,
      vatRate: 10,
    })
  })
})

// =============================================================================
// B) PRISTINE INITIAL STATE
// =============================================================================

describe('LineItem - Pristine Initial State', () => {
  it('changing VAT rate on pristine state recalculates gross from net', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
    })

    // Change VAT rate without touching any input first
    await selectVatRate(user, '25%')

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 125, // 100 * 1.25
      vatRate: 25,
    })
  })
})

// =============================================================================
// C) NET IS ALWAYS SOURCE OF TRUTH FOR VAT CHANGES
// =============================================================================

describe('LineItem - Net is Source of Truth for VAT Changes', () => {
  it('VAT rate change always uses net as source, even after editing gross', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Step 1: Edit net → blur → gross computed
    await typeValue(user, netInput, '100')
    await user.click(grossInput)

    expect(onChange).toHaveBeenLastCalledWith({
      net: 100,
      gross: 121,
      vatRate: 21,
    })

    // Step 2: Edit gross → blur → net computed (user works backwards from target price)
    await user.clear(grossInput)
    await typeValue(user, grossInput, '200')
    await user.click(netInput)

    expect(onChange).toHaveBeenLastCalledWith({
      net: 165.29, // 200 / 1.21 rounded - this becomes the "real" price
      gross: 200,
      vatRate: 21,
    })

    // Step 3: Change VAT rate → net stays, gross is recalculated
    // Even though gross was last edited, net is always the source of truth
    await selectVatRate(user, '10%')

    expect(onChange).toHaveBeenLastCalledWith({
      net: 165.29, // Net is preserved
      gross: 181.82, // 165.29 * 1.10 rounded
      vatRate: 10,
    })
  })

  it('VAT rate change uses net regardless of editing order', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Edit gross first
    await typeValue(user, grossInput, '121')
    await user.click(netInput)

    // Then edit net
    await user.clear(netInput)
    await typeValue(user, netInput, '100')
    await user.click(grossInput)

    // Change VAT rate → net is always preserved
    await selectVatRate(user, '10%')

    expect(onChange).toHaveBeenLastCalledWith({
      net: 100,
      gross: 110, // 100 * 1.10
      vatRate: 10,
    })
  })
})

// =============================================================================
// D) PARTIAL DATA LOADED
// =============================================================================

describe('LineItem - Partial Data Loaded', () => {
  it('with only net loaded, typing same value triggers recalculation', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Re-type the same value to mark as dirty, then blur
    await typeValue(user, netInput, '100')
    await user.click(grossInput)

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 121,
      vatRate: 21,
    })
  })

  it('with only net loaded, changing VAT computes gross', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: null, vatRate: 21 },
    })

    await selectVatRate(user, '10%')

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 110,
      vatRate: 10,
    })
  })

  it('with only gross loaded, VAT change does not compute net (no source)', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: 121, vatRate: 21 },
    })

    // Change VAT rate - default source is net, but net is null
    await selectVatRate(user, '10%')

    // Should only change rate, not compute anything
    expect(onChange).toHaveBeenCalledWith({
      net: null,
      gross: 121,
      vatRate: 10,
    })
  })

  it('with only gross loaded, typing same value triggers recalculation', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: 121, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Re-type the same value to mark as dirty, then blur
    await typeValue(user, grossInput, '121')
    await user.click(netInput)

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 121,
      vatRate: 21,
    })
  })
})

// =============================================================================
// E) INCONSISTENT INITIAL DATA
// =============================================================================

describe('LineItem - Inconsistent Initial Data', () => {
  it('does not auto-fix inconsistent data on mount', () => {
    const onChange = vi.fn()
    renderLineItem({
      value: { net: 100, gross: 120.99, vatRate: 21 },
      onChange,
    })

    const { netInput, grossInput } = getInputs()

    // Values should be displayed as-is on mount
    expect(netInput).toHaveValue('100.00')
    expect(grossInput).toHaveValue('120.99')

    // onChange should not have been called on mount
    expect(onChange).not.toHaveBeenCalled()
  })

  it('fixes inconsistent data when user clicks fix button', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: 120.99, vatRate: 21 },
    })

    // Fix button should be visible for inconsistent data
    const fixButton = getFixButton()
    expect(fixButton).toBeVisible()

    await user.click(fixButton)

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 121, // Fixed to correct value
      vatRate: 21,
    })
  })

  it('fixes inconsistent data when VAT rate changes', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: 120.99, vatRate: 21 },
    })

    await selectVatRate(user, '10%')

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 110, // Recalculated correctly
      vatRate: 10,
    })
  })

  it('shows error state only for initial inconsistent data', () => {
    renderLineItem({
      value: { net: 100, gross: 120.99, vatRate: 21 }, // Inconsistent
    })

    const { grossInput } = getInputs()

    // Error state should be shown
    expect(grossInput).toHaveAttribute('aria-invalid', 'true')

    // Fix button should be visible
    expect(
      getFixButton(),
    ).toBeVisible()
  })

  it('hides error state once user starts editing', async () => {
    const user = userEvent.setup()
    renderLineItem({
      value: { net: 100, gross: 120.99, vatRate: 21 }, // Inconsistent
    })

    const { grossInput } = getInputs()

    // Initially shows error
    expect(grossInput).toHaveAttribute('aria-invalid', 'true')
    expect(
      getFixButton(),
    ).toBeVisible()

    // User clears and types a new value
    await typeValue(user, grossInput, '121')

    // Error should be hidden now (user has interacted)
    expect(grossInput).not.toHaveAttribute('aria-invalid', 'true')
    expect(
      queryFixButton(),
    ).not.toBeInTheDocument()
  })

  it('does not show error during normal editing', async () => {
    const user = userEvent.setup()
    renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 }, // Consistent
    })

    const { grossInput } = getInputs()

    // No error initially
    expect(grossInput).not.toHaveAttribute('aria-invalid', 'true')

    // User changes gross to something "inconsistent" while typing
    await user.clear(grossInput)
    await user.type(grossInput, '999')

    // Still no error - we don't validate during user editing
    expect(grossInput).not.toHaveAttribute('aria-invalid', 'true')
    expect(
      queryFixButton(),
    ).not.toBeInTheDocument()
  })
})

// =============================================================================
// F) VAT RATE EDGE CASES
// =============================================================================

describe('LineItem - VAT Rate Edge Cases', () => {
  it('VAT 0% results in gross equal to net', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: null, vatRate: 0 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, netInput, '100')
    await user.click(grossInput)

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 100, // No VAT added
      vatRate: 0,
    })
  })

  it('VAT 0% net from gross is unchanged', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: 100, vatRate: 0 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, grossInput, '100')
    await user.click(netInput)

    expect(onChange).toHaveBeenCalledWith({
      net: 100, // No VAT to subtract
      gross: 100,
      vatRate: 0,
    })
  })

  it('100% VAT rate is stable and rounded', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: null, vatRate: 21 },
      vatRates: [
        { value: 21, label: '21%' },
        { value: 100, label: '100%' },
      ],
    })

    await selectVatRate(user, '100%')

    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 200, // 100 * 2.0
      vatRate: 100,
    })
  })
})

// =============================================================================
// G) ROUNDING STABILITY
// =============================================================================

describe('LineItem - Rounding Stability', () => {
  it('small amount net = 0.01 with 21% VAT rounds correctly', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 0.01, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, netInput, '0.01')
    await user.click(grossInput)

    // 0.01 * 1.21 = 0.0121 → rounds to 0.01
    expect(onChange).toHaveBeenCalledWith({
      net: 0.01,
      gross: 0.01,
      vatRate: 21,
    })
  })

  it('rounding is deterministic for floating point edge cases', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 33.33, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, netInput, '33.33')
    await user.click(grossInput)

    // 33.33 * 1.21 = 40.3293 → 40.33
    expect(onChange).toHaveBeenCalledWith({
      net: 33.33,
      gross: 40.33,
      vatRate: 21,
    })
  })

  it('handles classic floating point problem (0.1 + 0.2)', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 10 },
    })

    const { netInput, grossInput } = getInputs()

    await typeValue(user, netInput, '0.10')
    await user.click(grossInput)

    // 0.10 * 1.10 = 0.11 (not 0.11000000000000001)
    expect(onChange).toHaveBeenCalledWith({
      net: 0.1,
      gross: 0.11,
      vatRate: 10,
    })
  })

  it('prevents rounding drift when clicking between fields without changes', async () => {
    // Regression test: entering 150 gross at 15% VAT, then clicking back and forth
    // should NOT cause 150 → 130.43 → 149.99 drift
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 15 },
    })

    const { netInput, grossInput } = getInputs()

    // Step 1: Enter gross 150, blur → net = 130.43
    await typeValue(user, grossInput, '150')
    await user.click(netInput)

    expect(onChange).toHaveBeenLastCalledWith({
      net: 130.43, // 150 / 1.15
      gross: 150,
      vatRate: 15,
    })

    // Step 2: Click back to gross WITHOUT typing → should NOT recalculate
    await user.click(grossInput)

    // Step 3: Click back to net WITHOUT typing → should NOT recalculate
    await user.click(netInput)

    // onChange should still have the same last call (no new calls from clicking around)
    expect(onChange).toHaveBeenCalledTimes(1)

    // Verify values are still correct
    expect(grossInput).toHaveValue('150.00')
    expect(netInput).toHaveValue('130.43')
  })
})

// =============================================================================
// H) LARGE NUMBERS
// =============================================================================

describe('LineItem - Large Numbers', () => {
  it('large number with 21% VAT does not overflow', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 999999999.99, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, netInput, '999999999.99')
    await user.click(grossInput)

    // 999999999.99 * 1.21 = 1209999999.9879 → 1209999999.99
    expect(onChange).toHaveBeenCalledWith({
      net: 999999999.99,
      gross: 1209999999.99,
      vatRate: 21,
    })
  })

  it('large gross computes correct net', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: 1209999999.99, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, grossInput, '1209999999.99')
    await user.click(netInput)

    const call = onChange.mock.calls[0][0]
    expect(call.net).toBeCloseTo(999999999.99, 1)
    expect(call.gross).toBe(1209999999.99)
  })
})

// =============================================================================
// I) USER INTERACTION ORDERING
// =============================================================================

describe('LineItem - User Interaction Ordering', () => {
  it('VAT rate change uses current input value even before blur', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: null, gross: null, vatRate: 21 },
    })

    const { netInput } = getInputs()

    // Type in net but don't blur
    await typeValue(user, netInput, '100')

    // Change VAT rate (this will also blur the net input implicitly)
    await selectVatRate(user, '10%')

    // Should use the typed value (100) to compute gross
    expect(onChange).toHaveBeenCalledWith({
      net: 100,
      gross: 110, // 100 * 1.10
      vatRate: 10,
    })
  })

  it('rapid VAT changes use latest state', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
    })

    // Change to 10%
    await selectVatRate(user, '10%')

    // Change to 25%
    await selectVatRate(user, '25%')

    // Change to 5%
    await selectVatRate(user, '5%')

    // Final call should reflect the latest rate (5%)
    expect(onChange).toHaveBeenLastCalledWith({
      net: 100,
      gross: 105, // 100 * 1.05
      vatRate: 5,
    })
  })
})

// =============================================================================
// J) DISABLED STATE
// =============================================================================

describe('LineItem - Disabled State', () => {
  it('disabled inputs prevent interaction', () => {
    renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
      disabled: true,
    })

    const { netInput, grossInput, vatSelect } = getInputs()

    expect(netInput).toBeDisabled()
    expect(grossInput).toBeDisabled()
    expect(vatSelect).toHaveAttribute('data-disabled', 'true')
  })

  it('disabled component does not emit changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
      onChange,
      disabled: true,
    })

    const { netInput } = getInputs()

    // Attempt to interact (should be blocked by browser)
    await user.click(netInput)

    expect(onChange).not.toHaveBeenCalled()
  })
})

// =============================================================================
// ADDITIONAL EDGE CASES
// =============================================================================

describe('LineItem - Additional Edge Cases', () => {
  it('renders with custom VAT rates', async () => {
    const user = userEvent.setup()
    const customRates = [
      { value: 7, label: '7%' },
      { value: 19, label: '19%' },
    ]

    renderLineItem({
      value: { net: 100, gross: 107, vatRate: 7 },
      vatRates: customRates,
    })

    const { vatSelect } = getInputs()

    await user.click(vatSelect)

    // Should show custom rates (hidden: true for Mantine portal)
    expect(
      screen.getByRole('option', { name: '7%', hidden: true }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: '19%', hidden: true }),
    ).toBeInTheDocument()
  })

  it('renders with unit prefix', () => {
    renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
      unit: { prefix: '$' },
    })

    const { netInput } = getInputs()
    expect(netInput).toBeVisible()
    // Prefix is applied via Mantine's NumberInput
  })

  it('renders with unit suffix', () => {
    renderLineItem({
      value: { net: 100, gross: 121, vatRate: 21 },
      unit: { suffix: ' Kč' },
    })

    const { netInput } = getInputs()
    expect(netInput).toBeVisible()
  })

  it('handles zero values correctly', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: 0, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, netInput, '0')
    await user.click(grossInput)

    expect(onChange).toHaveBeenCalledWith({
      net: 0,
      gross: 0, // 0 * 1.21 = 0
      vatRate: 21,
    })
  })

  it('handles negative initial values (edge case for loaded data)', async () => {
    const user = userEvent.setup()
    const { onChange } = renderLineItem({
      value: { net: -100, gross: null, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    // Type value to mark as dirty
    await typeValue(user, netInput, '-100')
    await user.click(grossInput)

    // The calculation should still work mathematically
    expect(onChange).toHaveBeenCalledWith({
      net: -100,
      gross: -121, // -100 * 1.21
      vatRate: 21,
    })
  })

  it('displays values with correct formatting (thousand separators)', () => {
    renderLineItem({
      value: { net: 1234567.89, gross: 1493827.15, vatRate: 21 },
    })

    const { netInput, grossInput } = getInputs()

    expect(netInput).toHaveValue('1,234,567.89')
    expect(grossInput).toHaveValue('1,493,827.15')
  })
})
