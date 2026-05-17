# Frontend Architecture (Angular E-commerce)

## Goals

- Keep a feature-first structure while the app moves from prototype screens to backend-driven flows.
- Separate route orchestration, feature state, and reusable UI without adding heavyweight layers.
- Make the current hybrid state explicit: shopper flows are mostly API-backed, while some admin/content areas still use mocks or static content.

## Runtime Baseline

- Angular `21.1.x`
- `bootstrapApplication(...)`
- `provideZonelessChangeDetection()`
- `provideRouter(routes)`
- `provideHttpClient()`
- Standalone components only
- Signals / computed for most local and feature state
- Template-driven forms
- Tailwind utility classes

## Current Source Shape

```text
src/
  app.component.ts
  app.routes.ts
  core/
    api/
      api.config.ts
      api-endpoints.ts
    guards/
      admin.guard.ts
      auth.guard.ts
    models/
    mock-data/
  features/
    admin/
      components/
      data-access/
    auth/
      components/
      data-access/
    catalog/
      components/
      data-access/
    checkout/
      components/
      data-access/
    commerce/
      data-access/
    content/
      data-access/
    home/
      components/
      data-access/
    orders/
      components/
    product/
      components/
      data-access/
    search/
      components/
      data-access/
  shared/
    components/
  testing/
```

## Responsibility Split

- `core/api`: base URL config and typed endpoint builders.
- `core/guards`: route access decisions that depend on auth/session state.
- `core/models`: shared frontend domain types and DTO mapping helpers.
- `core/mock-data`: seeded static data still used by non-integrated or prototype-heavy areas.
- `features/*/components`: route shells and feature-specific UI.
- `features/*/data-access`: signals, computed state, HTTP calls, and feature orchestration.
- `shared/components`: cross-route shell and reusable UI.
- `testing`: shared test helpers for repeated HTTP/bootstrap flows.

## Dominant Patterns

### Feature-first structure

- New code lives under `features/<domain>`.
- Shared shell/UI stays under `shared/components`.
- Cross-cutting config and domain helpers stay in `core`.

### API-backed facades and stores

- `auth.facade.ts` handles session restore, login, register, and email confirmation through real API endpoints.
- `catalog.store.ts`, `category-page.facade.ts`, `product-detail.facade.ts`, and `checkout.facade.ts` are HTTP-backed and expose signal state to components.
- `api-endpoints.ts` is the single place that assembles frontend endpoint URLs.

### Hybrid state during migration

- Search derives from the catalog store and filters client-side.
- Some admin/dashboard data still comes from `core/mock-data`.
- Static content and layout sections are still embedded directly in components where the backend contract is not finalized yet.

### Route shell + presentational children

- `search-results.component.ts` is the route shell, with chips/filter/content split into smaller children.
- `header.component.ts` is the app-shell entry point, with navigation, search, actions, and cart split into child components.
- `app.component.ts` is responsible for cross-app bootstrapping such as session restore and cart bootstrap after authentication.

### Routing status

- Routes are currently declared directly in `app.routes.ts` and use eager component imports.
- This is acceptable for the current size, but admin/policies/search are candidates for future lazy loading if bundle size or startup cost grows.

## Import Convention

- Use `@/` alias imports for cross-feature or cross-layer imports.
- Keep relative imports for same-folder files.

## Testing Strategy

- Test scope stays intentionally lightweight and behavior-focused.
- Route shells get smoke tests and targeted interaction coverage where regressions are likely.
- Stores/facades get contract tests for query, filtering, cart, checkout, and bootstrap flows.
- HTTP-backed units use `HttpTestingController`.
- Tests run through `ng test`.

## What This Architecture Is Not

- It is not a clean-architecture or use-case/repository layering exercise.
- It is not NgRx-based global state management.
- It is not fully API-complete end to end yet because admin still contains mock-backed areas.
- It is not lazy-loaded by default today.

## Near-term Guidance

1. Keep extracting oversized inline templates into companion HTML files before adding more behavior.
2. Prefer fixing async/change-detection boundaries over disabling `OnPush` as a default response.
3. Continue replacing admin mock state with real API-backed data access behind the existing feature folders.
4. Add coverage first around auth and admin before larger refactors in those areas.
5. Introduce lazy loading only after the route boundaries are stable enough to make chunking worthwhile.
