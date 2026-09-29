# GPF Statement Screen — Design Spec

**Date:** 2026-07-29
**Status:** Draft

## Overview

A scrollable screen that displays a GPF (General Provident Fund) statement for
the current financial year. The screen shows employee information followed by a
horizontally scrollable table of monthly subscription/refund data.

## Data Types

```typescript
type GPFEmployeeInfo = {
  treasury: string;
  ddo: string;
  dob: string;
  interest_rate: string;
};

type MonthlyData = {
  Month: string;
  Subscription: string;
  Refund: string;
  Other: string;
  Category: string;
  Total: string;
  Debit: string;
  Type: string;
};

type GPFStatement = {
  monthly_data: MonthlyData[];
  summary: Summary[];
  emp: GPFEmployeeInfo;
};
```

## Screen Layout

```
Container (flex-1, bg-zinc-50, p-4)
├── ScrollView (with RefreshControl)
│   ├── SectionHeader — "GPF Statement"
│   ├── EmployeeInfoCard (Card variant="bordered")
│   │   ├── CardHeader + CardTitle "Employee Information"
│   │   └── CardContent
│   │       ├── DetailRow label="Treasury"       value={emp.treasury}
│   │       ├── DetailRow label="DDO"            value={emp.ddo}
│   │       ├── DetailRow label="Date of Birth"  value={emp.dob}
│   │       └── DetailRow label="Interest Rate"  value={emp.interest_rate}
│   │
│   ├── SectionHeader (variant="section", no icon) — "Monthly Statement"
│   │
│   └── MonthlyTable (Card variant="bordered")
│       └── ScrollView horizontal
│           └── Table
│               ├── HeaderRow
│               │   └── [Month, Subscription, Refund, Other, Category, Total, Debit, Type]
│               └── BodyRows (×12, alternating grey/white)
│                   └── DataRow per month
```

## Components

### 1. MonthlyTable (`components/monthly-table.tsx`)

A horizontally scrollable table component that renders monthly GPF data.

- **Props:** `data: MonthlyData[]`
- **Table header**: Sticky header row with column names, bold text, grey background
- **Rows**: One row per month, alternating `bg-gray-50` / `bg-white` for readability
- **Cells**: Minimum width 100px per column, text aligned left, `caption-md` font
- **Borders**: Subtle `border-b border-gray-200` between rows

### 2. GpfStatementScreen (`screens/gpf-statement-screens.tsx`)

The main screen component.

- Calls `useGpfStatements({ financialYear: '2024-2025' })`
- **Loading state**: `Skeleton` component
- **Empty state**: `EmptyScreen` with "No GPF Statement available" message
- **Data state**: Employee info card + monthly table in a `ScrollView`
- **Pull-to-refresh**: `RefreshControl` wired to `refetch`
- **Error**: Passes through TanStack Query's `isError` (handled by default error boundary)

## States

| State      | Indicator                               |
| ---------- | --------------------------------------- |
| Loading    | Skeleton placeholder                    |
| Empty      | EmptyScreen with message + refresh      |
| Data       | Employee info card + monthly data table |
| Refreshing | RefreshControl spinner                  |

## File Changes

| File                                                            | Action                     |
| --------------------------------------------------------------- | -------------------------- |
| `src/features/gpf-statements/index.ts`                          | Add exports                |
| `src/features/gpf-statements/components/monthly-table.tsx`      | Create                     |
| `src/features/gpf-statements/screens/gpf-statement-screens.tsx` | Update                     |
| `src/app/gpf-statements/index.tsx`                              | Update route to use screen |

## Patterns Followed

- Same container/section/card pattern as `salary-statements-screen.tsx`
- Same `DetailRow` usage for employee info
- Same `Container` + `ScrollView` + `RefreshControl` pattern
- Card variant "bordered" for visual separation on canvas
