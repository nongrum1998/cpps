# Home Screen Redesign — Employee Dashboard

**Status:** DRAFT
**Date:** 2026-06-25
**App:** Employee Mobile (e-HRMS)
**Target User:** Regular Employee

## Sections

### 1. Profile Header (ScreenHeader)

- Greeting: "Good Morning" / "Good Afternoon"
- User's full name (from `UserT.first_name + UserT.last_name`)
- Subtitle: `{designation} • {department}` (from `EmployeeT`)
- Bell icon (right side, notifications)
- No avatar, no search input
- Using existing `ScreenHeader` component

### 2. Progress Bar Stats Row — "Leave & Attendance"

A single `Card` containing horizontal progress bars for:

- **Annual Leave** — remaining days / total (e.g. `12/30`)
- **Sick Leave** — remaining days / total (e.g. `4/10`)
- **Present (Month)** — days present / working days (e.g. `18/22`)
- Each bar: thin rounded track, filled proportionally, with label on left and fraction on right
- Uses `Card` + `CardContent` from shared components

### 3. Quick Actions

Horizontal row of 3-4 icon-based action buttons:
| Action | Icon | Route |
|---|---|---|
| Apply Leave | `calendar-plus` | Leave screen |
| View Salary | `currency-inr` | Statement screen |
| My Attendance | `clipboard-check` | Attendance (future) |
| Pension | `bank` | Pension screen |

- Each: rounded icon container + label below
- Uses `MaterialCommunityIcons` + `TouchableOpacity`
- Routes via `PAGE_ROUTES` constants

### 4. Upcoming / Active Leaves

- Compact card showing current leave if active:
  - Leave type + date range
  - Status badge (Approved / Pending)
  - Duration in days
- Falls back to "No upcoming leaves" message
- Uses `Card` component

### 5. Recent Announcements

- Last 2-3 announcements as compact rows
- Title + date + brief preview text
- "View All" link header
- Flat list or map

## Layout

- `ScrollView` wrapping all sections (replacing current `FlatList` which was employee-only)
- Sections stacked vertically with consistent `gap-4` or `mb-6` spacing
- Fade-in animations via existing `FadeInView` / `AnimationProvider`
- Consistent spacing: `px-6` content padding

## Data / Types

### Mock Data (fully typed)

```typescript
interface HomeDashboardData {
  user: UserT & { designation: string; department: string; office_location: string };
  leaveBalance: {
    annual: { used: number; total: number };
    sick: { used: number; total: number };
  };
  attendance: { present: number; workingDays: number };
  activeLeave: {
    type: string;
    startDate: string;
    endDate: string;
    status: 'APPROVED' | 'PENDING';
    days: number;
  } | null;
  announcements: Array<{
    id: string;
    title: string;
    date: string;
    preview: string;
  }>;
}
```

### Future Backend

- All data will come from React Query hooks fetching from RPC/API endpoints
- `useHomeDashboard()` hook returning `HomeDashboardData`
- During mock phase, hook returns static typed data with `isFetching: false`

## Components to Create

### `src/features/home/components/leave-progress-card.tsx`

- Single Card with progress bars for leave + attendance
- Props: `annual`, `sick`, `present`, `workingDays`

### `src/features/home/components/quick-actions.tsx`

- Horizontal row of icon action buttons
- Props: none (routes are static)

### `src/features/home/components/active-leave-card.tsx`

- Compact leave status card
- Props: `leave: ActiveLeave | null`

### `src/features/home/components/announcements-preview.tsx`

- Recent announcements section
- Props: `announcements: Announcement[]`

## Hook

### `src/features/home/hooks/use-home-dashboard.ts`

- Returns `HomeDashboardData` (mock for now)
- Fully typed with `HomeDashboardData` interface
- Ready to swap to React Query when backend connects

## Files to Modify

- `src/features/home/screens/home-screen.tsx` — complete rewrite of content area
- `src/features/home/types/index.ts` — add `HomeDashboardData` type
- `src/features/home/index.ts` — export new components
