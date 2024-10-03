# Coding Guidelines

These guidelines outline best practices for writing modular, testable and maintainable code.

## Project Structure

- ESM modules only: Use import/export, no require.
- Code resides in src/, tests in spec/.
  Example structure:
  ```bash
  /src
    /config.js
    /types.js
    /moduleName.js
  /spec
    /config.spec.js
    /moduleName.spec.js
    /mocks
    /fixtures
  ```
- Tests use Vitest with describe, it, and expect.

## Functions & Modularity

- One function per module: Each file in src contains a single function.
- Corresponding test files in spec should mirror the file structure of src.
- Functions should have a maximum complexity of 5. Break down larger functions.
- Use clear names for variables and functions (short names like i for loop indexes are okay).
- Every function must include JSDoc comments explaining its parameters and return value.

## Testing

- Tests should have a top-level describe with the module name.
- Each function gets its own describe block, and multiple tests for various cases.
- Mocks and sample data go into the spec/mocks and spec/fixtures folders.

## Types

- Use a central src/types.js for defining object types using JSDoc comments.

## Maintainability

- Avoid regenerating code unnecessarily for small changes (e.g., renaming files).
