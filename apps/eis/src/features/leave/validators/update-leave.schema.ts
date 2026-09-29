import { z } from 'zod';
import {
  leaveCodeValidation,
  leaveNoOfdaysValidation,
  leaveOrderNoValidation,
  refineLeaveDates,
  leaveRemarksValidation,
  leaveReasonTextValidation,
} from './common';
import { dateValidation } from '@validators/common';

export const UpdateLeaveSchema = z
  .object({
    leave_cd: leaveCodeValidation,
    from_dt: dateValidation('Start date'),
    to_dt: dateValidation('End date'),
    no_days: leaveNoOfdaysValidation,
    remarks: leaveRemarksValidation,
    order_dt: dateValidation('Order date'),
    order_no: leaveOrderNoValidation,
    reason_text: leaveReasonTextValidation.optional(),
    reason_cd: leaveRemarksValidation.optional(),
  })
  .superRefine((data, ctx) => refineLeaveDates(data, ctx));

export type UpdateLeaveInput = z.infer<typeof UpdateLeaveSchema>;
