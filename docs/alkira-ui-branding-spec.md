# Alkira UI / Branding Kit Specification

**Purpose:** Visual system for the Alkira UI Developer take-home  
**Scope:** UI styling, layout, components, branding, states, and responsive behavior only  
**Design direction:** Enterprise cloud networking; precise, calm, technical, restrained

---

# 1. Design Principles

The UI should feel like a small part of Alkira's existing product ecosystem.

Core principles:

- **Structured over decorative**
- **Enterprise over consumer**
- **Clear hierarchy over visual novelty**
- **Dense but readable**
- **Security-conscious**
- **Minimal animation**
- **Borders and spacing before shadows**
- **Brand color used deliberately, not everywhere**

Avoid:

- purple gradients
- glassmorphism
- oversized rounded cards
- pill-shaped primary buttons
- excessive shadows
- giant marketing typography
- playful illustrations
- overly sparse "startup landing page" layouts

---

# 2. Design Reference: Manifest UX

A key visual reference for this specification is **Manifest UX's public Alkira case study**.

Manifest UX describes work with Alkira's founding team on product experiences including the network topology canvas, Cloud Exchange Point (CXP) visualization, policy management, monitoring dashboards, interaction patterns, and the foundation of Alkira's product design system.

Reference:

```text
https://www.manifestux.com/work/alkira-cloud-networking
```

This specification does **not** attempt to reproduce Manifest UX's work pixel-for-pixel. Instead, it uses the public case study as evidence for Alkira's broader visual and interaction language:

- dark enterprise navigation surfaces;
- light operational workspaces;
- restrained use of Alkira blue;
- clear hierarchy for dense infrastructure information;
- thin borders and structured panels;
- compact controls;
- network/topology visualization as a product motif;
- an emphasis on making complex cloud infrastructure understandable.

The intended takeaway is:

> **Complex infrastructure, presented through simple and understandable controls.**

That principle should guide visual decisions throughout the take-home.

---

# 3. Brand Colors

## Primary

```css
--alkira-blue: #2B56F0;
--alkira-blue-hover: #2349D7;
--alkira-blue-active: #1D3FBD;
--alkira-blue-soft: #EEF3FF;
```

Use for:

- primary buttons
- links
- active navigation
- focus states
- selected controls
- informational accents

## Navigation / Dark Surfaces

```css
--alkira-navy: #071B33;
--alkira-navy-hover: #102943;
```

Use for:

- product sidebar
- dark navigation surfaces
- subtle brand contrast

## Neutrals

```css
--canvas: #F6F8FC;
--surface: #FFFFFF;

--text-primary: #1F2937;
--text-strong: #111827;
--text-muted: #667085;
--text-subtle: #98A2B3;

--border: #DDE4EE;
--border-strong: #C8D1DC;
```

## Semantic Colors

```css
--success: #188038;
--success-soft: #ECF8EF;

--warning: #B54708;
--warning-soft: #FFF6E8;

--danger: #D92D20;
--danger-soft: #FFF0EE;
```

## Secondary Brand Accent

```css
--alkira-lime: #E2EF83;
```

Use sparingly.

Do not use lime for primary actions.

---

# 4. Typography

Use:

```css
font-family:
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

## Type Scale

| Style | Size | Weight | Line Height |
|---|---:|---:|---:|
| Auth headline | 32px | 600 | 40px |
| Page title | 28px | 600 | 36px |
| Section title | 18px | 600 | 26px |
| Card title | 16px | 600 | 24px |
| Body | 14px | 400 | 21px |
| Form label | 13px | 500 | 18px |
| Button | 14px | 600 | 20px |
| Metadata | 12px | 400 | 18px |

Typography should feel compact and operational.

Avoid:

- extra-bold headings
- oversized display type
- all-caps headings except tiny metadata labels

---

# 5. Spacing System

Use an 8px base grid.

```text
4px   micro
8px   xs
12px  compact
16px  sm
24px  md
32px  lg
48px  xl
64px  2xl
```

Recommended:

- field label → input: 8px
- input → error text: 6–8px
- form field → next field: 20–24px
- heading → supporting copy: 8px
- section → section: 32px
- card padding: 20–24px
- page padding desktop: 32px
- page padding mobile: 20px

---

# 6. Radius

```text
Input:   6px
Button:  6px
Card:    8px
Modal:   10px
Badge:   999px
```

Do not use 16–24px card radii.

---

# 7. Borders and Shadows

## Borders

```css
border: 1px solid #DDE4EE;
```

Strong separator:

```css
border: 1px solid #C8D1DC;
```

## Shadows

Use minimally.

```css
--shadow-card: 0 1px 2px rgba(16, 24, 40, 0.04);
--shadow-modal: 0 12px 32px rgba(16, 24, 40, 0.12);
```

Cards should mostly rely on border + surface contrast.

---

# 8. Auth Layout

## Desktop

Two-column layout:

```text
┌──────────────────────┬──────────────────────────────┐
│                      │                              │
│  Alkira brand panel  │       Form panel             │
│  42–45%              │       55–58%                 │
│                      │                              │
└──────────────────────┴──────────────────────────────┘
```

### Brand Panel

```css
background: #2B56F0;
color: white;
padding: 48px 56px;
```

Include:

- Alkira logo / wordmark
- "A Lumen Connect Solution"
- short brand statement
- subtle topology/network decoration

Suggested message:

```text
Secure cloud networking,
without the complexity.

