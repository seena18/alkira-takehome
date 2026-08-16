# Plan

The work is cut into slices, each small enough to reason about on its own.
A slice is done when the build, tests, and lint are green and it is committed.

Method for every slice: design stated in plain language first (what was chosen,
what was rejected, why), then code. The reasoning lands in [DECISIONS.md](DECISIONS.md)
as it happens, not reconstructed afterwards.

Screens are built behaviour-first and unstyled; one visual pass (slice 7) styles
the finished app, so the design tokens are chosen against the full inventory of
real UI — every form, table, and state — rather than extrapolated from the first
screen. The pass sits before the test and README slices, never squeezed against
the deadline, and after the markup it styles exists.

| # | Slice | Scope | Status |
|---|-------|-------|--------|
| 1 | Scaffold + routing | Vite/TS setup, routing table, test harness | ✅ |
| 2 | Mock users + roles | Role/User types, mock backend, permission checks | ✅ |
| 3 | Login form | Email + password with validation and error timing | ✅ |
| 4 | MFA step | Mock OTP; the state machine around it is the real work | ✅ |
| 5 | Route guards | Protect by auth state, including the half-authenticated one | ✅ |
| 6 | Protected screen | Connector list; edit actions gated by capability | ✅ |
| 7 | Visual pass | Design tokens, shared layout, styling for every screen | ✅ |
| 8 | Test pass | Fill gaps: full flow, guard edges, role matrix | ✅ |
| 9 | README + demo | Setup, credentials, decisions, limitations, recording | ☐ |

Principles fixed up front:

- Two roles only (viewer, editor), as the requirements specify — no invented
  third role.
- Sign-up is a navigable stub; registration is explicitly out of scope.
- Mock the data, never the state transitions: fake users and a fixed OTP are
  fine, but every transition (login, MFA, logout, refresh, deep link) must
  behave defensibly.
- Client-side access control is a usability layer. Real enforcement belongs to
  a server; this app has none, and no check here pretends otherwise.
