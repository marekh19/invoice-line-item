/**
 * In-Memory Invoice API Client
 *
 * This is a naive and simplistic mock API implementation for demo purposes.
 * It simulates backend interaction with artificial delays and stores data in memory.
 *
 * In a real application, these functions would make HTTP requests to a backend server.
 *
 * ## Limitations
 *
 * - Data is lost on page refresh (in-memory only)
 * - No persistence, validation, or error handling
 * - Single invoice (no multi-invoice support)
 * - PUT replaces all lines (no partial updates)
 */

import type {
  Invoice,
  InvoiceLine,
  VatRateOption,
} from '@/features/invoicing/types'

// =============================================================================
// SIMULATED NETWORK DELAY
// =============================================================================

const SIMULATED_DELAY_MS = 300

const delay = (ms: number = SIMULATED_DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// =============================================================================
// IN-MEMORY DATA STORE
// =============================================================================

/**
 * Available VAT rates.
 * In a real app, these might come from a configuration endpoint.
 */
const vatRates: Array<VatRateOption> = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 21, label: '21%' },
  { value: 25, label: '25%' },
]

/**
 * In-memory invoice storage.
 * Initialized with some sample data for demo purposes.
 */
let invoiceStore: Invoice = {
  id: 'invoice-001',
  lines: [
    {
      id: crypto.randomUUID(),
      net: 100,
      gross: 121,
      vatRate: 21,
    },
    {
      id: crypto.randomUUID(),
      net: 250,
      gross: 275,
      vatRate: 10,
    },
    {
      id: crypto.randomUUID(),
      net: null,
      gross: null,
      vatRate: 21,
    },
  ],
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Fetches available VAT rate options.
 *
 * @returns Promise resolving to array of VAT rate options
 *
 * @example
 * const rates = await invoiceApi.getVatRates()
 * // [{ value: 0, label: '0%' }, { value: 21, label: '21%' }, ...]
 */
async function getVatRates(): Promise<Array<VatRateOption>> {
  await delay()
  return [...vatRates]
}

/**
 * Fetches the current invoice with all line items.
 *
 * @returns Promise resolving to the invoice object
 *
 * @example
 * const invoice = await invoiceApi.getInvoice()
 * // { id: 'invoice-001', lines: [...] }
 */
async function getInvoice(): Promise<Invoice> {
  await delay()
  // Return a deep copy to prevent direct mutation
  return {
    ...invoiceStore,
    lines: invoiceStore.lines.map((line) => ({ ...line })),
  }
}

/**
 * Fetches just the invoice line items.
 * Convenience method for when you don't need the full invoice object.
 *
 * @returns Promise resolving to array of invoice lines
 */
async function getInvoiceLines(): Promise<Array<InvoiceLine>> {
  const invoice = await getInvoice()
  return invoice.lines
}

/**
 * Replaces all invoice lines with the provided array.
 *
 * This is a naive PUT-style update that replaces the entire lines array.
 * In a real application, you might want:
 * - Partial updates (PATCH)
 * - Optimistic updates
 * - Conflict resolution
 * - Server-side validation
 *
 * @param lines - The new array of invoice lines (with or without IDs)
 * @returns Promise resolving to the updated invoice
 *
 * @example
 * await invoiceApi.updateInvoiceLines([
 *   { id: 'existing-id', net: 100, gross: 121, vatRate: 21 },
 *   { net: 200, gross: 242, vatRate: 21 }, // New line, ID will be generated
 * ])
 */
async function updateInvoiceLines(
  lines: Array<Omit<InvoiceLine, 'id'> & { id?: string }>,
): Promise<Invoice> {
  await delay()

  // Ensure all lines have IDs (generate for new lines)
  const linesWithIds: Array<InvoiceLine> = lines.map((line) => ({
    ...line,
    id: line.id ?? crypto.randomUUID(),
  }))

  // Replace the store
  invoiceStore = {
    ...invoiceStore,
    lines: linesWithIds,
  }

  // Return the updated invoice
  return getInvoice()
}

/**
 * Adds a new empty line item to the invoice.
 *
 * @param vatRate - The default VAT rate for the new line (defaults to 21%)
 * @returns Promise resolving to the updated invoice
 */
async function addInvoiceLine(vatRate: number = 21): Promise<Invoice> {
  await delay()

  const newLine: InvoiceLine = {
    id: crypto.randomUUID(),
    net: null,
    gross: null,
    vatRate,
  }

  invoiceStore = {
    ...invoiceStore,
    lines: [...invoiceStore.lines, newLine],
  }

  return getInvoice()
}

/**
 * Removes a line item from the invoice by ID.
 *
 * @param lineId - The ID of the line to remove
 * @returns Promise resolving to the updated invoice
 */
async function removeInvoiceLine(lineId: string): Promise<Invoice> {
  await delay()

  invoiceStore = {
    ...invoiceStore,
    lines: invoiceStore.lines.filter((line) => line.id !== lineId),
  }

  return getInvoice()
}

/**
 * Resets the invoice to initial demo data.
 * Useful for testing and development.
 */
async function resetInvoice(): Promise<Invoice> {
  await delay()

  invoiceStore = {
    id: 'invoice-001',
    lines: [
      {
        id: crypto.randomUUID(),
        net: 100,
        gross: 121,
        vatRate: 21,
      },
      {
        id: crypto.randomUUID(),
        net: 250,
        gross: 275,
        vatRate: 10,
      },
    ],
  }

  return getInvoice()
}

// =============================================================================
// EXPORTED API OBJECT
// =============================================================================

/**
 * Mock invoice API client.
 *
 * Provides methods for fetching and updating invoice data.
 * All methods return Promises and simulate network delay.
 */
export const invoiceApi = {
  getVatRates,
  getInvoice,
  getInvoiceLines,
  updateInvoiceLines,
  addInvoiceLine,
  removeInvoiceLine,
  resetInvoice,
} as const