Connect and manage distributed cloud infrastructure
through one secure control plane.
```

### Decorative Network Pattern

Use:

- thin white lines
- small circular nodes
- 8–12% opacity
- no distracting movement

The pattern should suggest network topology, not generic particles.

## Form Panel

```text
Background: #FFFFFF
Max form width: 420px
Vertically centered
```

Recommended structure:

```text
Logo optional
Heading
Supporting copy

Label
Input

Label
Input

Primary button

Secondary action
```

---

# 9. Mobile Auth Layout

Below 768px:

- hide large blue brand panel
- show compact Alkira logo above form
- keep white background
- horizontal padding: 20–24px
- max form width: 420px
- center horizontally
- do not vertically over-center on short screens

---

# 10. Protected Product Layout

The protected screen should shift from marketing-style auth into an Alkira product-shell aesthetic.

Desktop:

```text
┌────────┬────────────────────────────────────────────┐
│        │ Header                                     │
│ Nav    ├────────────────────────────────────────────┤
│ Rail   │ Main workspace                             │
│        │                                            │
│        │                                            │
└────────┴────────────────────────────────────────────┘
```

## Sidebar

```text
Width: 72px
Background: #071B33
```

Use simple line icons.

Suggested items:

- Overview
- Resources
- Policies
- Settings

### Inactive

```css
color: rgba(255,255,255,0.58);
```

### Active

```css
color: #FFFFFF;
background: rgba(43,86,240,0.20);
```

Use a small 4px active indicator or contained icon background.

Avoid a large blue selected pill.

---

# 11. Product Header

```text
Height: 64px
Background: #FFFFFF
Bottom border: #DDE4EE
```

Left:

```text
Network Resources
```

Right:

```text
Role badge
Notification icon
User initials/avatar
Logout menu
```

Keep header dense and utilitarian.

---

# 12. Main Workspace

```css
background: #F6F8FC;
padding: 32px;
```

Page heading:

```text
Network Resources
```

Supporting copy:

```text
View and manage cloud network connections across environments.
```

Layout:

```text
Page heading + action
Summary cards
Resource table/card
```

---

# 13. Cards

Card base:

```css
background: #FFFFFF;
border: 1px solid #DDE4EE;
border-radius: 8px;
padding: 20px 24px;
box-shadow: 0 1px 2px rgba(16,24,40,0.04);
```

Do not:

- use giant shadows
- use gradient backgrounds
- stack too many nested cards

---

# 14. Buttons

## Primary

```css
height: 44px;
padding: 0 16px;
background: #2B56F0;
color: #FFFFFF;
border: 1px solid #2B56F0;
border-radius: 6px;
font-size: 14px;
font-weight: 600;
```

Hover:

```css
background: #2349D7;
```

Active:

```css
background: #1D3FBD;
```

Focus:

```css
box-shadow: 0 0 0 3px rgba(43,86,240,0.14);
```

## Secondary

```css
background: #FFFFFF;
color: #344054;
border: 1px solid #D0D5DD;
```

## Disabled

```css
opacity: 0.5;
cursor: not-allowed;
```

Avoid rounded-pill buttons.

---

# 15. Inputs

Base:

```css
height: 44px;
padding: 0 12px;
background: #FFFFFF;
border: 1px solid #DDE4EE;
border-radius: 6px;
font-size: 14px;
color: #1F2937;
```

Placeholder:

```css
color: #98A2B3;
```

Focus:

```css
border-color: #2B56F0;
box-shadow: 0 0 0 3px rgba(43,86,240,0.14);
outline: none;
```

Error:

```css
border-color: #D92D20;
box-shadow: 0 0 0 3px rgba(217,45,32,0.10);
```

Labels:

```text
13px
500 weight
#344054
```

Error text:

```text
12–13px
#D92D20
```

---

# 16. MFA UI

Use the same auth shell as Login.

Heading:

```text
Verify your identity
```

Supporting copy:

```text
Enter the 6-digit verification code sent to
edi•••@alkira-demo.com
```

OTP layout:

```text
[ 6 ] [ 5 ] [ 4 ] [ 3 ] [ 2 ] [ 1 ]
```

Each cell:

```text
48–52px square
6px radius
1px border
18–20px text
center aligned
```

Focus:

- Alkira blue border
- blue focus ring

Keep:

```text
Verify
Didn't receive a code? Resend
← Back to sign in
```

Avoid treating MFA as a dramatically different screen.

---

# 17. Tables

Resource table styling:

```text
White surface
1px outer border
8px radius
No heavy shadow
```

Header row:

```css
background: #F8FAFC;
color: #667085;
font-size: 12px;
font-weight: 500;
```

Body:

```text
14px
#1F2937
```

Row height:

```text
52–56px
```

Row separator:

```css
border-bottom: 1px solid #EDF1F5;
```

Hover:

```css
background: #FAFBFD;
```

Do not use zebra stripes.

---

# 18. Status Indicators

Use dot + label.

Healthy:

```text
● Healthy
```

```css
color: #188038;
```

Needs attention:

```text
● Needs attention
```

```css
color: #B54708;
```

Do not rely on color alone.

---

# 19. Role UI

## Read/Write

Badge:

```text
Editor
```

Style:

```css
background: #EEF3FF;
color: #2B56F0;
```

Actions visible:

```text
+ Add resource
Edit
```

## Read-Only

Badge:

```text
Read only
```

Use neutral or blue-soft styling.

Add information banner:

```text
Read-only access

