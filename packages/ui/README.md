# UI Component Library

A wrapper package around Mantine UI components for future-proofing.

## Purpose

This package provides a centralized import point for UI components. Currently, components are simple re-exports of Mantine, but this architecture enables future flexibility:

- **Decouples from Mantine**: If we need to switch UI libraries, we only update wrapper components
- **Enables incremental migration**: Can gradually replace Mantine components without changing application code
- **Simplifies refactoring**: No need to update imports across the codebase when switching libraries
- **Maintains API stability**: Application components use stable APIs regardless of underlying library changes

## Current Implementation

Currently, components are simple re-exports of Mantine components:

```typescript
// packages/ui/src/components/Button.tsx
export { Button } from '@mantine/core'
export type { ButtonProps } from '@mantine/core'
```

This is **not** a translation layer yet - it's just re-exports. However, the architecture is in place to add translation logic if needed in the future.

## Future Migration Strategy

If we need to switch to a different UI library (e.g., Radix UI, Chakra UI), we can add translation logic:

```typescript
// Before (current - just re-export)
export { Button } from '@mantine/core'

// After (with translation)
export const Button = ({ variant, ...props }) => {
  // Translate variant prop to new library's API
  const newVariant = variant === 'outline' ? 'outline' : 'solid'
  return <NewLibraryButton variant={newVariant} {...props} />
}
```

This allows incremental migration without changing application code.

## Components

- `ActionIcon` - Icon button
- `Button` - Primary button component
- `Input` - Input wrapper (Label, Error, etc.)
- `Loader` - Loading spinner
- `NumberInput` - Number input with formatting
- `Select` - Dropdown select
- `Skeleton` - Loading placeholder
- `Switch` - Toggle switch
- `Tooltip` - Tooltip overlay

All components maintain the same API as their Mantine equivalents.
