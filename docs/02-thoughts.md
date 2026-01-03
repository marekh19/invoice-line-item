# Thoughts on implementation

## Stuff I would like to cover

- [x] Unit / Integration tests for all the business logic (especially those cases mentioned in the assignment)
- [x] Storybook story for the line item component
- [ ] Fake in memory backend api to fetch initial line items
- [ ] Even some easy dev tools to refetch line items and select the number of them
- [ ] Everything well documented with README.md files next to the implementation and the core root README.md serving as navigation to all the other documents
- [ ] Demo invoice page where I can use the component - load initial data, toggle between read only mode and edit mode
- [ ] use mutation to update the values of the invoice
- [ ] use react-hook-form for the demo invoice page probably with useFieldArray to handle the state of the whole invoice - onSubmit we fire the mutation to trigger the data update in the "server" (mock)
