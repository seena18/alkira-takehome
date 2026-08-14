# Design decisions

Each entry is a decision, why it was made, what was rejected, and the cost.
Written as it was built, so the reasoning is the real reasoning.

---

## Stack

### Vite

Native ESM dev server, so startup and HMR do not degrade as the app grows; one
Rollup config for production. It is also the toolchain the React docs now point
to.

- **Rejected — Create React App:** deprecated, and it drags in webpack-4-era
  config that has to be explained the moment anything breaks.
- **Rejected — Next.js:** SSR, API routes, and server components would all go
  unused here. Shipping a server runtime for an app with no server invites a
  question with no good answer.
- **Cost:** dev uses esbuild and production uses Rollup, so a dev/build
  divergence is possible. Mitigated by keeping `npm run build` in the
  verification loop rather than trusting the dev server.

### TypeScript, with `strict` on

Access control is a types problem. `type Role = 'viewer' | 'editor'` turns a
typo'd role into a compile error, and a discriminated union on auth state
(`anonymous | awaitingMfa | authenticated`) makes it impossible to read `user`
before MFA has passed — which is the exact bug an MFA flow exists to prevent.

Note that the Vite template does not enable `strict`; it was added deliberately.

- **Rejected — JS with JSDoc:** editor hints without enforcement.
- **Cost:** more ceremony than a ten-file app strictly needs.

### react-hook-form + zod

RHF keeps inputs uncontrolled, so typing in one field does not re-render the
form, and it provides `errors` / `touchedFields` / `isSubmitting` — which is most
of the "clear error messages" requirement, including the question of *when* an
error should appear. Zod makes the schema the single source of truth for both the
validation rules and the TypeScript type (`z.infer`), so the two cannot drift.

- **Rejected — hand-rolled validation:** genuinely adequate for two fields, but
  validation, touched state, and submit state all end up hand-managed and tangled
  with rendering, and the type must be maintained separately from the rules.
- **Rejected — Formik + Yup:** the previous generation's pick; more re-renders
  and weaker type inference.
- **Cost, stated plainly:** two dependencies for two fields is over-tooled *for
  this app*. The argument is what scales and what survives code review, not what
  is minimal for the current file count.

### Tailwind v4 for styling

A styling framework rather than a component kit: it removes the raw-CSS grind
while every design decision stays mine. Variants like `disabled:` and
`focus-visible:` also cover the accessibility states the role-gating hinges on.

- **Rejected — MUI / Chakra:** fastest route to a polished dashboard, but in an
  app this small the UI is most of the work, and a component kit would outsource
  it wholesale.
- **Rejected — CSS Modules:** perfectly good; every state and responsive rule
  becomes hand-written.
- **Cost:** noisy markup, and "why not plain CSS?" is a fair question. For a solo
  app this size, plain CSS would also have been right.

---

## Structure

### `BrowserRouter` lives in `main.tsx`, not in `App`

A component can only sit inside one router, so whichever file owns
`<BrowserRouter>` is the file tests cannot reuse. With the router hoisted,
`App` mounts inside a `MemoryRouter` and the whole flow is driven by URL — see
`src/App.test.tsx`.

- **Rejected — router inside `App`:** one less file to read, but it welds the app
  to browser history and forces route components to be tested individually
  instead of testing the transitions between them.
- **Cost:** reading `App.tsx` alone does not reveal that it is inside a router.

### Feature folders

```
src/
  features/auth/         login, MFA, sign-up
  features/connectors/   the protected screen
  components/            shared and feature-agnostic
  lib/                   types, mock users, permission checks
  test/                  test setup
```

The rule is: a feature may import from `components/` and `lib/`, never from
another feature. That is one sentence, it is checkable by reading imports, and it
means removing a feature is `rm -rf`. Anything two features both need gets
promoted to `lib/` as a deliberate, reviewable act.

- **Rejected — `pages/ components/ hooks/ utils/`:** groups files by what they
  *are*, which is the one attribute that never helps in finding them.
- **Rejected — a `@/` path alias:** convenient, but relative imports make a
  cross-feature violation visible — `../auth/` inside a connectors file is an
  obvious smell.
- **Cost:** at this size the split feels ceremonial and leaves near-empty folders.

