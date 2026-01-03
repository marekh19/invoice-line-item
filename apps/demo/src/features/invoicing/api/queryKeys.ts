export const invoicingKeys = {
  /** Root key for all invoicing-related queries */
  all: ['invoicing'] as const,

  /** Keys for VAT rates */
  vatRates: () => [...invoicingKeys.all, 'vatRates'] as const,

  /** Keys for invoice data */
  invoice: () => [...invoicingKeys.all, 'invoice'] as const,

  /** Keys for invoice lines specifically */
  invoiceLines: () => [...invoicingKeys.invoice(), 'lines'] as const,
} as const
