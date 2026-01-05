/**
 * Mock Invoice API Client with localStorage Persistence
 *
 * This is a naive and simplistic mock API implementation for demo purposes.
 * It simulates backend interaction with artificial delays and persists data
 * to localStorage so it survives page refreshes.
 *
 * In a real application, these functions would make HTTP requests to a backend server.
 *
 * ## Limitations
 *
 * - No real backend (localStorage only)
 * - No validation or error handling
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
// LOCALSTORAGE PERSISTENCE
// =============================================================================

const STORAGE_KEY = 'invoice-demo-data'

/**
 * Default invoice data used when no saved data exists.
 */
const createDefaultInvoice = (): Invoice => {
  return {
    id: 'invoice-001',
    lines: [
      {
        id: crypto.randomUUID(),
        net: 100,
        gross: 200,
        vatRate: 10,
      },
      {
        id: crypto.randomUUID(),
        net: 200,
        gross: 242,
        vatRate: 21,
      },
      {
        id: crypto.randomUUID(),
        net: null,
        gross: null,
        vatRate: 0,
      },
    ],
  }
}

/**
 * Loads invoice from localStorage, or returns default if not found.
 */
const loadFromStorage = (): Invoice => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as Invoice
    }
  } catch {
    // Ignore parse errors, use default
  }
  return createDefaultInvoice()
}

/**
 * Saves invoice to localStorage.
 */
const saveToStorage = (invoice: Invoice): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice))
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

// =============================================================================
// DATA STORE (initialized from localStorage)
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
 * Invoice storage, initialized from localStorage.
 */
let invoiceStore: Invoice = loadFromStorage()

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Fetches available VAT rate options.
 *
 * @returns Promise resolving to array of VAT rate options
 */
const getVatRates = async (): Promise<Array<VatRateOption>> => {
  await delay()
  return [...vatRates]
}

/**
 * Fetches the current invoice with all line items.
 *
 * @returns Promise resolving to the invoice object
 */
const getInvoice = async (): Promise<Invoice> => {
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
const getInvoiceLines = async (): Promise<Array<InvoiceLine>> => {
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
 */
const updateInvoiceLines = async (
  lines: Array<Omit<InvoiceLine, 'id'> & { id?: string }>,
): Promise<Invoice> => {
  await delay()

  // Ensure all lines have IDs (generate for new lines)
  const linesWithIds: Array<InvoiceLine> = lines.map((line) => ({
    ...line,
    id: line.id ?? crypto.randomUUID(),
  }))

  // Update store and persist
  invoiceStore = {
    ...invoiceStore,
    lines: linesWithIds,
  }
  saveToStorage(invoiceStore)

  // Return the updated invoice
  return getInvoice()
}

/**
 * Adds a new empty line item to the invoice.
 *
 * @param vatRate - The default VAT rate for the new line (defaults to 21%)
 * @returns Promise resolving to the updated invoice
 */
const addInvoiceLine = async (vatRate: number = 21): Promise<Invoice> => {
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
  saveToStorage(invoiceStore)

  return getInvoice()
}

/**
 * Removes a line item from the invoice by ID.
 *
 * @param lineId - The ID of the line to remove
 * @returns Promise resolving to the updated invoice
 */
const removeInvoiceLine = async (lineId: string): Promise<Invoice> => {
  await delay()

  invoiceStore = {
    ...invoiceStore,
    lines: invoiceStore.lines.filter((line) => line.id !== lineId),
  }
  saveToStorage(invoiceStore)

  return getInvoice()
}

/**
 * Resets the invoice to initial demo data.
 * Clears localStorage and reinitializes with default data.
 */
const resetInvoice = async (): Promise<Invoice> => {
  await delay()

  invoiceStore = createDefaultInvoice()
  saveToStorage(invoiceStore)

  return getInvoice()
}

// =============================================================================
// EXPORTED API OBJECT
// =============================================================================

/**
 * Mock invoice API client with localStorage persistence.
 *
 * Provides methods for fetching and updating invoice data.
 * All methods return Promises and simulate network delay.
 * Data persists across page refreshes via localStorage.
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
