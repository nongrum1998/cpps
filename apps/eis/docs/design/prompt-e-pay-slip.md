# Google Stitch Prompt — E-Pay Slip Screen

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen 1: GE Number Entry

**Route:** `/e-pay-slip` (first visit — no stored GE number)
**Purpose:** Collect the employee's GE number before fetching their e-pay slip.

### Header

- `SectionHeader`: "E-Pay Slip" — `typography.display-xs` (20px/500)
- bg `--secondary` (#f7f7f7)

### Body (centered, vertical)

- **Title**: "E-Pay Slip" — `typography.display-sm` (24px/500), `--ink`
- **Subtitle**: "Please enter your GE Number to fetch your e-pay slip." — `typography.body-md`, `--graphite`

### GE Number Input

- Label: "GE Number" — `typography.caption-md`, `--charcoal`
- `<Input>`: numeric-only (`number-pad`), bg `--canvas`, 4px radius, 44px height
- Placeholder: "Enter GE number" — `--input` (#c2c2c2)
- Default border: 1px `--input`; focused border: 1px `--ink`; error border: 1px `--destructive`
- Input auto-strips non-digit characters; max length 10
- Inline error text below input: `typography.caption-md`, `--destructive`

### CTA

- **Primary button**: "Fetch E-Pay Slip" — `typography.button-md` (14px/600/0.7px tracking, uppercase), white text on `--primary` (#024ad8), 44px, 4px radius
- Disabled (empty/invalid input): bg `--input` (#c2c2c2), white text

### States

| State             | Behaviour                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Empty input**   | Button disabled; input focused by default                                                              |
| **Invalid input** | Non-digits stripped as typed; button stays disabled until numeric value present                        |
| **Submit**        | Fires fetch → screen transitions to skeleton (Screen 4)                                                |
| **Fetch error**   | Form re-shown with inline error: "No e-pay slip found for this GE number. Please check and try again." |

---

## Screen 2: E-Pay Slip Details

**Route:** `/e-pay-slip` (stored GE number, or after ownership confirmation)
**Purpose:** Display the confirmed e-pay slip identity fields with a Download PDF action.

### Header

- `SectionHeader`: "E-Pay Slip" — `typography.display-xs` (20px/500), back arrow
- bg `--secondary` (#f7f7f7)

### Payslip Details Card

- `<Card variant="bordered">` — bg `--surface-card`, 16px radius, Soft Lift shadow
- Six detail rows, 16px horizontal / 12px vertical padding, 1px `--muted` row separators:

  | Row            | Value styling                         |
  | -------------- | ------------------------------------- |
  | Payslip Number | `typography.caption-md`, `--charcoal` |
  | Payslip Date   | `typography.caption-md`, `--charcoal` |
  | Sign Date      | `typography.caption-md`, `--charcoal` |
  | GE Number      | `typography.caption-md`, `--charcoal` |
  | Name           | `typography.caption-md`, `--charcoal` |
  | Designation    | `typography.caption-md`, `--charcoal` |

- Each row: label left (`--graphite`), value right-aligned `typography.body-md` (16px/400) `--ink` (semibold), flexes remaining space
- Layout mirrors the GPF/Salary detail row pattern (label fixed, value flex)

### CTA

- **Primary button**: "Download PDF" — `typography.button-md`, white text on `--primary`, 44px, 4px radius
- **Disabled** (before ownership confirmation): bg `--input`, white text
- **Downloading**: label "Downloading...", spinner, opacity 70%
- On success → snackbar "E-pay slip downloaded" with `checkmark-circle` icon
- On failure → snackbar with error message and `alert-circle` icon

### States

| State                  | Behaviour                                                         |
| ---------------------- | ----------------------------------------------------------------- |
| **Stored GE number**   | Auto-fetch on mount → details card + enabled Download (no dialog) |
| **After confirmation** | Dialog closes → details card shown, Download button enabled       |
| **Downloading**        | Button shows spinner; disabled                                    |
| **Existing-GE error**  | `<EmptyScreen>` "Unable to load e-pay slip" with Refresh button   |
| **Refreshing**         | Pull-to-refresh via `RefreshControl` (retry available)            |

---

## Screen 3: Ownership Confirmation Dialog

**Route:** `/e-pay-slip` (modal overlay after entering a NEW GE number that returned a payslip)
**Purpose:** Verify the fetched payslip belongs to the signed-in user before the GE number is persisted and download is unlocked.

### Modal

- `<AlertDialog>` — centered modal, Floating elevation (`0 8px 24px rgba(26,26,26,0.12)`), 16px radius, bg `--canvas`
- 24px padding

### Header

- **Title**: "Confirm Your Payslip" — `typography.display-xs` (20px/500), `--ink`
- **Description**: "Please confirm this payslip belongs to you ({user name}) before downloading." — `typography.body-md`, `--graphite`
- User name composed from first/middle/last name (e.g., "Arun Kumar Sharma")

### Payslip Identity Block

- Rounded panel (8px radius) inside dialog: bg `--secondary` (#f7f7f7) light / white 5% dark
- Five label/value rows, 8px vertical gaps:

  | Label        | Value                         |
  | ------------ | ----------------------------- |
  | Name         | `typography.caption-md` value |
  | Designation  | `typography.caption-md` value |
  | GE Number    | `typography.caption-md` value |
  | Payslip No.  | `typography.caption-md` value |
  | Payslip Date | `typography.caption-md` value |

- Labels left (`--graphite`), values right `typography.caption-md` semibold `--ink`

### Footer (two buttons, flex-1 each)

- **Cancel**: "Not mine" — outline button (white bg, `--primary` text, 1px `--primary` border), 44px, 4px radius → closes dialog, returns to entry form
- **Confirm**: "This is my payslip" — primary button (white text on `--primary`), 44px, 4px radius
- **Confirming**: label "Saving...", spinner, both buttons disabled

### Behaviour

- Backdrop tap / cancel while confirming is blocked
- Confirm → persists GE number to backend (`update_ge_number` RPC) → refreshes employee details (`get_emp_details` via auth store `refresh()`) → `user.ge_number` repopulated → dialog closes, details card + Download enabled
- Backend failure → snackbar "Could not save your GE number. Please try again." (`alert-circle`); dialog stays open for retry

---

## Screen 4: Loading & Skeleton

**Route:** `/e-pay-slip` (initial fetch or new-entry fetch)
**Purpose:** Placeholder while the payslip loads.

- `Container` top padding 24px, vertical gap 24px
- Title bar skeleton: 160×24px shimmer
- Card skeleton: 6 rows (96×12px label + 128×12px value), 1px `--muted` separators, 16px radius
- Button skeleton: full-width 44px shimmer, 4px radius

---

## Data Model

```typescript
EPayslip = {
  payslip_no: string    // e.g., "EPS-2026-0001"
  payslip_date: string  // e.g., "31/07/2026"
  sign_date: string     // e.g., "30/07/2026"
  ge_number: string     // e.g., "1069587"
  name: string          // e.g., "Arun Kumar Sharma"
  designation: string   // e.g., "Section Officer"
  file_id: string       // e.g., "file-001"
  pdf: string           // PDF URL or base64 payload
}
```

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show all four screens: (1) GE number entry form with numeric input and disabled state, (2) payslip details card with the Download PDF button enabled, (3) ownership confirmation dialog with identity rows and both action buttons, (4) loading skeleton. Use realistic sample data ("Arun Kumar Sharma", GE number "1069587", payslip no "EPS-2026-0001"). Use HP Design System tokens — `#024ad8` primary, `#1a1a1a` ink, `#f7f7f7` secondary surface.
