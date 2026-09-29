# Google Stitch Prompt — Home Dashboard

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen: Home Dashboard

**Route:** `/home`
**Purpose:** Main landing screen after login showing user greeting, quick actions, active leaves, and leave history.

### Header — `HomeHeader`

- **User greeting**: Large text "Good Morning" or "Good Afternoon" based on UTC hour — `typography.display-xs` (20px/500)
- **Department badge**: "IT Department" — `typography.caption-md` (14px/400), `--charcoal`
- **User name**: "Jane Doe" — `typography.body-emphasis` (16px/500)
- **Logout icon**: Top-right, 24px icon, `--charcoal`
- Background: `--canvas`, bottom hairline border 1px `--hairline`

### Quick Actions — `HomeQuickActions`

4-card grid (2×2), each card:

| Card        | Icon                    | Route            |
| ----------- | ----------------------- | ---------------- |
| Apply Leave | Calendar/document icon  | `/leaves/create` |
| View Salary | Currency/money icon     | `/salary`        |
| Income Tax  | Receipt/calculator icon | `/tax`           |
| Pension     | Shield/bank icon        | `/pension`       |

Card style:

- bg `--surface-card`, 16px radius (`rounded.xl`), Soft Lift shadow
- 48px icon in `--primary` (#024ad8) on `--primary-soft` (#c9e0fc) circle
- Label below: `typography.caption-md` (14px/400/1.5), `--ink`
- Internal padding: `spacing.md` (16px)

### Section: Active Leaves

Appears only when leaves with active status exist.

- **Section title**: "Active Leaves" — `typography.display-xs` (20px/500)
- **Cards**: `<HomeActiveLeaveCard>` per active leave

Card layout:

- Leave type badge (colored chip): bg `--primary-soft`, text `--primary`, 8px radius, e.g., "SL" for Sick Leave
- Leave description: "Sick Leave" — `typography.body-emphasis` (16px/500)
- Date range: "01/06/2026 – 03/06/2026" — `typography.caption-md` (14px/400), `--graphite`
- Duration: "3 days" — `typography.caption-sm` (12px/400), `--charcoal`
- Status chip: bg `--accent-yellow` for "Pending" or `--semantic-up` for "Verified"

### Section: Leave History

- **Section title**: "Leave History" — `typography.display-xs`
- When empty: `<HomeLeaveEmptyCard>` — illustration + "No leave history" + "Apply for your first leave" message
- When populated: `<HomeLeavePreview>` list items:
  - Compact card, no shadow, 1px bottom hairline
  - Leave type + dates + status row
  - `typography.body-md` for type, `typography.caption-sm` for dates

### Data Model

```typescript
// Authenticated user (partial)
UserT = {
  emp_fname: "Jane"
  emp_mname: "M"
  emp_lname: "Doe"
  emp_dept: "IT Department"
  emp_designation: "Software Engineer"
  emp_email: "jane.doe@example.com"
  emp_phone: "9876543210"
}

// Leave list item
LeaveListItem = {
  id: "lev-001"
  leave_cd: "SL"            // Leave type code
  leave_desc: "Sick Leave"  // Description
  from_dt: "01/06/2026"     // DD/MM/YYYY
  to_dt: "03/06/2026"
  no_days: "3"
  order_dt: "25/05/2026"
  reason_for_leave: "Medical appointment"
  verify_flg_desc: "Approved" // or Pending, Rejected
}

// Home quick action
HomeQuickAction = {
  label: "Apply Leave"
  icon: "calendar"
  route: "/leaves/create"
}
```

### States

| State                             | Behaviour                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Loading**                       | `<HomeScreenSkeleton>` — shimmer blocks for header, 4 quick action cards, 2 leave cards             |
| **Error** (no data)               | `<EmptyScreen>` — "Something went wrong", "Unable to fetch data", "Reload" button calls `refetch()` |
| **Empty** (data exists but empty) | Shows header + quick actions + "No active leaves" + `<HomeLeaveEmptyCard>`                          |
| **Populated**                     | Full layout with header, quick actions, active leaves, leave history                                |
| **Refresh**                       | Pull-to-refresh via `RefreshControl`, `isFetching` updates spinner                                  |
| **Logout**                        | Tap header logout icon → clears auth → redirects to `/auth/login`                                   |

### Tab Context

- **Bottom tab bar**: Home (active), Leaves, Salary, Tax, More
- Active tab has `--primary` underline indicator

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844). Include light and dark mode variants. Show loading skeleton state, populated data state with 2 active leaves and leave history, and empty state (no leaves). Use HP Design System tokens — `#024ad8` primary, `#1a1a1a` ink, `#f7f7f7` cloud, 16px card radius, 4px button radius, Inter/Manrope font.
