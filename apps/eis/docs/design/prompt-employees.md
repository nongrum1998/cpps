# Google Stitch Prompt — Staff Directory

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen: Staff Directory

**Route:** `/employees`
**Purpose:** Browse and search employee directory.

### Header

- `SectionHeader`: "Staff Directory" — `typography.display-xs` (20px/500)
- bg `--secondary` (#f7f7f7)

### Search Bar

- **SearchInput** component:
  - bg `--surface-card`, 8px radius (`rounded.lg`), 1px `--hairline` border
  - 40px height
  - Left: search magnifying glass icon (24px), `--graphite`
  - Placeholder: "Search by name, department, or designation"
  - Clear button (×) on right when text entered
  - `typography.body-md` (16px/400)

### Filter

- **FilterCard**: horizontal scrollable filter chips
  - Department filter: "All", "IT", "HR", "Finance", "Admin", etc.
  - Active filter: bg `--primary`, white text
  - Inactive: bg `--surface-card`, 1px `--hairline` border, `--ink` text
  - Chips: 8px radius, padding 8px 16px

### List

- `FlatList` with `RefreshControl`
- Each item as `<EmployeeListItem>`:

  **Card layout:**
  - bg `--surface-card`, 16px radius, Soft Lift shadow, 12px padding
  - Row layout (avatar + info):
    - **Avatar**: 48px circle, `--primary-soft` bg, initials "JD" in `--primary` text — `typography.body-emphasis`
    - **Name**: "Jane Doe" — `typography.body-emphasis` (16px/500)
    - **Designation**: "Software Engineer" — `typography.caption-md` (14px/400), `--charcoal`
    - **Department**: "IT Department" — `typography.caption-sm` (12px/400), `--graphite`
    - Right chevron icon → detail

### States

| State                         | Behaviour                                 |
| ----------------------------- | ----------------------------------------- |
| **Loading**                   | 6 shimmer list items with avatar circles  |
| **Empty** (no search results) | "No employees found matching your search" |
| **Empty** (no data)           | "No employees in directory"               |
| **Error**                     | Refresh button                            |
| **Populated**                 | Search + filter + scrollable list         |
| **Searching**                 | Real-time filter as user types            |

### Data Model

```typescript
// Employee type (combined with UserT)
EmployeeT = {
  id: "emp-123"
  userId: "user-456"
  employee_id: "EMP001"
  designation: "Software Engineer"
  department: "IT Department"
  office_location: "New Delhi"
  city_class: "X"
  pay_level: 10
  pay_cell: 5
  date_of_joining: "15/01/2022"
  status: "ACTIVE"                  // ACTIVE | INACTIVE
  pan_number: "ABCDE1234F"
  pran_number: "PRAN12345678"
  cghs_card_no: "CGHS00123456"
  uan_number: "UAN123456789012"
  bank_account_no: "12345678901"
  bank_ifsc: "SBIN0001234"
  user: {
    emp_fname: "Jane"
    emp_mname: "M"
    emp_lname: "Doe"
    emp_email: "jane.doe@example.com"
    emp_phone: "9876543210"
    emp_designation: "Software Engineer"
    emp_dept: "IT Department"
  }
}
```

### Navigation

- Tap employee card → `/profile` (Employee Profile screen)
- Bottom tab: More → select Staff Directory

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show search bar with active filter chips, list of 4 employees with initials avatars, and empty search state. HP Design System tokens.
