# Line Item VAT Component

> Your task is to design and implement **a reusable React component** that handles entering and displaying amounts **with and without VAT** for a single invoice line.

This component will later be used inside an invoice page that contains **multiple line items**, each using this same component independently.

## Context

You are implementing a part of the UI of an invoice editing page.

Each invoice consists of multiple line items, and every line item has:

- **Net amount (without VAT)**
- **Gross amount** (with VAT)
- **VAT rate** (selected from predefined options)

Your component will be used for each line item, meaning that it must:

- Work independently for each row
- Be reusable
- Support loading initial data (e.g., when editing an existing invoice)
- Expose a clear API for communicating updated values back to the parent page and/or backend layer

## Functional Requirements

### 1. User Input

The user must be able to:

- Enter **net amount**
- Enter **gross amount**
- Select a **VAT rate** from a predefined list
- Have the other amount automatically recalculated when one changes

### 2. VAT Rate Change

Define how the component behaves when both amounts already have values and the user changes the VAT rate.

You may choose the recalculation strategy — just document your reasoning.

### 3. Backend Interaction

You do **not** need to implement a real backend — mocked data is enough — but the component must:

- Load initial values
- Provide a clear way to send updated values back
- Define the API contract you expect from backend
  - request/response shapes
  - when calls happen
  - what the parent page is supposed to handle

### 4. Calculations & Rounding

Define and implement:

    How you calculate VAT
    How you round values (per step, per field, per line item)
    How you keep values consistent when switching between fields

Document your approach in the README.

### 5. Technical Freedom

You should use React with TypeScript but apart of that you may use whatever setup and tooling you prefer. For example:

- Any styling method
- Any state management strategy
- Any form library (or none)
- Any folder structure
- Your preferred conventions for requests, types, and utilities

We want to see how you normally solve a real-world task.

### 6. Deliverables

Please provide:

1. A functional implementation (GitHub repo (share with MartinMajor), ZIP, etc.)
2. A brief README explaining:
    - How your component works
    - How parent–child communication works
    - How your API contract is defined
    - VAT calculation & rounding strategy
    - Assumptions and limitations
    - Ideas for improvements
