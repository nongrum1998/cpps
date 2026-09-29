# Google Stitch Prompt — GPF Statement Screen

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen 1: GPF Statement Detail

**Route:** `/gpf-statements`
**Purpose:** View GPF (General Provident Fund) statement for a selected financial year, showing employee info, monthly subscription/refund data, and balance summary.

### Header

- `SectionHeader`: "GPF Statement" — `typography.display-xs` (20px/500)
- bg `--secondary` (#f7f7f7)

### Year Selector

- `<GPFYearSelectSheet>` — bottom sheet / inline picker for selecting financial year
- Label: "Select Financial Year" — `typography.caption-md`, `--charcoal`
- Selected year displayed as chip: "2024–2025" — `typography.body-md`, `--primary` bg `--primary-soft`
- Shown both in empty state and above the scrollable content

### Employee Information Card

- `<Card variant="bordered">` — bg `--surface-card`, 16px radius, Soft Lift shadow
- **Card title**: "Employee Information" — `typography.display-xs` (20px/500)
- Four detail rows with bottom border separator (`--muted`):

  | Label         | Value                                 |
  | ------------- | ------------------------------------- |
  | Treasury      | `typography.caption-md`, `--charcoal` |
  | DDO           | `typography.caption-md`, `--charcoal` |
  | Date of Birth | `typography.caption-md`, `--charcoal` |
  | Interest Rate | `typography.caption-md`, `--charcoal` |

- Each row: label fixed 128px (`w-32`), value flexes remaining space — `typography.body-md` (16px/400), `--ink`
- Values in `--ink` (bold/semibold), labels in `--graphite`

### Monthly Statement Section

**Section title**: "Monthly Statement" — `typography.body-emphasis`, `--ink`, with bottom margin

### Monthly Data Table

- `<MonthlyTable>` — horizontally scrollable table inside `Card variant="bordered"`
- Column header row: bg `--secondary` (#f7f7f7), `typography.caption-bold`, `--charcoal`

  | Month (100px) | Subscription (120px) | Refund (100px) | Other (100px) | Category (100px) | Total (100px) | Debit (100px) | Type (100px) |

- Data rows (12 months, Apr–Mar):
  - Alternating bg: even rows `--canvas` (#ffffff), odd rows `--secondary` (#f7f7f7)
  - Cell content: `typography.caption-md` (14px/400), `--ink`
  - Empty cell fallback: `-` (en dash)
  - Row separator: 1px `--muted` (#e8e8e8)
  - Horizontal scroll: `ScrollView horizontal` with scroll indicator

### Summary Section

**Section title**: "Summary" — `typography.body-emphasis`, `--ink`, with top margin (24px) and bottom margin

### Summary Table

- `<SummaryTable>` — compact table inside `Card variant="bordered"`
- Column header row: bg `--secondary`, `typography.caption-bold`, `--charcoal`

  | Description (120px) | Balance I (100px) | Balance II (100px) | Total (100px) | Missing Credits (100px) |

- Data rows:
  - Alternating bg: even `--canvas`, odd `--secondary`
  - Cell content: `typography.caption-md` (14px/400), `--ink`
  - Row separator: 1px `--muted`

### States

| State          | Behaviour                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Loading**    | `<GpfStatementSkeleton>` — 3 skeleton cards (employee info + table + summary) with shimmer |
| **Empty**      | `<GPFYearSelectSheet>` + `<EmptyScreen>` "No GPF Statement Found" with refresh button      |
| **Populated**  | Year selector + ScrollView with employee info card, monthly table, summary table           |
| **Refreshing** | Pull-to-refresh via `RefreshControl` on `ScrollView`                                       |

### Scroll Behaviour

- Outer `ScrollView` wraps: employee info card → monthly statement section → monthly table → summary section → summary table
- Monthly table has its own internal horizontal `ScrollView`
- `RefreshControl` wired to `refetch` with `isFetching` spinner
- `showsVerticalScrollIndicator={false}`

### Data Model

```typescript
GPFStatement = {
  emp: {
    treasury: string    // e.g., "TREASURY-001"
    ddo: string         // e.g., "DDO-123"
    dob: string         // e.g., "15/08/1985"
    interest_rate: string // e.g., "8.5%"
  }
  monthly_data: [
    {
      Month: string         // "APR", "MAY", "JUN"...
      Subscription: string  // "5000.00"
      Refund: string        // "0.00"
      Other: string         // "0.00"
      Category: string      // "GPF"
      Total: string         // "5000.00"
      Debit: string         // "0.00"
      Type: string          // "P"
    }
    // ... 12 entries, one per month
  ]
  summary: [
    {
      summary: string       // e.g., "Opening Balance"
      balanceI: string      // "250000.00"
      balanceII: string     // "0.00"
      total: string         // "250000.00"
      missingCredits: string // "0"
    }
    // ... multiple summary rows
  ]
}
```

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show the full screen with all sections visible: year selector chip, employee info card, monthly statement table with at least 6 rows visible (horizontal scroll hint), and the summary table at the bottom. Display sample data with realistic GPF values (₹ amounts). Use HP Design System tokens — `#024ad8` primary, `#1a1a1a` ink, `#f7f7f7` secondary surface.
