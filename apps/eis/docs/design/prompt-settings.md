# Google Stitch Prompt — Settings

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen: App Settings

**Route:** `/settings`
**Purpose:** Configure app preferences for appearance and security.

### Header

- Stack header: back arrow + "Settings"
- bg `--canvas`

### Sections

Each section is a group of toggle/list items separated by `--hairline` dividers. Section backgrounds alternate `--canvas` with `--secondary` (cloud #f7f7f7) bands.

#### Appearance

- **Dark Mode**: Toggle switch
  - Label: "Dark Mode" — `typography.body-md` (16px/400)
  - Subtitle: "Switch between light and dark theme" — `typography.caption-sm` (12px/400), `--graphite`
  - Switch track: `--primary` when on, `--input` when off
  - Reflects current theme from `useThemeStore`

#### Security

- **Change Password**: List item with right chevron
  - Label: "Change Password" — `typography.body-md`
  - Subtitle: "Update your account password" — `typography.caption-sm`, `--graphite`
  - Tap → opens change password form (modal or navigate)

- **Biometric Login**: Toggle switch (if device supports)
  - Label: "Biometric Login"
  - Subtitle: "Use fingerprint or face to sign in"

- **Session Timeout**: Picker or list
  - Label: "Session Timeout"
  - Subtitle: "Auto-logout after inactivity"
  - Options: 5 min, 15 min, 30 min, 1 hour, Never

#### Account

- **Logout**: Full width button, outline style
  - bg transparent, 1px `--destructive` border, text `--destructive`
  - Label: "Logout" — `typography.button-md`, uppercase
  - Tap → confirmation dialog → clears auth → redirects to `/auth/login`

#### About

- **App Version**: "1.0.0" — `typography.caption-sm`, `--graphite`
- **Build**: "2026.07.01" — `typography.caption-sm`, `--graphite`

### States

| State                | Behaviour                                     |
| -------------------- | --------------------------------------------- |
| **Loading**          | Skeleton with 4–5 toggle rows                 |
| **Populated**        | Full settings list with toggles/items         |
| **Dark mode toggle** | Immediately switches theme, persists to store |
| **Logout**           | Alert dialog → confirm → loading → redirect   |

### Data Model

```typescript
// Theme state
ThemeStore = {
  theme: "light" | "dark"    // current active theme
  setTheme: (theme) => void   // toggle handler
}
```

### Navigation

- Bottom tab: More → select Settings
- Change Password tap → navigate to reset flow

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode variants. Show settings grouped into Appearance, Security, Account, and About sections with toggles, list items, and logout button. HP Design System tokens.
