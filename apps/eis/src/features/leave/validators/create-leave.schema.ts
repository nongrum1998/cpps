import { z } from 'zod';
import {
  leaveCodeValidation,
  leaveNoOfdaysValidation,
  leaveOrderNoValidation,
  leaveReasonCodeValidation,
  leaveReasonTextValidation,
  refineLeaveDates,
  leaveRemarksValidation,
} from './common';
import { dateValidation } from '@validators/common';

// ─── Schemas ─────────────────────────────────────────────────

/**
 * Zod validation schema for the create-leave form.
 *
 * Validates an object with the following fields:
 * - `leave_cd`: required leave type code (letters only)
 * - `from_dt` / `to_dt` / `order_dt`: dates in `yyyy-mm-dd` order (see
 *   {@link dateValidation})
 * - `no_days`: required number of days (digits only)
 * - `order_no`: required order number (digits only)
 * - `remarks`: optional, nullable string
 * - `reason_text`: required reason, at least 3 characters
 * - `reason_cd`: required reason code (digits only)
 *
 * A `.superRefine` pass runs {@link refineLeaveDates} for cross-field checks:
 * `no_days` must equal the number of working days between `from_dt` and
 * `to_dt`, all dates must parse and not be in the past, and `from_dt` must be
 * strictly before `to_dt`. Failures are reported as custom issues on the
 * offending field paths.
 *
 * Use it as the resolver for react-hook-form (`zodResolver(CreateLeaveSchema)`)
 * and infer the form value type with {@link CreateLeaveInputs}.
 *
 * @example
 * const result = CreateLeaveSchema.safeParse({
 *   leave_cd: 'CL',
 *   from_dt: '2026-08-10',
 *   to_dt: '2026-08-12',
 *   no_days: '2',
 *   order_dt: '2026-08-05',
 *   order_no: '123',
 *   remarks: null,
 *   reason_text: 'Family event',
 *   reason_cd: '1',
 * });
 */
export const CreateLeaveSchema = z
  .object({
    leave_cd: leaveCodeValidation,
    from_dt: dateValidation('Start date'),
    to_dt: dateValidation('End date'),
    no_days: leaveNoOfdaysValidation,
    order_dt: dateValidation('Order date'),
    order_no: leaveOrderNoValidation,
    remarks: leaveRemarksValidation,
    reason_text: leaveReasonTextValidation,
    reason_cd: leaveReasonCodeValidation,
  })
  .superRefine((data, ctx) => refineLeaveDates({ ...data, order_dt: data.order_dt }, ctx));

/**
 * Form field values inferred from the {@link CreateLeaveSchema} Zod validation
 * schema. Use as the generic type for `useForm<CreateLeaveInputs>`.
 */
export type CreateLeaveInputs = z.infer<typeof CreateLeaveSchema>;
