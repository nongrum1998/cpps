---
name: HP EIS Mobile System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#434655'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#747686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1451de'
  primary: '#0036a4'
  on-primary: '#ffffff'
  primary-container: '#024ad8'
  on-primary-container: '#c2ceff'
  inverse-primary: '#b6c4ff'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#154756'
  on-tertiary: '#ffffff'
  tertiary-container: '#315f6f'
  on-tertiary-container: '#a9d7ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164f'
  on-primary-fixed-variant: '#003bb0'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#bbeafd'
  tertiary-fixed-dim: '#9fcee0'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#1c4c5c'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-md:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  display-sm:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  display-xs:
    fontFamily: manrope
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-emphasis:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  caption-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  caption-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  button-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.7px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-page: 20px
  gutter-inline: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system is engineered for the HP Employee Information System (EIS), specifically optimized for the iOS mobile platform. The brand personality is **Corporate Modern**: reliable, systematic, and high-performance. It balances the legacy of HP’s precision engineering with a contemporary, mobile-first utility.

The design style utilizes a **Tonal Layering** approach combined with **Minimalism**. It prioritizes clarity and information density without overwhelming the user. By using a strict "Electric Blue" primary palette against neutral architectural grays, the UI directs focus toward actionable employee data and system status. The interface feels institutional yet agile, evoking a sense of professional empowerment and technical proficiency.

## Colors

The color strategy centers on **HP Electric Blue** to signify authority and primary action.

- **Primary Stack:** Use `Primary-Deep` (#0e3191) for pressed states and `Primary-Bright` (#296ef9) for hover or subtle highlights in data visualization. `Primary-Soft` (#c9e0fc) serves as a background for badges or selected list items.
- **Surface Strategy:** The "Cloud" secondary color (#f7f7f7) is the standard background for grouping elements, while the "Canvas" white (#ffffff) is reserved for the highest level of the view hierarchy.
- **Typography Grays:** "Ink" (#1a1a1a) is the default for body text. Use "Graphite" (#636363) for secondary labels and "Charcoal" (#3d3d3d) for icons or metadata that require slightly higher prominence than graphite.
- **Semantic Accents:** `Storm-Deep` (#356373) is used for technical data or system-level information that is neutral but distinct from standard UI grays.

## Typography

The system uses a pairing of **Manrope** for display levels and **Inter** for functional/body levels to ensure high legibility on small screens.

- **Display Hierarchy:** `Display-MD` is reserved for page headers and key metrics. `Display-XS` is the workhorse for section titles within cards.
- **Readability:** Body text uses `Body-MD` for standard content. For denser data tables or employee lists, `Caption-MD` provides a balanced alternative to maintain high information density without sacrificing clarity.
- **Functional Labels:** All button text must be set in `Button-MD` with the specified 0.7px tracking and uppercase transformation to differentiate interactive elements from static labels.
- **Accessibility:** Minimum contrast ratios for "Graphite" and "Charcoal" text must be strictly monitored against the "Cloud" and "Canvas" surfaces.

## Layout & Spacing

The design system adheres to a **Fluid Grid** model optimized for the iPhone 13/14/15 (390x844) viewport.

- **Grid Logic:** A 4-column layout is used for mobile. Standard page margins are set to 20px to accommodate reachability and modern iOS aesthetics.
- **Spacing Rhythm:** Based on an 8px (Base) increment system.
  - Use `stack-sm` (8px) for internal element spacing (e.g., icon to text).
  - Use `stack-md` (16px) for spacing between items in a list or components within a section.
  - Use `stack-lg` (24px) to separate major content sections.
- **Safe Areas:** Strictly follow iOS Top and Bottom safe area insets. The Bottom Navigation bar should be fixed with a blur background over content.

## Elevation & Depth

This design system uses a combination of **Tonal Layers** and **Ambient Shadows** to define hierarchy.

- **Level 0 (Canvas):** The base background surface.
- **Level 1 (Card/Surface):** Items with the `Soft Lift` shadow. This is the default for content cards and list containers. The shadow is a tight, low-opacity "Ink" tint: `0 2px 8px rgba(26,26,26,0.08)`.
- **Level 2 (Floating):** Reserved for Floating Action Buttons (FABs) or temporary modals/sheets. Uses the `Floating` shadow: `0 8px 24px rgba(26,26,26,0.12)`.
- **Level 3 (Overlay):** Dimmed background (40% Ink) with the primary modal surface appearing on top.

Avoid using heavy borders for elevation. Instead, use the "Fog" (#e8e8e8) border to define boundaries on Level 0 surfaces when shadows are not appropriate.

## Shapes

The shape language is structured and professional.

- **Radius-MD (4px):** Used for small interactive elements like Checkboxes and Radio selection states.
- **Radius-LG (8px):** The standard radius for primary Buttons, Input fields, and smaller nested components.
- **Radius-XL (16px):** Used for primary Content Cards and Bottom Sheets to provide a modern, friendly container feel.
- **Pill (9999px):** Exclusively for Chips, Status Badges, and Search Bars.

## Components

- **Buttons:**
  - _Primary:_ Electric Blue background, white text, uppercase.
  - _Secondary:_ Cloud background, Electric Blue text, uppercase.
  - _Tertiary:_ Ghost style, Electric Blue text, no background.
- **Input Fields:**
  - "Steel" (#c2c2c2) border, 8px radius. Active state switches border to "Electric Blue" with a 2px stroke.
- **Chips:**
  - Pill-shaped. Success/Warning/Destructive chips use a 10% opacity background of their semantic color with a 100% opacity text color.
- **Cards:**
  - White background, 16px radius, `Soft Lift` shadow. Padded with 16px internal padding (`stack-md`).
- **Lists:**
  - Standard iOS-style list items with a "Fog" (#e8e8e8) separator 0.5px thick. 16px horizontal padding.
- **Checkboxes & Radios:**
  - 4px radius for checkboxes to match system "Soft" logic. Always use Electric Blue for the "Checked" state.
- **Status Indicators:**
  - Small 8px dots for real-time status (Online/Offline) using `Success` and `Muted` colors.
