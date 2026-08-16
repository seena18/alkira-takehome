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

## Auth state

### A three-state machine, not a bag of flags

```ts
type AuthState =
  | { status: 'anonymous' }
  | { status: 'awaitingMfa'; user: User }
  | { status: 'authenticated'; user: User }
```

`user` does not exist on `anonymous`, so with `strict` on, reading a user the
flow has not earned is a compile error, not a runtime crash. The alternative —
`user: User | null` plus an `mfaDone` boolean — can represent four states, one
of which (no user, MFA "done") is nonsense that every consumer would have to
remember never to create.

The reducer is pure and defends its transitions: `MFA_VERIFIED` from any state
but `awaitingMfa` returns the state unchanged, so no sequence of dispatches can
skip the password step. Being pure, that rule is pinned by plain unit tests with
no React involved (`authReducer.test.ts`).

- **Rejected — async logic in the provider:** the context exposes `state` and
  `dispatch` only. The async work (calling the auth API, pending and failure UX)
  belongs to the form that triggers it; action-creator indirection for three
  transitions buys nothing.
- **Cost:** two files and a custom hook where a `useState` would superficially
  do. The compile-time guarantee is what the cost buys.

### Why not Redux

The design above *is* Redux minus the store: a pure reducer over a typed action
union, tested in isolation. What Redux adds — a global store, middleware,
devtools, selectors across many slices — solves coordination between many
independent writers, and this app has one writer (the auth flow) and three
transitions. Adopting it here would be dependency without a problem to spend it
on. If the app grew more state domains with cross-cutting writers, the migration
is mechanical: `configureStore({ reducer: { auth: authReducer } })` and the
reducer file moves unchanged — nothing about the current shape would need
rethinking, because it is already reducer-shaped.

### Auth state is in memory only — refresh logs you out

Deliberate, not an omission. The half-authenticated `awaitingMfa` state has no
business surviving a reload, and persisting any auth state in localStorage would
imitate a session guarantee a client cannot make. A real implementation holds a
short-lived MFA-pending token server-side; this one keeps the honest version of
that: state lives exactly as long as the tab does.

---

## The login form

### Error timing: silent, then on blur, then live

A field says nothing while it is being typed into for the first time, validates
when it is left (`mode: 'onTouched'`), and once it has erred, re-validates on
every keystroke so the message disappears the moment the input is fixed. Submit
validates everything and moves focus to the first invalid field.

- **Rejected — validate from the first keystroke:** yells at the user before
  they have finished typing.
- **Rejected — validate only on submit:** cheapest to build, slowest feedback
  loop of the three.

### Native browser validation is disabled

The form sets `noValidate`. With `type="email"`, the browser would otherwise
show its own tooltip before the schema ever runs — two competing styles of
error message on one field.

### Credential failure is one form-level message

"Invalid email or password", rendered in a `role="alert"` region so it is
announced, never attached to either field. The auth API returns the same `null`
for a wrong email and a wrong password precisely so the UI cannot know — and
therefore cannot leak — which half was wrong.

### Tests can seed auth state through the provider

`AuthProvider` accepts an optional `initialState`, used only by tests to mount
the tree mid-flow — at `/mfa` with a login already pending, say — instead of
click-driving every test through the whole preceding flow. The app itself never
passes it; production always starts anonymous.

### Form tests mount the whole app

`LoginPage.test.tsx` renders `<App />` at `/login` instead of the page in
isolation, so success is asserted the way a user experiences it: the URL moves
on and the MFA screen appears. Testing "dispatch was called with the right
action" would pass even if the routing were broken.

---

## The MFA step

### The screen defends itself from both directions

Anonymous visitors at `/mfa` have nothing to verify and are sent back to login;
already-authenticated ones are done and sent forward to connectors. Only the
`awaitingMfa` state renders a form. Both redirects are declarative
(`<Navigate replace>`), so no hook ever runs against a state it was not written
for.

"Use a different account" only dispatches `LOGOUT` — no navigation call. State
returns to anonymous and the redirect at the top of the component does the rest:
the router follows the state machine, never the other way around.

### One code input, not six boxes

The six-box OTP input is a focus-management minefield — paste, backspace, and
screen readers all need special-casing — for purely visual payoff. One input
with `inputMode="numeric"` and `autoComplete="one-time-code"` is what browsers
autofill real OTPs into.

### Same form idiom as login

One field does not need react-hook-form, but a second form pattern in the same
app is a cost with no payoff: same schema-as-source-of-truth, same error
timing, same `role="alert"` for the backend's verdict. Format ("that is not six
digits") is checked client-side; correctness is the backend's question.

### The demo hint is on screen

