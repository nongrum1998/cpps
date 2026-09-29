// ─── Field Validators ────────────────────────────────────────

import { ONLY_LETTER_REGEX, ONLY_NUMBER_REGEX } from '@utils/constants';
import { parseYYYYMMDD } from '@utils/formatters';
import { calculateDaysBetweenDatesWithoutWeekends } from '@utils/helpers';
import { z } from 'zod';
import { ZodIssueCode } from 'zod/v3';

export const leaveCodeValidation = z
  .string('Leave Code is required')
  .min(1, 'Leave type is required')
  .regex(ONLY_LETTER_REGEX, 'Leave Code should only be letters');

export const leaveNoOfdaysValidation = z
  .string('Number of days is required')
  .min(1, 'Number of days is required')
  .regex(ONLY_NUMBER_REGEX, 'Invalid number');

export const leaveOrderNoValidation = z
  .string('Order number is required')
  .regex(ONLY_NUMBER_REGEX, 'Order number should be number only')
  .min(1, 'Order number is required');

export const leaveRemarksValidation = z.string('Leave remarks').nullable().optional();

export const leaveReasonTextValidation = z
  .string('Reason is required')
  .min(3, 'Reason is required');

export const leaveReasonCodeValidation = z
  .string('Reason code is required')
  .min(1, 'Reason is required')
  .regex(ONLY_NUMBER_REGEX, 'Reason code should only be letters');

// ─── Cross-field validation logic ────────────────────────────

export const refineLeaveDates = (
  data: {
    from_dt: string;
    to_dt: string;
    order_dt?: string;
    no_days?: string;
  },
  ctx: z.RefinementCtx
) => {
  const from = parseYYYYMMDD(data.from_dt);
  const to = parseYYYYMMDD(data.to_dt);
  const order = data.order_dt ? parseYYYYMMDD(data.order_dt) : null;
  const noDays = calculateDaysBetweenDatesWithoutWeekends(data.from_dt, data.to_dt);

  if (data.no_days && noDays !== data.no_days) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['no_days'],
      message: `Number of days must be ${noDays}`,
    });
  }

  if (!from) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['from_dt'],
      message: 'Invalid start date',
    });
  }

  if (!to) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['to_dt'],
      message: 'Invalid end date',
    });
  }

  if (order === null && data.order_dt) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['order_dt'],
      message: 'Invalid order date',
    });
  }

  if (!from || !to) return;
  if (data.order_dt && !order) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (from < today) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['from_dt'],
      message: 'Start date cannot be in the past',
    });
  }

  if (to < today) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['to_dt'],
      message: 'End date cannot be in the past',
    });
  }

  if (from >= to) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['from_dt'],
      message: 'Start date must be before end date',
    });
  }
};
