import { fn } from 'storybook/test'
import { LineItem } from './LineItem'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { LineItemValue } from '../types'

type PlaygroundArgs = {
  // Initial values
  initialNet: number | null
  initialGross: number | null
  initialVatRate: number
  // Display
  currencyPrefix: string
  currencySuffix: string
  // Labels
  netLabel: string
  grossLabel: string
  vatRateLabel: string
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
      description: 'Initial gross amount (null = empty)',
      table: { category: 'Initial Values' },
    },
    initialVatRate: {
      control: { type: 'select' },
      options: [0, 5, 10, 15, 21, 25],
      description: 'Initial VAT rate (%)',
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
    currencyPrefix: '€',
    currencySuffix: '',
    netLabel: 'Net amount',
    grossLabel: 'Gross amount',
    vatRateLabel: 'VAT rate',
    disabled: false,
    onChange: fn(),
  },
  render: ({
    initialNet,
    initialGross,
    initialVatRate,
    currencyPrefix,
    currencySuffix,
    netLabel,
    grossLabel,
    vatRateLabel,
    disabled,
    onChange,
  }) => (
    <LineItem
      value={{
        net: initialNet,
        gross: initialGross,
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
      }}
      disabled={disabled}
      onChange={onChange}
    />
  ),
}

export default meta
type Story = StoryObj<PlaygroundArgs>

/**
 * Interactive playground for the LineItem component.
 *
 * Use the controls panel to:
 * - Set initial net/gross values and VAT rate
 * - Add currency prefix (€) or suffix (USD)
 * - Customize field labels for localization
 * - Toggle disabled state
 *
 * Try entering values in the component to see the VAT calculations in action.
 * Check the Actions tab to see onChange events.
 */
export const Playground: Story = {}
