# Potential Improvements

Known limitations and areas for future enhancement.

## UI Polish

The UI was treated as secondary to business logic and architecture. Current limitations:

- **Responsive design**: Basic mobile support, not optimized
- **Visual polish**: Minimal styling, could be more polished
- **Loading states**: Basic implementation, could be enhanced
- **Error handling**: Simple error display, could be more user-friendly

## Tooling

- **Pre-commit hooks**: Add Husky with lint/format on staged files
- **CI/CD**: Set up pipeline for validation and deployment
- **Monorepo**: Migrate to Turborepo for better DX
- **Storybook**: Extract as separate app in monorepo
- **Eslint**: More robust configuration with key plugins for a production project

## API & Backend

Current mock API is simplistic:

- **Full upsert only**: No partial updates or individual line mutations
- **localStorage only**: No real backend integration
- **No validation**: Server-side validation not implemented

**Mock Service Worker (MSW)**: The API could have been implemented with MSW instead of a custom localStorage-based mock. This would better prepare for real backend integration by:

- Using actual HTTP requests (fetch/ky)
- Matching real API patterns (REST endpoints, status codes)
- Enabling seamless transition to real backend (just swap MSW handlers)
- Supporting better testing with realistic network behavior

In production, would implement:

- Optimistic updates with rollback
- Conflict resolution
- Partial updates (PATCH)
- Server-side validation
- Proper error handling

## Testing

Current tests focus on quantity over quality:

- **No E2E tests**: Missing full user flow tests
- **No visual regression**: Visual changes not tracked
- **Limited integration tests**: Component interactions not fully covered

## Architecture

- **Error boundaries**: Add React error boundaries for better error handling
- **Performance**: Optimize bundle size
