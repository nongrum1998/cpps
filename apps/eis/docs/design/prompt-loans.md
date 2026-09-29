# Google Stitch Prompt — Loan Screens

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen 1: Loan List

**Route:** `/loans`
**Purpose:** List all loans assigned to the signed-in employee with pull-to-refresh. Tapping a card opens the loan detail screen.

### Header

- `SectionHeader` component: "Recent Loans" — `typography.display-xs` (20px/500), left accent bar (4×16px `--primary`)
- Background `--canvas` (#ffffff)

### List

- `FlatList` with `RefreshControl` for pull-to-refresh (`refreshing` bound to `isFetching`)
- Each item rendered as `<LoanCard>`:

  **LoanCard layout:**
  - bg `--surface-card`, 16px radius, 16px padding, Hairline 1px `--muted` border
  - **Top row** (space-between): description + loan no (left) + status chip (right)
    - Description ("Housing Loan") — `typography.body-emphasis` (16px/500), `--ink`
    - Loan number ("Loan No. LOAN-001") — `typography.caption-md`, `--primary`
    - **Status chip**: 8px radius, color-coded by `recovery_status`:
      - `Open` (active): bg `--semantic-up` (#22c55e), white text
      - `Close`: bg `--accent-yellow` (#eab308), white text
  - **Bottom row** (space-between): "Rs 500,000" — `typography.body-md`, `--graphite` + "Recovery of Principal" — `typography.caption-md`, `--graphite`

- No FAB — loans are assigned by the office, not self-created

### States

| State         | Behaviour                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Loading**   | `<LoanListSkeleton>` — `SectionHeader` + 10 shimmer `LoanCard` placeholders                                                 |
| **Empty**     | `<EmptyScreen>` — "No loans found", "You don't have any loans yet. Loans assigned to you will appear here.", refresh button |
| **Error**     | `<EmptyScreen>` with refresh                                                                                                |
| **Populated** | Full scrollable list with pull-to-refresh                                                                                   |
| **Refresh**   | Pull-to-refresh via `RefreshControl`, `isFetching` indicator                                                                |

### Navigation

- Tap card → `/loans/[loanId]` (detail), forwarding `loan_id`
- Stack header: back arrow; bottom tab: Loans (where applicable)

---

## Screen 2: Loan Detail

**Route:** `/loans/[loanId]`
**Purpose:** View the full record for a single loan, keyed by `loan_id`.

### Guard

- Missing `loanId` route segment → soft redirect to `/loans` (list)
- Loading (no data yet) → `<LoanDetailSkeleton>`
- Query returns no record → `<EmptyScreen>` "Loan Not Found" / "The loan you're looking for doesn't exist" with refresh

### Header

- Stack header: back arrow + "Loan Details"
- Background `--canvas`

### Layout (ScrollView, pull-to-refresh)

1. **Recovery status banner** — full-width rounded strip, centered, 1px border + soft tint via `recovery_status`:
   - `Open` → green (bg `--semantic-100`, border green, text `--semantic-up`)
   - `Close` → amber (bg amber-100, border amber-500, text amber)
   - **Label**: `recovery_status` uppercase — `typography.caption-md` bold, wide letter-spacing

2. **Loan header card** — primary slab `--primary` (#024ad8), 16px radius top, 16px padding
   - "Loan Description" — `typography.caption-md`, white
   - `loan_desc` — `typography.body-emphasis` (16px/500), pure white
   - "Loan No. {loan_id}" — `typography.caption-md`, white 80%

3. **Loan summary card** — `--surface-card`, 16px radius bottom, 16px padding, 1px `--muted` border, top-connected to header above
   - `DetailRow` rows (label left `--graphite`, value right `--ink` semibold):
     - **Amount Disbursed** → "Rs 500,000"
     - **Recovery Of** → "Principal"
     - **Recovery Status** → "Open"

4. **Interest & Recovery card** — `Card variant="bordered"`, 16px radius, 20px padding
   - Section title "Interest & Recovery" — `typography.caption-md`, bold, uppercase, `--graphite`
   - `DetailRow` rows:
     - **Interest Balance** → "Rs 12,000"
     - **Interest Installment Amount** → "Rs 4,000"
     - **Last Installment Recovered** → "Rs 8,000"

- Amounts are prefixed with `Rs ` via `formatAmount` so the currency symbol never duplicates

### States

| State         | Behaviour                                                           |
| ------------- | ------------------------------------------------------------------- |
| **No id**     | Redirect to `/loans`                                                |
| **Loading**   | `<LoanDetailSkeleton>` — status banner + header + summary + details |
| **Not found** | `<EmptyScreen>` "Loan Not Found" with refresh                       |
| **Populated** | Scrollable detail view                                              |
| **Refresh**   | Pull-to-refresh via `RefreshControl`, `isFetching` indicator        |

### Navigation

- Stack header back arrow → `/loans`
- Only entry point is the list card tap; no edit/delete actions

---

## Data Model

```typescript
// List row (LoanT)
Loan = {
  amt_dis: string          // e.g., "500000"
  loan_desc: string        // e.g., "Housing Loan"
  loan_id: string          // e.g., "LOAN-001"
  recovery_of: "Principal" | "Interest"
  recovery_status: "Open" | "Close"
}

// Detail record (LoanItem extends Loan)
LoanItem extends Loan = {
  int_balance: string      // e.g., "12000"
  int_inst_amt: string     // e.g., "4000"
  int_lst_inst_rec: string // e.g., "8000"
}
```

RPC methods:

- `GET_EMP_LOAN` — returns `LoanT[]` for the signed-in employee
- `GET_EMP_LOAN_DETAILS` — returns a single `LoanItem` keyed by `loan_id`

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844). Include light and dark mode variants. Show both screens: (1) list with multiple loan cards of different recovery statuses (`Open` green, `Close` amber); (2) detail view with the recovery status banner, primary loan header card, summary card, and Interest & Recovery card. Use realistic sample data (Housing Loan "LOAN-001", Amount Disbursed "500,000", Recovery Of "Principal", status "Open"). Use HP Design System tokens — `#024ad8` primary, `#1a1a1a` ink, `#22c55e` open, `#eab308` close.
