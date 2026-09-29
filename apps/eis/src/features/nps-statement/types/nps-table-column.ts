import type { NPSMonthlyRow } from './nps-monthly-row';

/** Column definition for the NPS monthly contribution table. */
export interface NPSMonthlyColumn {
  /** The key in NPSMonthlyRow to display. */
  key: keyof NPSMonthlyRow;
  /** The human-readable column header label. */
  label: string;
  /** Minimum width in px to keep columns readable when scrolling. */
  minWidth: number;
  /** When true, renders the cell with emphasis styling (bold, primary color). */
  emphasis?: boolean;
}
