# Google Stitch Prompt — Employee Profile

> **Design system:** See `design-system.md` for full token reference.
> **Platform:** React Native / Expo mobile (iOS 390×844), dark mode variants.

---

## Screen: Employee Profile

**Route:** `/profile`
**Purpose:** Display full employee details in a NIC (National Informatics Centre) portal style with sectioned identity cards.

### Header

- **Govt branding header**: Indian government banner strip (saffron, white, green tricolor bars), full width, ~60px height
- **Stack header**: back arrow + "Profile"
- bg `--canvas`

### Identity Section

**Identity Card** — bg `--surface-card`, 16px radius, Soft Lift shadow, 20px padding:

- **Avatar**: Large circle (72px), `--primary-soft` bg, initials "JMD" in `--primary` text, `typography.display-sm`
- **Full name**: "Jane M. Doe" — `typography.display-xs` (20px/500)
- **Designation**: "Software Engineer" — `typography.body-md` (16px/400), `--charcoal`
- **Department**: "IT Department" — `typography.caption-md` (14px/400), `--graphite`
- **Employee Code**: "EMP001" — `typography.caption-sm`, `--primary`
- **Status badge**: "Active" — bg `--semantic-up`, white text

### Section Cards (NIC Portal style)

Each section is a `--surface-card`, 16px radius, Soft Lift shadow, 16px padding, with a `--primary` left border accent (4px).

#### Personal Details

| Field          | Value      |
| -------------- | ---------- |
| First Name     | Jane       |
| Middle Name    | M          |
| Last Name      | Doe        |
| Date of Birth  | 15/08/1990 |
| Gender         | Female     |
| Marital Status | Married    |
| Blood Group    | B+         |

#### Contact Details

| Field   | Value                  |
| ------- | ---------------------- |
| Email   | jane.doe@example.com   |
| Phone   | 9876543210             |
| Address | 123, Sector 14, Dwarka |
| City    | New Delhi              |
| State   | Delhi                  |
| PIN     | 110075                 |

#### Employment Details

| Field           | Value                |
| --------------- | -------------------- |
| Employee ID     | EMP001               |
| Designation     | Software Engineer    |
| Department      | IT Department        |
| Date of Joining | 15/01/2022           |
| Office Location | New Delhi            |
| City Class      | X                    |
| Pay Level       | 10                   |
| Pay Cell        | 5                    |
| Pay Commission  | 7th CPC              |
| Pay Scale       | 56100–177500         |
| PF Series       | CG                   |
| PF Type         | Tier 1               |
| PF Agency       | Central              |
| DDO Code        | DDO123               |
| DDO Name        | DDO Office New Delhi |
| Treasury Code   | TREA001              |
| WEF Date        | 01/01/2022           |
| Increment Date  | 01/07/2023           |

#### Bank Details

| Field           | Value               |
| --------------- | ------------------- |
| Bank Account No | 12345678901         |
| IFSC Code       | SBIN0001234         |
| Bank Name       | State Bank of India |

#### Identification Numbers

| Field     | Value           |
| --------- | --------------- |
| PAN       | ABCDE1234F      |
| PRAN      | PRAN12345678    |
| CGHS Card | CGHS00123456    |
| UAN       | UAN123456789012 |

### Preferences Section

- Dark mode toggle (switch)
- Language selector (if available)
- **Logout button**: Full width outline, `--destructive` (#b3262b) border + text, 4px radius

### Data Model

```typescript
UserT = {
    basic_pay:           string;
    current_gis_group:   string;
    ddo_code:            string;
    ddo_name:            string;
    emp_bank_account_no: string;
    emp_bank_ifsc:       string;
    emp_birth_dt:        Date;
    emp_city_class:      string;
    emp_date_of_joining: Date;
    emp_dept:            string;
    emp_designation:     string;
    emp_email:           string;
    emp_fname:           string;
    emp_gazetted:        string;
    emp_lname:           string;
    emp_mname:           string;
    emp_pan_number:      string;
    emp_phone:           string;
    emp_sex:             string;
    emp_status:          string;
    emp_supan_dt:        Date;
    emp_type:            string;
    gis_applicable:      string;
    inc_dt:              Date;
    off_id:              string;
    office_name:         string;
    parent_dept:         string;
    pay_comm:            string;
    pay_scale:           string;
    pf_agency:           string;
    pf_no:               string;
    pf_pran_no:          string;
    pf_series:           string;
    pf_type:             string;
    state_service:       string;
    trea_code:           string;
    wef_dt:              Date;
};
```

### Navigation

- Bottom tab: More → select Profile

---

## Output Directive

Generate mobile UI mockup for React Native/Expo (iOS 390×844) with light and dark mode. Show NIC portal-style profile with govt header, identity card, and sectioned detail cards with blue left border accent. Include all sections: personal, contact, employment, bank, identification. HP Design System tokens.