### Every step of the flow has its own URL

`/login`, `/mfa`, `/signup`, `/connectors`. The URL is the state machine: each
state is independently linkable, testable, and guardable. Making `/mfa` a real
route also forces the question "what happens if someone deep-links here?", and
the answer to that is the second guard.

- **Rejected — MFA as local `step` state or a modal on `/login`:** the
  half-authenticated state then hides inside a component, invisible to the router
  and with undefined behaviour on refresh. That transition is the heart of an
  MFA flow, so it should be first-class.
- **Rejected — `createBrowserRouter` + `RouterProvider`:** react-router 7's
  recommended API, and the right call if there were loaders and actions to use.
  With no server to fetch from, it would only move route config into `main.tsx`
  and make the table harder to mount in tests.
- **Cost:** two guards instead of one, plus an edge case where a user reaches
  `/mfa` with no pending login. Paying it is the point: those cases exist
  whether or not the code names them, and a named state can be tested.

### Unknown URLs redirect to `/login` instead of rendering a 404

The only public surface is authentication, so the useful answer to an unknown URL
from a logged-out visitor is the sign-in screen. `replace` keeps the bad URL out
of the back button.

- **Rejected — a real 404 page:** correct for a content site; here it is a screen
  that would be built, styled, and never shown.

---

## Styling details

### The token layer is deferred until there is UI to design against

Tailwind is wired up, but `src/index.css` carries no `@theme` block yet. An
earlier attempt defined a full palette before a single form existed; every value
in it was a guess, since there was nothing on screen to judge contrast or
hierarchy against. It was removed rather than kept as decoration.

The two decisions below are the *intended* approach, and are applied when the
login form is built.

### Tokens are named by role, not by value

`bg-surface`, `text-muted`, `border-line` — never `bg-white`, `text-gray-500`.
A palette change then never means renaming class names in components.

### Dark mode redefines variables instead of using `dark:` classes

Tailwind compiles `bg-surface` to `background-color: var(--color-surface)`, so
overriding that variable inside `@media (prefers-color-scheme: dark)` re-themes
the entire app. No component contains a single `dark:` class, which means nothing
can be left half-themed.

- **Rejected — per-element `dark:` variants:** the common approach, but it is two
  decisions per element and one of them is always missed somewhere.
- **Cost:** dark mode follows the OS with no in-app toggle. Adding one means a
  `[data-theme]` selector alongside the media query.

---

## Testing

### Vitest config lives in `vite.config.ts`

One config means tests resolve modules exactly the way the app does. A separate
`vitest.config.ts` can drift, and then tests pass against a different module
graph than the one that ships.

- **Rejected — Jest:** needs a transform pipeline Vite already solves, plus a
  second module resolver.
- **Rejected — Playwright / Cypress:** the right tool for a login flow in a real
  product; here RTL makes the same assertions in-process for far less setup.

### `css: false` in the test config

Tests assert behaviour and ARIA state, never computed styles. This is deliberate:
the read-only role must be provable through `toBeDisabled()` and `aria-disabled`,
which is also what a screen reader consumes. A test that could pass on grey
pixels alone would be testing the wrong thing.

### `globals: true`

Less import noise, and it matches most Testing Library examples. The trade-off is
explicitness, plus a `types` entry in `tsconfig.app.json`. Vitest's own docs
mildly prefer explicit imports.

---

## Scope

### Sign-up is a deliberate stub

The requirements call for a sign-up flow that navigates to a separate screen and
explicitly leave registration out of scope. The screen exists and is reachable;
it does not create users.

### The protected screen shows network connectors

Alkira's product is multi-cloud networking, and a connector is what attaches a
VPC, a VNet, or a branch site to the network. Modelling that instead of a generic
item list costs nothing and makes the role story concrete: a viewer can audit
connectors but cannot change routing.

Kept deliberately shallow — name, cloud, region, CIDR, status — so no claim is
made about how connectors actually behave.

---

## The limitation that matters most

**None of this is security.** Every check here is client-side and therefore
advisory: the bundle can be edited, and there is no server to refuse anything.
Real enforcement belongs on the server, on every request. The purpose of the
client-side guard is to avoid showing users doors they cannot open.