You can view network resources, but your role does not allow changes.
```

Banner:

```css
background: #EEF3FF;
border: 1px solid #D9E3FF;
color: #344054;
```

For edit actions:

Preferred:

- keep `Edit` visible but disabled
- show tooltip:

```text
Your role has read-only access.
```

Hide the primary `+ Add resource` button entirely.

This makes access control obvious to reviewers.

---

# 20. Badges

Base:

```css
display: inline-flex;
align-items: center;
height: 24px;
padding: 0 8px;
border-radius: 999px;
font-size: 12px;
font-weight: 500;
```

Use badges for:

- role
- environment
- status when appropriate

Do not turn normal buttons into pills.

---

# 21. Alerts

## Info

```css
background: #EEF3FF;
border: 1px solid #D9E3FF;
```

## Error

```css
background: #FFF0EE;
border: 1px solid #F5C2BD;
```

## Success

```css
background: #ECF8EF;
border: 1px solid #C7E8CE;
```

Structure:

```text
Icon
Short title
Supporting sentence
```

Keep them compact.

---

# 22. Modal / Drawer Styling

Recommended modal width:

```text
480–560px
```

Style:

```css
background: #FFFFFF;
border-radius: 10px;
box-shadow: 0 12px 32px rgba(16,24,40,0.12);
```

Header:

```text
Title
Close icon
```

Footer:

```text
Cancel     Primary action
```

Padding:

```text
24px
```

Avoid oversized modal layouts.

---

# 23. Icons

Recommended:

```text
Lucide React
```

Suggested icons:

```text
Mail
Lock
ShieldCheck
Eye
EyeOff
Cloud
Network
Settings
Bell
LogOut
Plus
Pencil
CheckCircle2
AlertTriangle
ChevronDown
```

Style:

```text
16–20px
1.5–2px stroke
```

Use icons as support, not decoration.

---

# 24. Navigation States

Sidebar icon states:

```text
Default
Hover
Active
Focus
```

Top-level links:

```text
Default: #667085
Hover: #344054
Active: #2B56F0
```

Do not overuse underline animation or motion.

---

# 25. Focus States

Every interactive element must have a visible focus state.

Primary focus ring:

```css
box-shadow: 0 0 0 3px rgba(43,86,240,0.14);
```

Do not remove browser focus without replacing it.

---

# 26. Motion

Keep motion restrained.

Recommended:

```text
Button hover: 120–160ms
Modal fade/scale: 160–200ms
Toast entrance: 160–200ms
Sidebar hover: 120ms
```

Do not animate:

- every card
- background topology continuously
- page transitions dramatically

Use:

```css
transition:
  background-color 140ms ease,
  border-color 140ms ease,
  box-shadow 140ms ease;
