/** Represents the valid categories of an announcement. `'NU'` for new user announcements, `'UR'` for urgent/important alerts. */
export type AnnouncementTypeT = 'NU' | 'UR';
/** Represents the visibility status of an announcement. `'A'` for active/visible, `'N'` for inactive/hidden. */
export type AnnouncementStatusT = 'A' | 'N';

/** Represents a single announcement entry within the system. Each announcement has a title, body content, a display message, status indicator, and an associated employee code (if scoped to a specific employee). */
export interface AnnouncementT {
  /** The main HTML or plain-text body content of the announcement. */
  body: string;
  /** The employee code this announcement is targeted to, or `null` if it is a general (company-wide) announcement. */
  emp_cd: string | null;
  /** A short display message or summary associated with the announcement. */
  message: string;
  /** The processing or visibility status of the announcement (e.g. `'active'`, `'draft'`, `'archived'`). */
  status: AnnouncementStatusT;
  /** The headline or title of the announcement. */
  title: string;
  /** The category of the announcement — either `'NU'` (new user) or `'UR'` (urgent). */
  type: AnnouncementTypeT;

  /** The ISO 8601 timestamp of when the announcement was created. */
  created_at: string;
}

/** Wrapper type for paginated or batch responses from the announcements API. Contains an array of announcement items. */
export interface AnnouncementResponseT {
  /** The list of announcements returned by the API. */
  items: AnnouncementT[];
}
