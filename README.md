# Invoice Line Item Component

A production-ready React component for handling VAT calculations in invoice line items. Built with TypeScript, React, and modern tooling.

## Overview

This project demonstrates a reusable `LineItem` component that handles:

- Net and gross amount input with automatic VAT calculations
- VAT rate selection from configurable options
- Precise decimal math using big.js
- Controlled component pattern with optimistic state updates
- Form integration with react-hook-form

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Run Storybook
pnpm storybook
```

## Project Structure

```
invoice-line-item/
├── apps/
│   └── demo/          # Main application
├── packages/
│   └── ui/            # UI component library (Mantine wrapper)
└── docs/              # Documentation
```

## Documentation

- **[Assignment](./docs/01-assignment.md)** - Original requirements
- **[Demo App README](./apps/demo/README.md)** - Component documentation, architecture, API
- **[Potential Improvements](./docs/02-potential-improvements.md)** - Known limitations and future work
- **[UI Package README](./packages/ui/README.md)** - UI library architecture

### Component Documentation

- **[LineItem Component](./apps/demo/src/features/invoicing/components/LineItem.md)** - Component API reference
- **[useLineItemState Hook](./apps/demo/src/features/invoicing/hooks/useLineItemState.md)** - State management details

## Key Features

- **VAT Calculations**: Automatic recalculation between net and gross amounts
- **Precise Math**: Uses big.js for accurate decimal calculations (no floating-point errors)
- **State Management**: Controlled component with optimistic updates
- **Form Integration**: Works with react-hook-form and standalone
- **Type Safety**: Full TypeScript coverage
- **Testing**: Comprehensive test suite (64 tests)

## Tech Stack

- **React** + **TypeScript**
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Mantine UI** - Component library (wrapped in `@repo/ui`)
- **Vitest** - Testing framework
- **Storybook** - Component documentation

## License

MIT