```

---

# 27. Responsive Protected View

Below 1024px:

- reduce workspace padding from 32px to 24px
- allow summary cards to wrap

Below 768px:

- collapse sidebar
- use top header menu trigger
- page padding: 20px
- table may become stacked resource cards
- primary actions should stay visible without horizontal scrolling

Resource card mobile structure:

```text
AWS Production
AWS · us-west-2

Cloud Connector
PROD

● Healthy

Edit
```

---

# 28. Suggested Screen Set

Build these five visual states:

```text
1. Login
2. Sign Up
3. MFA
4. Read-only Resources
5. Read/write Resources
```

Maintain visual continuity:

```text
Auth screens
→ blue Alkira brand language

Protected screens
→ navy rail + light enterprise workspace
```

---

# 29. Login Screen Composition

Recommended desktop composition:

```text
┌──────────────────────────┬──────────────────────────────┐
│                          │                              │
│ alkira                   │ Welcome back                 │
│ A Lumen Connect Solution │                              │
│                          │ Sign in to continue to the   │
│ Secure cloud networking, │ Alkira portal.               │
│ without the complexity.  │                              │
│                          │ Email address                │
│   ○────○                 │ [________________________]   │
│  ╱      ╲                │                              │
│ ○        ○────○          │ Password                     │
│          ╲               │ [________________________]   │
│           ○              │                              │
│                          │ [ Sign in                ]   │
│                          │                              │
│                          │ New to Alkira? Create acct   │
└──────────────────────────┴──────────────────────────────┘
```

---

# 30. Protected Screen Composition

Recommended:

```text
┌──────┬─────────────────────────────────────────────────┐
│  a   │ Network Resources                 Editor   SA    │
│──────├─────────────────────────────────────────────────┤
│  ◇   │                                                 │
│  ▣   │ Network Resources              + Add resource   │
│  ≡   │ View and manage cloud network connections.      │
│  ⚙   │                                                 │
│      │ ┌──────────────┐ ┌────────────┐ ┌────────────┐  │
│      │ │ Connected  6 │ │ Healthy  5 │ │ Attention 1│  │
│      │ └──────────────┘ └────────────┘ └────────────┘  │
│      │                                                 │
│      │ ┌─────────────────────────────────────────────┐ │
│      │ │ Resource       Provider  Segment Status    │ │
│      │ │ AWS Production AWS       PROD    Healthy   │ │
│      │ │ Azure Analytics Azure    DATA    Healthy   │ │
│      │ │ San Jose CXP    Alkira   CORE    Attention │ │
│      │ └─────────────────────────────────────────────┘ │
└──────┴─────────────────────────────────────────────────┘
```

---

# 31. Visual Acceptance Checklist

- [ ] Alkira blue `#2B56F0` is the primary brand/action color.
- [ ] Auth screens use a blue Alkira brand panel on desktop.
- [ ] "A Lumen Connect Solution" appears subtly in the branding treatment.
- [ ] Protected app uses a dark navy product rail.
- [ ] Main application canvas is light neutral, not pure white everywhere.
- [ ] Cards use borders more than shadows.
- [ ] Inputs and buttons use approximately 6px radii.
- [ ] Cards use approximately 8px radii.
- [ ] Typography is compact and enterprise-oriented.
- [ ] Primary buttons are rectangular, not pills.
- [ ] Network/topology visuals are subtle.
- [ ] Status states include text, not color alone.
- [ ] Read-only state is visually obvious.
- [ ] Read/write actions are visually obvious.
- [ ] MFA visually matches Login.
- [ ] Mobile layouts remain clean and usable.
- [ ] All keyboard focus states are clearly visible.
- [ ] No unnecessary gradients, glass, or decorative motion.

---

# 32. Final Visual Direction

The finished UI should communicate:

```text
Alkira brand
+
enterprise network operations
+
secure authentication
+
clean role-based controls
```

The target reaction is:

> This looks like a small, polished feature that could plausibly belong inside an Alkira product.
