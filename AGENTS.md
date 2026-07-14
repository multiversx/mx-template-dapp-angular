# AGENTS.md — mx-template-dapp-angular

Guidance for AI agents (and humans) working with code in this repository.

## Overview

A template dApp built on Angular 20 (standalone components, zone.js change detection) that demonstrates MultiversX wallet authentication and transaction signing via `@multiversx/sdk-dapp`. It implements a Ping-Pong smart contract flow plus widgets for native-auth, message signing, and account info.

## Commands

Package manager is **pnpm** (there is a `pnpm-lock.yaml`, and `angular.json` sets `cli.packageManager` to `pnpm`).

```bash
pnpm start-devnet          # dev server on https://localhost:4200 (devnet config)
pnpm start-testnet         # dev server, testnet config
pnpm start-mainnet         # dev server, production/mainnet config
pnpm build-devnet          # build, output to dist/ (also: build-testnet, build-mainnet)
pnpm test                  # run all unit tests (Karma + Jasmine, Chrome)
ng test --include='**/app.spec.ts'   # run a single spec file
```

The dev server runs over **HTTPS/SSL** (`angular.json` → `serve.options.ssl: true`); wallet providers require it. There is no lint or e2e setup configured.

## Environment / network configuration

- Network is selected at **build time** via Angular configurations (`development`=devnet, `testnet`, `production`=mainnet), which file-replace `src/environments/environment.ts` with the matching variant.
- `src/environments/shared.ts` holds config common to all networks (native-auth flag, WalletConnect project ID, batch-transaction SC samples). Per-network files spread `...sharedConfig` and override `API_URL`, `contractAddress`, `environment`.
- The SDK itself is initialized **once** in `src/main.ts` via `initApp(...)` *before* `bootstrapApplication`. `main.ts` imports `environment` from `./environments/environment` and passes `environment.environment` to `initApp`, so the Angular file-replacement mechanism drives the SDK network too — a single source of truth.

## Architecture

### SDK access is centralized, never called directly from components

`MultiversXCoreService` (`services/multiversx-core.service.ts`, root-provided) is the single wrapper around `@multiversx/sdk-dapp`. It owns account info, network config, and login state as `BehaviorSubject`s exposed as `*$` observables (plus synchronous `getCurrent*()` getters). It also builds `Transaction` objects (`createTransaction`) and yields the provider (`getProvider`). New code that needs account/network/provider data should depend on this service rather than importing SDK methods directly.

SDK imports use deep paths like `@multiversx/sdk-dapp/out/methods/...` — follow that existing convention; there is no barrel export.

### Reactive state base classes

Services and components extend shared abstract bases instead of reimplementing state/cleanup:

- `BaseStoreSubscriptionService` / `BaseStoreSubscriptionComponent` (`base-store-subscription.service.ts`) — subscribe to the SDK store via `getStore().subscribe(...)` and call the abstract `onStoreChange()` on every store mutation; auto-unsubscribe in `ngOnDestroy`. This is how the app reacts to wallet/account changes. `MultiversXCoreService` extends the service variant and refreshes its subjects in `onStoreChange()`.
- `BaseReactiveStateService` / `BaseReactiveStateComponent` (`base-reactive-state.service.ts`) — provide `loadingState$` / `error$` subjects and `executeWithLoading` / `executeWithState` wrappers that run an async op while managing loading + routing errors through the global handler.

### Error handling

All errors funnel through `GlobalErrorHandlerService` (`services/global-error-handler.service.ts`), registered as Angular's `ErrorHandler` in `app.config.ts`. Use its typed helpers (`handleAppError` with `ErrorCategoryEnum`/`ErrorSeverityEnum`, plus `handleBlockchainError`, `handleAuthError`, `handleValidationError`) rather than raw `throw`/`console.error`. Helpers in `base-reactive-state-helpers.ts` categorize/severity-rank errors automatically.

### Transaction flow

See `PingPongService` (`services/ping-pong.service.ts`) for the canonical pattern: build `Transaction`s via `MultiversXCoreService.createTransaction`, then in `signAndSendTransactions` use the provider to `signTransactions`, `TransactionManager.getInstance().send(...)`, and `.track(...)` for toast lifecycle. VM queries hit `${apiUrl}/vm-values/query` over `HttpClient` and decode base64→hex→`BigNumber`.

