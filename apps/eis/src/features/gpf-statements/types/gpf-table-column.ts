import type { GPFMonthlyData, GPFSummary } from './gpf-statement';

/** Column definition for the GPF summary table. */
export interface GPFSummaryColumn {
  /** The key in GPFSummary to display. */
  key: keyof GPFSummary;
  /** The human-readable column header label. */
  label: string;
  /** Minimum width in px to keep columns readable when scrolling. */
  minWidth: number;
  /** When true, renders the cell with emphasis styling (bold, primary color). */
  emphasis?: boolean;
}

/** Column definition for the monthly GPF data table. */
export interface GPFMonthlyColumn {
  /** The key in GPFMonthlyData to display. */
  key: keyof GPFMonthlyData;
  /** The human-readable column header label. */
  label: string;
  /** Minimum width in px to keep columns readable when scrolling. */
  minWidth: number;
  /** When true, renders the cell with emphasis styling (bold, primary color). */
  emphasis?: boolean;
}
