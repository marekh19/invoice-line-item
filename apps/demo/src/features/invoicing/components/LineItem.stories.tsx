import { fn } from 'storybook/test'
import { computeGross } from '../utils/vat'
import { LineItem } from './LineItem'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { LineItemValue } from '../types'

type PlaygroundArgs = {
  // Initial values
  initialNet: number | null
  initialGross: number | null
  initialVatRate: number
  // Simulate bad data
  simulateInconsistentData: boolean
  // Display
  currencyPrefix: string
  currencySuffix: string
  hasVisibleLabels: boolean
  // Labels
  netLabel: string
  grossLabel: string
  vatRateLabel: string
  grossErrorLabel: string
  fixButtonLabel: string
  // State
  disabled: boolean
  // Callback
  onChange: (value: LineItemValue) => void
}

const meta: Meta<PlaygroundArgs> = {
  title: 'Invoicing/LineItem',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    initialNet: {
      control: { type: 'number' },
      description: 'Initial net amount (null = empty)',
      table: { category: 'Initial Values' },
    },
    initialGross: {
      control: { type: 'number' },
      description: 'Initial gross amount (auto-calculated unless inconsistent mode)',
      table: { category: 'Initial Values' },
    },
    initialVatRate: {
      control: { type: 'select' },
      options: [0, 5, 10, 15, 21, 25],
      description: 'Initial VAT rate (%)',
      table: { category: 'Initial Values' },
    },
    simulateInconsistentData: {
      control: { type: 'boolean' },
      description: 'Simulate bad data from server (gross won\'t match net × VAT)',
      table: { category: 'Initial Values' },
    },
    currencyPrefix: {
      control: { type: 'text' },
      description: 'Prefix before amounts (e.g. €, $)',
      table: { category: 'Display' },
    },
    currencySuffix: {
      control: { type: 'text' },
      description: 'Suffix after amounts (e.g. USD, EUR)',
      table: { category: 'Display' },
    },
    hasVisibleLabels: {
      control: { type: 'boolean' },
      description: 'Show labels above inputs (false = use aria-labels only)',
      table: { category: 'Display' },
    },
    netLabel: {
      control: { type: 'text' },
      description: 'Label for net input field',
      table: { category: 'Labels' },
    },
    grossLabel: {
      control: { type: 'text' },
      description: 'Label for gross input field',
      table: { category: 'Labels' },
    },
    vatRateLabel: {
      control: { type: 'text' },
      description: 'Label for VAT rate selector',
      table: { category: 'Labels' },
    },
    grossErrorLabel: {
      control: { type: 'text' },
      description: 'Error message for inconsistent gross amount',
      table: { category: 'Labels' },
    },
    fixButtonLabel: {
      control: { type: 'text' },
      description: 'Tooltip and aria-label for fix button',
      table: { category: 'Labels' },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all inputs',
      table: { category: 'State' },
    },
    onChange: {
      action: 'changed',
      description: 'Callback when values change',
      table: { category: 'Events' },
    },
  },
  args: {
    initialNet: 100,
    initialGross: 121,
    initialVatRate: 21,
    simulateInconsistentData: false,
    currencyPrefix: '€',
    currencySuffix: '',
    hasVisibleLabels: true,
    netLabel: 'Net amount',
    grossLabel: 'Gross amount',
    vatRateLabel: 'VAT rate',
    grossErrorLabel: 'Gross amount does not match calculation',
    fixButtonLabel: 'Fix: recalculate gross from net',
    disabled: false,
    onChange: fn(),
  },
  render: ({
    initialNet,
    initialGross,
    initialVatRate,
    simulateInconsistentData,
    currencyPrefix,
    currencySuffix,
    hasVisibleLabels,
    netLabel,
    grossLabel,
    vatRateLabel,
    grossErrorLabel,
    fixButtonLabel,
    disabled,
    onChange,
  }) => {
    // Calculate correct gross, or use a wrong value if simulating inconsistent data
    const gross =
      simulateInconsistentData && initialNet !== null
        ? initialNet * 2 // Obviously wrong value
        : initialGross ?? (initialNet !== null ? computeGross(initialNet, initialVatRate) : null)

    return (
      <LineItem
        value={{
          net: initialNet,
          gross,
          vatRate: initialVatRate,
        }}
        unit={
          currencyPrefix || currencySuffix
            ? { prefix: currencyPrefix || undefined, suffix: currencySuffix || undefined }
            : undefined
        }
        labels={{
          net: netLabel,
          gross: grossLabel,
          vatRate: vatRateLabel,
          grossError: grossErrorLabel,
          fixButton: fixButtonLabel,
        }}
        hasVisibleLabels={hasVisibleLabels}
        disabled={disabled}
        onChange={onChange}
      />
    )
  },
}

export default meta
type Story = StoryObj<PlaygroundArgs>

/**
 * Interactive playground for the LineItem component.
 *
 * Use the controls panel to:
 * - Set initial net/gross values and VAT rate
 * - Toggle "Simulate Inconsistent Data" to see validation error + fix button
 * - Add currency prefix (€) or suffix (USD)
 * - Toggle "Has Visible Labels" to show/hide labels (useful for multi-row layouts)
 * - Customize field labels for localization
 * - Toggle disabled state
 *
 * Try entering values in the component to see the VAT calculations in action.
 * Check the Actions tab to see onChange events.
 */
export const Playground: Story = {}