The MFA screen prints the accepted code, rendered from the same constant the
mock backend checks against, so the two cannot drift. A mock second factor
secures nothing — hiding its code would only make the app tedious to explore,
while pretending to a security property it does not have.

---

## The route guard

### Protection is positional

`<ProtectedRoute>` wraps a route group in `App.tsx`; anything nested inside is
guarded because of where it sits, not because someone remembered a check. The
routing table stays the single place to audit what is protected, and the guard
blocks *mount* — no protected component ever renders, and no effect ever fires,
in an unauthorized state.

### The guard demands `authenticated`, not "a user exists"

`awaitingMfa` has a user — one that has not finished proving who they are. A
guard written as `if (user)` waves that state through, which is precisely the
bug the three-state machine exists to prevent. Half-done visitors are sent to
`/mfa` to resume (their password was correct; discarding it would punish the
interruption), not to `/login` to start over.

- **Rejected — remembering the intended destination** (the location-state
  `from` pattern): with exactly one protected destination, its behaviour is
  identical to the hardcoded flow. It earns its complexity the moment a second
  protected page exists, and the guard's comment says so.

---

## The protected screen

### Edit actions are disabled for read-only users, not hidden

Disabling communicates "this capability exists; your role lacks it" — the
boundary between the two roles stays visible on the screen itself, and a
"Read-only access" line in the header says the same thing in words, for
everyone, including screen-reader users who will not tab onto disabled buttons.

Hiding is the right call for features that should be *secret*. A permission
boundary the user is meant to understand is the opposite of a secret.

### Creation is hidden — the deliberate exception

The "+ Add connector" button does not render without the `connector:create`
capability, while row actions stay visible-but-disabled. The distinction: row
actions communicate a boundary on things the viewer can already see, and a
disabled Edit next to a row explains itself. Creation is a workflow the viewer
does not have at all — a permanently dead primary button reads as broken, not
gated. One screen demonstrates both patterns, each where it belongs.

### The UI asks capabilities, never roles

`can(user, 'connector:edit')` appears in exactly two expressions; no JSX ever
inspects `user.role`. Even the access badge derives from the capability answer,
so if policy changes in `lib/permissions.ts`, this screen is already correct.

### Actions mutate component state, not a fake backend

Delete removes the row; Edit renames inline (plain controlled state — a
one-field rename does not need the form library). Changes live and die with the
tab, like everything else here. A read/write role whose buttons did nothing
would demo identically to read-only; one that "persisted" to localStorage would
pretend to a durability the app does not have.

### The unreachable state renders nothing

The guard means the screen can never mount unauthenticated, but the type system
cannot know that. The narrow at the top returns `null` — honest about being
unreachable, and the compiler gets the `user` it needs.

---

## Styling details

### Every token value comes from the brand spec

The `@theme` block in `src/index.css` implements
`docs/alkira-ui-branding-spec.md`; no colour, radius, or shadow is invented.
The token layer was deliberately left empty until the spec existed — an early
attempt at a palette, guessed before a single form was on screen, was removed
rather than kept as decoration. Styling landed as one pass over the finished
app (slice 7 in PLAN.md), so every value was chosen against the full inventory
of real UI: two forms, a table, alerts, badges, disabled states.

### Tokens are named by role, not by value

`bg-surface`, `text-muted`, `border-line` — never `bg-white`, `text-gray-500`.
A palette change then never means renaming class names in components.

### One light theme, no dark mode

The brand spec defines a single look — navy rail, light workspace — and
deriving an unsanctioned dark palette would be guesswork presented as design.
Because every utility compiles to `var(--color-…)`, a specified dark theme
would later be a variable override under a media query, touching no component.

### Repeated controls are component classes; layout stays utilities

`.field-input`, `.btn`, `.badge`, `.alert` live in one `@layer components`
block, lifted from the spec's control sections, because the same control
appears on three screens and its states (focus ring, error border, disabled
opacity) should be impossible to half-apply. Everything single-use — layout,
spacing, one-off type — stays as inline utilities where it can be read in
place.

### Mobile tables scroll sideways instead of stacking into cards

The spec allows stacked cards below 768px. The CSS-only version
(`display: block` on table elements) destroys table semantics for screen
readers unless every role is manually restored; duplicated card markup is a
second render path to keep correct. A scroll container keeps real semantics at
the cost of a sideways scroll on phones — the honest trade at this scope, and
the primary action stays visible either way.

### The nav rail is honest about being a shell

Only "Resources" is a real destination. The other rail items render disabled
with a "not part of this demo" title rather than as live-looking links — a rail
of one icon would not read as a product shell, but enabled links to nowhere
would be doors painted on a wall.

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
