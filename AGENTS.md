# AGENTS.md

## Scripts

- Install deps: `bun install`
- Lint: `bun lint` (eslint . --ext .js)
- Start Metro: `bun start`
- iOS: `bun ios` (runs `react-native run-ios`)
- Android: `bun android`
- Pods: `bun pods` (pod-install ios)

## Code Style

- **Formatting**: Prettier: singleQuote: true, trailingComma: 'all', arrowParens: 'avoid', bracketSpacing: false, bracketSameLine: true
- **Linting**: ESLint extends `@react-native` (see .eslintrc.js)
- **JS/JSX**: camelCase vars/functions, PascalCase components
- **Imports**: Relative paths; group React/MobX first, then local
- **MobX**: Use `observer`, `action`, `makeObservable`; stores in `stores/`
- **Error Handling**: try/catch in async; MobX `runInAction`
- **No TS**: Plain JS with jsconfig.json (experimentalDecorators: true)
- **Conventions**: Mimic existing: hooks in components/, utils/ helpers
- Run `bun lint --fix` after edits
