# Google Stitch Prompt — Announcement Board

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen: Announcement Board

**Route:** `/announcements`
**Purpose:** Display system announcements and important notices.

### Header

- `SectionHeader`: "Announcements" — `typography.display-xs` (20px/500)
- bg `--secondary` (#f7f7f7)

### List

- `FlatList` with `RefreshControl`
- Each item as `<AnnouncementCard>`:

  **Card layout:**
  - bg `--surface-card`, 16px radius, Soft Lift shadow, 16px padding
  - **Type badge** (top-left):
    - `UR` (Urgent): bg `--destructive` (#b3262b), white text, 8px radius — "URGENT"
    - `NU` (New User): bg `--primary` (#024ad8), white text — "NEW"
  - **Title**: "System Maintenance on Saturday" — `typography.body-emphasis` (16px/500)
  - **Message / Excerpt**: "The portal will be down for scheduled..." — `typography.body-md` (16px/400), `--charcoal`
  - **Date**: "15/06/2026" — `typography.caption-sm` (12px/400), `--graphite`
  - Expandable body (hidden by default, tap to expand):
    - Full body content (HTML or plain text)
    - `typography.caption-md`, `--charcoal`

- Cards sorted by: UR first, then most recent

### States

| State         | Behaviour                                              |
| ------------- | ------------------------------------------------------ |
| **Loading**   | 4 skeleton announcement cards                          |
| **Empty**     | "No announcements" — illustration + "Check back later" |
| **Error**     | Refresh button                                         |
| **Populated** | Scrollable list, tap card to expand body               |

### Data Model

```typescript
AnnouncementT = {
  id: "ann-001"
  title: "System Maintenance on Saturday"
  message: "The portal will be unavailable from 10 PM to 2 AM"
  body: "<p>The employee portal will undergo scheduled maintenance...</p>"
  type: "UR"              // NU = New User, UR = Urgent
  status: "A"             // A = Active, N = Inactive
  emp_cd: null             // null = company-wide
  created_at: "2026-06-15T10:00:00Z"
}
```

### Navigation

- Bottom tab: More → select Announcements

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show 3 announcements (1 urgent red badge, 2 normal blue badges), one expanded. HP Design System tokens.
