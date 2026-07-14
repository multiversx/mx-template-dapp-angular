# MultiversX Template dApp (Angular)

The **MultiversX dApp Template** built with [Angular](https://angular.dev/) 20 (standalone components). It is a reference implementation of [@multiversx/sdk-dapp](https://www.npmjs.com/package/@multiversx/sdk-dapp) v5, demonstrating:

- wallet authentication (browser extension, xPortal / WalletConnect, web wallet, Ledger)
- transaction signing, sending, and tracking
- message signing and native auth
- smart-contract interaction (a Ping-Pong contract)
- **how to bridge sdk-dapp's framework-agnostic store into Angular services and RxJS observables** (sdk-dapp ships React hooks, but its store works in any framework)

> **Looking for another framework?** The same dApp exists for React (TS and JS), Next.js, Vue, SolidJS, and React Native — see [Other templates](#other-templates).

## Requirements

- Node.js 24
- pnpm 11 (the repo ships a `pnpm-lock.yaml`, and `angular.json` sets the CLI package manager to pnpm — use pnpm, not npm or yarn)

> pnpm blocks native postinstall build scripts by default; the allowlist (`esbuild`, `keccak`, `protobufjs`, ...) lives in `pnpm-workspace.yaml` under `allowBuilds`. Without it, `pnpm install` exits non-zero and `ng build` / `ng test` fail.

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the dev server on the desired network

```bash
pnpm start-devnet     # or start-testnet / start-mainnet
```

Open [https://localhost:4200](https://localhost:4200) (note **https** — the dev server runs with SSL enabled, because wallet providers only work on secure origins; accept the browser warning). The app reloads automatically when source files change.

### 3. Build for production

```bash
pnpm build-devnet     # or build-testnet / build-mainnet
```

The build artifacts go to the `dist/` directory.

## Available scripts

| Script | Description |
| --- | --- |
| `pnpm start-devnet` / `start-testnet` / `start-mainnet` | Dev server on `https://localhost:4200` with the matching network configuration |
| `pnpm build-devnet` / `build-testnet` / `build-mainnet` | Production build to `dist/` with the matching network configuration |
| `pnpm test` | Unit tests (Karma + Jasmine, Chrome) |
| `pnpm watch` | Rebuild on change (development configuration) |
| `pnpm preview` | `ng serve --ssl` with the default configuration |

There is no lint script or e2e setup configured in this template. Angular CLI scaffolding is available as usual (`ng generate component ...`).

## Network configuration

There is **no `.env` file**. The network is selected at build time via Angular build configurations and file replacements (`angular.json`):

- `development` (default for `serve`) → `src/environments/environment.ts` (devnet)
- `testnet` → replaces it with `src/environments/environment.testnet.ts`
- `production` (default for `build`) → replaces it with `src/environments/environment.prod.ts` (mainnet)

Each environment file exports `API_URL`, `contractAddress`, and `environment` (an `EnvironmentsEnum` value), and spreads `src/environments/shared.ts` (native auth flag, WalletConnect project ID, batch-transaction samples).

`src/main.ts` imports `environment` from `./environments/environment` and passes `environment.environment` to sdk-dapp's `initApp`, so the file-replacement mechanism is the single source of truth for the network.

## Project structure

```
src/
├── app/
│   ├── components/      # reusable presentational components (button, card, header, footer, ...)
│   ├── dashboard-page/  # authenticated dashboard page
│   ├── unlock-page/     # wallet connect page
│   ├── guards/          # AuthRedirectGuard (route gating)
│   ├── services/        # MultiversXCoreService, AuthService, PingPongService, base classes, error handler
│   ├── widgets/         # dashboard feature widgets (account, native-auth, ping-pong-raw, sign-message)
│   ├── app.config.ts    # routes + global error handler registration
│   └── app.ts           # shell: Header + router-outlet + Footer
├── environments/        # per-network configs (see Network configuration)
├── main.ts              # entry: loads polyfills, awaits initApp(...), then bootstrapApplication
└── polyfills.ts         # window.Buffer / process / global for the MultiversX SDKs
```

## How sdk-dapp is used

1. **Bootstrap** — `src/main.ts` loads the Node polyfills, calls `initApp(...)` (environment from the active environment file), and bootstraps the Angular application only after it resolves.
2. **Centralized SDK access** — components never call the SDK directly. `MultiversXCoreService` (`src/app/services/multiversx-core.service.ts`) is the single wrapper: it subscribes to sdk-dapp's store and exposes account, network, and login state as RxJS `BehaviorSubject`s / `*$` observables, builds `Transaction` objects, and yields the active provider.
3. **Login** — the unlock page opens sdk-dapp's `UnlockPanelManager`, which lists all available providers. `AuthRedirectGuard` redirects logged-in users away from `/unlock` and unauthenticated users away from `/dashboard`.
4. **Transactions** — `PingPongService` shows the canonical flow: build `Transaction`s via `MultiversXCoreService.createTransaction`, sign with the provider, then `TransactionManager.getInstance().send()` → `.track()` for toast notifications.
5. **Error handling** — all errors funnel through `GlobalErrorHandlerService` (registered as Angular's `ErrorHandler`), with typed categories and severities.

## Testing

Unit tests run with Karma + Jasmine in Chrome:

```bash
pnpm test                              # all specs
ng test --include='**/app.spec.ts'     # a single spec file
```

## Other templates

The same template dApp is implemented across several frameworks. If another stack suits your project better, start from one of these instead:

| Template | Stack | Repository |
| --- | --- | --- |
| React (TypeScript) | React 18 · TypeScript · Vite | [mx-template-dapp](https://github.com/multiversx/mx-template-dapp) |
| React (JavaScript) | React 19 · JSX · Vite | [mx-template-dapp-reactjs](https://github.com/multiversx/mx-template-dapp-reactjs) |
| Next.js | Next.js 16 (App Router) · TypeScript | [mx-template-dapp-nextjs](https://github.com/multiversx/mx-template-dapp-nextjs) |
| SolidJS | SolidJS · TypeScript · Vite | [mx-template-dapp-solidjs](https://github.com/multiversx/mx-template-dapp-solidjs) |
| Vue | Vue 3 · TypeScript · Vite | [mx-template-dapp-vue](https://github.com/multiversx/mx-template-dapp-vue) |
| Angular **← this repo** | Angular 20 · TypeScript | [mx-template-dapp-angular](https://github.com/multiversx/mx-template-dapp-angular) |
| React Native | React Native | [mx-template-dapp-react-native](https://github.com/multiversx/mx-template-dapp-react-native) |

## Links

- [@multiversx/sdk-dapp on GitHub](https://github.com/multiversx/mx-sdk-dapp) · [on npm](https://www.npmjs.com/package/@multiversx/sdk-dapp)
- [MultiversX developer docs](https://docs.multiversx.com/)
- [Angular CLI reference](https://angular.dev/tools/cli)
