# Google Stitch Prompt — Auth Screens

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen 1: Login Screen

**Route:** `/auth/login`
**Purpose:** Authenticate existing users with employee code + password.

### Header

- Govt branding strip at top: Indian tricolor (saffron, white, green) or government emblem, height ~60px
- Title: "Authentication" — `typography.display-xs` (20px/500)
- Subtitle: "Please sign in to continue" — `typography.body-md` (16px/400), `--charcoal` (#3d3d3d)

### Form

- **Field: Employee Code** (`emp_cd`)
  - Label: "Employee Code" — `typography.caption-md` (14px/400)
  - Placeholder: "Please enter your Employee Code"
  - Text input: 44px height, 4px radius, 1px `--input` border, full width
  - Auto-capitalize none, auto-correct off
  - Keyboard: default type

- **Field: Password**
  - Label: "Password"
  - Placeholder: "••••••••"
  - Secure text entry (dots mask characters)
  - 44px height, 4px radius, 1px `--input` border, full width
  - `returnKeyType: "done"`

- **Forgot Password link**
  - Below password field, right-aligned
  - Text: "Forgot password?" — `typography.link-md` (16px/500), `--primary` (#024ad8)
  - Hit slop: 15px all sides
  - Links to `/auth/forgot-password`

- **Continue button**
  - Full width, 44px height, bg `--primary` (#024ad8), 4px radius
  - Label: "Continue" — uppercase, `typography.button-md` (14px/600/0.7px tracking), white
  - Loading state: spinner replaces text when `isPending`
  - Disabled state: bg `--input` (#c2c2c2), when cooldown active

### Footer

- Text: "By signing in, you agree to our"
- Link: "Terms of Service" — `typography.link-md`, `--primary`

### States

| State                  | Behaviour                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| **Loading**            | `<LoginScreenSkeleton />` — two shimmer field blocks + button placeholder |
| **Form**               | Empty fields (dev: pre-filled from env)                                   |
| **Submitting**         | Button shows spinner, fields remain interactive                           |
| **Error — API**        | `toast.error()` with backend message                                      |
| **Error — Validation** | Inline field errors below each input, red (#b3262b) text                  |
| **Rate limited**       | Button disabled with "Please wait" feedback (1 req / 10s sliding window)  |

### Data Model

```typescript
LoginSchema = {
  emp_cd: string  // Employee code, uppercase transformed
  password: string
}
```

### Navigation

- On success: redirects to `/home`
- Footer link: `/auth/signup`

---

## Screen 2: Sign Up Screen

**Route:** `/auth/signup`
**Purpose:** Register a new user with personal details.

### Header

- Icon: 🚀 emoji in a `--primary-soft` (#c9e0fc) 48px circle
- Title: "Create account" — `typography.display-xs`
- Subtitle: "Provide your details to register." — `typography.body-md`, `--charcoal`

### Form

Two-column row for names:

- **First name** (flex-1): label "First name", placeholder "John", letters-only validation
- **Last name** (flex-1): label "Last name", placeholder "Doe", letters-only validation

- **Phone Number**: label "Phone Number", placeholder "9876543210", `keyboardType: "phone-pad"`
- **Password**: label "Password", placeholder "Create a password", secure text entry
- **Confirm Password**: label "Confirm Password", placeholder "Create a password", secure text entry

- **Terms text**: "By signing up, you agree to our Terms & Privacy Policy" — `typography.caption-md`, `--graphite`
- **Create account button**: full width, 44px, `--primary`, "Create account" uppercase

### States

| State                | Behaviour                                                                      |
| -------------------- | ------------------------------------------------------------------------------ |
| **Loading**          | Skeleton with 5 field placeholders                                             |
| **Form**             | All fields empty                                                               |
| **Validation error** | Inline per-field messages (e.g., "Passwords do not match" on confirm_password) |
| **API error**        | Toast with server message                                                      |
| **Submitting**       | Button spinner, fields disabled                                                |

### Data Model

```typescript
SignUpSchema = {
  first_name: string      // letters only, required
  last_name: string       // letters only, required
  phone_no: string        // valid phone format
  password: string        // min requirements
  confirm_password: string // must match password
}
```

### Navigation

- Footer: "Already have an account? Sign in" → `/auth/login`

---

## Screen 3: Forgot Password Screen

**Route:** `/auth/forgot-password?step=EMPCODE|OTP|RESET`
**Purpose:** Multi-step password reset flow.

### Step 1 — EMPCODE

- Header icon: lock-closed icon (Ionicons), 32px, `--primary`
- Title: "Forgot Password?"
- Subtitle: "Don't worry! It happens. Please enter the Employee Code associated with your account."
- Field: Employee Code input (same style as login)
- Continue button

### Step 2 — OTP

- Title: "Verify OTP"
- Subtitle: "Enter the verification code sent to your phone."
- 6-digit OTP input (one digit per box, or single masked input)
- Verify button
- Resend link

### Step 3 — RESET

- Title: "Reset Password"
- Subtitle: "Create a new strong password for your account."
- New password input (secure)
- Confirm password input (secure)
- Reset button

### Data Model

```typescript
ForgotPasswordSchema = {
  emp_cd: string
}
OtpSchema = {
  otp: string   // 6-digit code
}
ResetPasswordSchema = {
  password: string
  confirm_password: string
}
```

### Navigation

- Stack header with back arrow
- Step changes via `?step=` query param
- On complete: redirect to `/auth/login`

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844). Include light and dark mode variants. Show all states (loading skeleton, form with validation errors, submitting with spinner, API error toast). Use the HP Design System tokens from `design-system.md` — no custom colors or spacing.