### Routing & auth gating

Routes are defined inline in `app.config.ts` using `RouteNamesEnum` (`route-names.enum.ts`). `AuthRedirectGuard` (`guards/`) guards both the unlock and dashboard routes: it redirects logged-in users away from `/unlock` and unauthenticated users away from `/dashboard` (routes opt in to auth via `data: { requireAuth: true }`). Login state comes from `AuthService`, a thin facade over `MultiversXCoreService`.

### UI structure

- `App` (`app.ts`) is the shell: `HeaderComponent` + `<router-outlet>` + `FooterComponent`.
- Pages: `unlock-page` (connect) and `dashboard-page` (authenticated content).
- `components/` holds reusable presentational pieces (button, card, label, format-amount, mx-link, etc.); `widgets/` holds feature blocks shown on the dashboard (`ping-pong-raw`, `sign-message`, `native-auth`, `account`). Both have barrel `index.ts` files.
- Styling is Tailwind CSS 3 (`tailwind.config.js`, processed via `postcss.config.js` + autoprefixer).

## Node polyfills (important for builds)

MultiversX SDKs depend on Node built-ins in the browser. The build uses Angular's `@angular/build:application` (esbuild) builder — there is **no** user `vite.config.ts` (Angular bundles its own vite internally and never reads a root config). Polyfilling is wired in three places that must stay consistent:

- `package.json` `browser` field maps `crypto`/`stream`/`path`/`util`/`process` to `*-browserify` shims.
- `src/polyfills.ts` sets `window.Buffer`/`process`/`global`; it is loaded first in `main.ts` and listed in `angular.json` polyfills for **both** the `build` and `test` (karma) targets — the test target needs it too, since specs that touch the SDK pull in `keccak` which requires `process`.
- `angular.json` `allowedCommonJsDependencies` whitelists the CommonJS deps (buffer, browserify shims, lodash.* submodules) to silence build warnings.

When adding an SDK feature that pulls in a new Node built-in, update all of these together.

## Tooling notes

- pnpm 11 blocks native build scripts by default. Allowed builds (esbuild, keccak, protobufjs, lmdb, msgpackr-extract, @parcel/watcher) are enabled via the `allowBuilds` map in `pnpm-workspace.yaml`; without it `pnpm install` exits non-zero and `ng build`/`ng test` fail their pre-build dependency check.

## Verification

To prove a change works, run in order:

```bash
pnpm test                # Karma + Jasmine (needs Chrome)
pnpm build-devnet        # production build must succeed
```

For login/transaction changes, start `pnpm start-devnet`, open `https://localhost:4200`, and exercise the flow manually. To verify network switching, run `pnpm start-testnet` and confirm the app reports the testnet.

## Other templates

The same template dApp exists for other frameworks — useful when a task actually targets a different stack:

| Template | Stack | Repository |
| --- | --- | --- |
| React (TypeScript) | React 18 · TypeScript · Vite | [mx-template-dapp](https://github.com/multiversx/mx-template-dapp) |
| React (JavaScript) | React 19 · JSX · Vite | [mx-template-dapp-reactjs](https://github.com/multiversx/mx-template-dapp-reactjs) |
| Next.js | Next.js 16 (App Router) · TypeScript | [mx-template-dapp-nextjs](https://github.com/multiversx/mx-template-dapp-nextjs) |
| SolidJS | SolidJS · TypeScript · Vite | [mx-template-dapp-solidjs](https://github.com/multiversx/mx-template-dapp-solidjs) |
| Vue | Vue 3 · TypeScript · Vite | [mx-template-dapp-vue](https://github.com/multiversx/mx-template-dapp-vue) |
| Angular **← this repo** | Angular 20 · TypeScript | [mx-template-dapp-angular](https://github.com/multiversx/mx-template-dapp-angular) |
| React Native | React Native | [mx-template-dapp-react-native](https://github.com/multiversx/mx-template-dapp-react-native) |
