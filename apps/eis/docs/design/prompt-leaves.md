# Google Stitch Prompt — Leave Screens

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen 1: Leave List

**Route:** `/leaves`
**Purpose:** List all leave applications with pull-to-refresh and FAB to create.

### Header

- `SectionHeader` component: "My Leaves" — `typography.display-xs` (20px/500)
- Background `--secondary` (#f7f7f7)

### List

- `FlatList` with `RefreshControl` for pull-to-refresh
- Each item rendered as `<LeaveCard>`:

  **LeaveCard layout:**
  - bg `--surface-card`, 16px radius, Soft Lift shadow, 16px padding
  - Top row: leave type badge + status chip
    - Leave type badge: bg `--primary-soft` (#c9e0fc), text `--primary`, 8px radius, `typography.caption-md` bold
    - Status chip: colored by status:
      - `Approved` / `Verified`: bg `--semantic-up` (#22c55e), white text
      - `Pending`: bg `--accent-yellow` (#eab308), white text
      - `Rejected`: bg `--destructive` (#b3262b), white text
  - Middle: leave description "Sick Leave" — `typography.body-emphasis` (16px/500)
  - Bottom row: date range "01/06/2026 – 03/06/2026" + "3 days" — `typography.caption-md`, `--graphite`

- **FAB**: 56px circle, `--primary`, white "+" icon, bottom-right, navigates to create

### States

| State         | Behaviour                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Loading**   | `<LeaveListSkeleton>` — 6 shimmer card placeholders + FAB                                                          |
| **Empty**     | `<EmptyScreen>` — illustration, "No Leaves Found", "You have not applied for any leaves yet", refresh button + FAB |
| **Error**     | `<EmptyScreen>` with refresh                                                                                       |
| **Populated** | Full scrollable list with pull-to-refresh                                                                          |
| **Refresh**   | Pull-to-refresh via `RefreshControl`, `isFetching` indicator                                                       |

### Navigation

- Tap card → `/leaves/[id]` (detail)
- Tap FAB → `/leaves/create`
- Bottom tab: Leaves (active)

---

## Screen 2: Create Leave

**Route:** `/leaves/create`
**Purpose:** Apply for new leave with type, dates, reason, and address during leave.

### Header

- Stack header: back arrow + "Apply for Leave"

### Form Fields

1. **Leave Type** — Picker/dropdown
   - Label: "Leave Type"
   - Options (10 types):

     | Code | Description                     |
     | ---- | ------------------------------- |
     | COM  | Commuted Leave                  |
     | LND  | Leave Not Due                   |
     | EOL  | Extra Ordinary Leave            |
     | LPA  | Leave Preparatory to Retirement |
     | EL   | Earned Leave                    |
     | HPL  | Half Pay Leave                  |
     | ML   | Maternity Leave                 |
     | SL   | Sick Leave                      |
     | WPL  | Wel十日 Leave                   |
     | PL   | Personal Leave                  |

2. **From Date** — Date picker, label "From Date", placeholder "DD/MM/YYYY"

3. **To Date** — Date picker, label "To Date", placeholder "DD/MM/YYYY"

4. **Reason Code** — Picker
   - Label: "Leave Reason"
   - Options: 13 reason codes (1–13) with descriptions:
     - `1`: Sick — Medical Certificate
     - `2`: Sick — Self
     - `3`: Personal — Family Event
     - `4`: Personal — Emergency
     - `5`: Annual — Planned Vacation
     - `6`: Annual — Travel
     - `7`: Maternity
     - `8`: Paternity
     - `9`: Half Pay — Medical
     - `10`: Half Pay — Personal
     - `11`: Commuted Leave
     - `12`: Leave Not Due
     - `13`: Extra Ordinary Leave

5. **Reason Description** — Text area (multiline)
   - Label: "Reason for Leave"
   - Placeholder: "Please provide detailed reason..."

6. **Address During Leave** — Text area (multiline)
   - Label: "Address During Leave"
   - Placeholder: "Enter your address while on leave..."

### Submit

- **Apply button**: Full width, 44px, `--primary`, uppercase "Apply for Leave"
- Loading state: spinner on button
- On success: toast + navigate back to list

### States

| State          | Behaviour                                             |
| -------------- | ----------------------------------------------------- |
| **Form**       | All fields empty, date pickers show placeholder text  |
| **Validating** | Inline errors under each field (red, `--destructive`) |
| **Submitting** | Button spinner, all fields disabled                   |
| **Success**    | Toast "Leave applied successfully" → pop back to list |
| **Error**      | Toast with server error message                       |

### Date Range Validation

- From date must be today or future
- To date must be >= from date
- Leave type determines max days (e.g., SL max 3, EL max 30)

---

## Screen 3: Leave Detail

**Route:** `/leaves/[id]`
**Purpose:** View full details of a single leave application.

### Header

- Stack header: back arrow + leave type + leave code badge

### Detail Card

- bg `--surface-card`, 16px radius, Soft Lift shadow
- **Status banner** at top: full-width colored strip
  - Approved/Success: `--semantic-up` (#22c55e)
  - Pending: `--accent-yellow` (#eab308)
  - Rejected: `--destructive` (#b3262b)
- **Leave type + description**: "Sick Leave (SL)"
- **Date range**: "01/06/2026 to 03/06/2026"
- **Duration**: "3 days"

### Info Sections

- **Leave Details**
  - Order No: "ORD-2026-001"
  - Order Date: "25/05/2026"
  - Reason Code: "1 — Sick — Medical Certificate"
  - Reason Description: "Medical appointment"
  - Address During Leave: "123 Main St, New Delhi"

- **Leave Balance**
  - Opening Balance: 10 days
  - Credited: 1 day
  - Debited: 3 days
  - Closing Balance: 8 days
  - Balance As On: "01/06/2026"

- **Verification**
  - Status: "Approved" or "Pending" or "Rejected"
  - Remarks: "Approved with medical certificate" (or rejection reason)
  - Rejection Reason: (only if rejected)

### Actions

- **Update button** (shown for Pending/Entry status only): '--primary outline', "Update Leave" → `/leaves/[id]/update`
- Label: `--charcoal`, `typography.caption-md`

### Data Model

```typescript
ILeaveDetails extends LeaveListItem = {
  id: "lev-001"
  leave_cd: "SL"
  leave_desc: "Sick Leave"
  from_dt: "01/06/2026"
  to_dt: "03/06/2026"
  no_days: "3"
  order_dt: "25/05/2026"
  order_no: "ORD-2026-001"
  reason_for_leave: "Medical appointment"
  verify_flg_desc: "Approved"
  opening_bal: 10
  no_days_credited: 1
  closing_bal: 8
  closing_bal_as_on: "01/06/2026"
  leave_reason_cd: 1
  remarks: "Approved with medical certificate"
  reason_for_rejection: null
}
```

---

## Screen 4: Update Leave

**Route:** `/leaves/[id]/update`
**Purpose:** Edit a pending leave application.

Same form as Create Leave, pre-filled with existing values. Submit updates backend and navigate back to detail.

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844). Include light and dark mode variants. Show all screens: list with multiple leave cards of different statuses, create form with picker open, detail view with balance section, and update form pre-filled. Use HP Design System tokens — `#024ad8` primary, `#1a1a1a` ink, `#22c55e` approved, `#eab308` pending, `#b3262b` rejected.
