# Guidelines

- Use ESM modules only (imports no require)
- Use vitest for testing (describe, it, expect)
- Generate modular code one function at a time
- Code goes into src folder and tests go into spec folder which is a sibling of src.
- Separate functions into logical modules. if there is a src/config.js, the spec file should spec/config.spec.js.
- spec files will have a top level describe which mentions the module name. We will use nested describe for tests. Each function will have its own describe and multiple tests.
- mocks & fixtures would be under the spec folder.
- use a root src/types.js to include object types that will be used in the different functions. These should be defined using JSDoc documentation
- each function should include JSDoc comments
- functions should not be more that 5 in complexity. Split into smaller functions as needed
- use descriptive names for variables and functions. it is ok to use single letter variables for loop indexes etc.
- Do not regenerate code unnecessarily for a small change like file name change.
