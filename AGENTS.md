# AGENT Instructions

This repository is a TypeScript library implementing spaced repetition algorithms. The project uses ES Modules and is built with **tsup**. Tests are written with **vitest**.

## Development
- Source code lives in `src/`. Tests reside in `test/`.
- Use `npm run build` to generate the bundled files in `dist/`.
- Always run `npm test` before committing changes. Tests must pass.

## Style
- Use strict TypeScript and keep exports typed.
- Prefer named exports; avoid default exports.
- Use arrow functions for small utilities; plain `function` declarations are acceptable for complex logic.

## Documentation
- Update `docs/` and `readme.md` whenever public APIs change.
- Keep markdown headings in sentence case.
- Provide runnable examples in code blocks where possible.

## Testing
- Place new unit tests under `test/` or alongside the affected source file as `*.test.ts`.
- Tests use the `vitest` API (`describe`, `test`, `expect`).

Follow these guidelines to keep the project consistent and maintainable.
