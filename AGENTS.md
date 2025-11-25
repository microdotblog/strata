# AGENTS.md

## Scripts

- Install deps: `bun install`
- Lint: `bun lint` (eslint . --ext .js)
- Start Metro: `bun start`
- iOS: `bun ios` (runs `react-native run-ios`)
- Android: `bun android`
- Pods: `bun pods` (pod-install ios)

## Code Style

- **Naming**: snake_case for MobX properties (is_loading), camelCase for methods/functions
- **Formatting**: Prettier: singleQuote: true, trailingComma: 'all', arrowParens: 'avoid', bracketSpacing: false, bracketSameLine: true
- **Linting**: ESLint extends `@react-native` (see .eslintrc.js)
- **JS/JSX**: camelCase vars/functions, PascalCase components
- **Imports**: Relative paths; group React/MobX first, then local
- **MobX**: Use `observer`, `action`, `makeObservable`; stores in `stores/`
- **Error Handling**: try/catch in async; MobX `runInAction`
- **No TS**: Plain JS with jsconfig.json (experimentalDecorators: true)
- **Conventions**: Mimic existing: hooks in components/, utils/ helpers
- Run `bun lint --fix` after edits

# Architecture

- **State**: MobX State Tree stores in `src/stores/`
- **Navigation**: React Navigation v7 with stack/bottom tabs
- **API**: Fetch-based services in `src/api/`
- **Components**: Feature-organized in `src/screens/`, reusable in `src/components/`

# General Rules

- Use `bun` commands instead of `yarn` when available
- Follow snake_case convention for state properties
- Use @observer decorators for reactive components
- Prefer async/await/yield over promises for API calls

## Architecture Overview

### File Organization
- `src/screens/` - Screen components organized by feature
- `src/components/` - Reusable UI components (cells, headers, sheets, etc.)
- `src/stores/` - MobX State Tree stores and models
- `src/api/` - API service classes
- `src/utils/` - Utility functions