# Google Stitch Prompt — Pension Screen

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen: Pension History

**Route:** `/pension`
**Purpose:** View NPS (National Pension System) contribution history with filters.

### Header

- `SectionHeader`: "Pension History" — `typography.display-xs` (20px/500)
- bg `--secondary` (#f7f7f7)

### Filter Controls

Row of 3 dropdown/select filters (horizontal scroll on small screens):

1. **Year**: e.g., "2026", "2025", "2024", "All"
2. **Month**: e.g., "All", "January", "February", ..., "December"
3. **Status**: e.g., "All", "Active", "Inactive"

Filter chips style:

- bg `--surface-card`, 8px radius (`rounded-lg`), 1px `--hairline` border
- `typography.caption-md` (14px/400)
- Selected: bg `--primary-soft`, text `--primary`, no border

### List

- `FlatList` with `RefreshControl`
- Each item as pension slip card:

  **Card layout:**
  - bg `--surface-card`, 16px radius, Soft Lift shadow, 16px padding
  - **Month + Year**: "June 2026" — `typography.body-emphasis` (16px/500)
  - **NPS Tier 1 Contribution**: "₹8,500.00" — `typography.body-md`, `--primary`
  - **Status badge**: "Active" or "Inactive"
    - Active: bg `--semantic-up`, white text
    - Inactive: bg `--charcoal`, white text
  - **Footer**: "Contribution Period: 01/06/2026 – 30/06/2026" — `typography.caption-sm`, `--graphite`

### Summary Section (top)

Compact card above filter row:

- **Total Contributions**: "₹1,02,000" — `typography.display-sm` (24px/500), `--primary`
- **Period**: "FY 2026-27" — `typography.caption-md`, `--graphite`

### States

| State              | Behaviour                                           |
| ------------------ | --------------------------------------------------- |
| **Loading**        | 4 skeleton cards with shimmer                       |
| **Empty**          | "No pension records found" with filter reset option |
| **Filtered empty** | "No records match your filters"                     |
| **Populated**      | Scrollable list with active filter chips            |

### Data Model

```typescript
// Pension slip record
PensionSlip = {
  id: "pen-001"
  employeeId: "emp-123"
  month: "JUNE"
  year: 2026
  npsTier1: "8500.00"
  npsTier2: "0.00"       // optional additional contribution
  status: "ACTIVE"         // ACTIVE | INACTIVE
  contributionPeriodStart: "2026-06-01"
  contributionPeriodEnd: "2026-06-30"
  createdAt: "2026-07-01T00:00:00Z"
}
```

### Navigation

- Bottom tab: More → select Pension
- Tap card: expand details or navigate to detail view

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show filter bar at top, summary card, and list of 3 pension records from different months. HP Design System tokens.
