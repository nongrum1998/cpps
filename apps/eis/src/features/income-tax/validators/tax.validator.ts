import { z } from 'zod';

function numberField(min: number, max?: number, message?: string) {
  return z.string().transform((val, ctx) => {
    const n = Number(val);
    if (val === '' || Number.isNaN(n)) return 0;
    if (n < min) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cannot be negative' });
      return z.NEVER;
    }
    if (max !== undefined && message !== undefined && n > max) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      return z.NEVER;
    }
    return n;
  });
}

export const UpdateTaxSchema = z.object({
  regime: z.enum(['NEW', 'OLD'], { message: 'Please select a tax regime' }),
  deductions80C: numberField(0, 150000, 'Max Rs 1,50,000 under Section 80C'),
  deductions80D: numberField(0, 100000, 'Max Rs 1,00,000 under Section 80D'),
  hraExemption: numberField(0),
  ltaExemption: numberField(0),
  homeLoanInterest: numberField(0, 200000, 'Max Rs 2,00,000 under Section 24(b)'),
  npsContribution: numberField(0, 50000, 'Max Rs 50,000 under Section 80CCD(1B)'),
});

export type UpdateTaxInput = z.output<typeof UpdateTaxSchema>;

export const CreateTaxSchema = z.object({
  regime: z.enum(['NEW', 'OLD'], { message: 'Please select a tax regime' }),
  deductions80C: numberField(0, 150000, 'Max Rs 1,50,000 under Section 80C'),
  deductions80D: numberField(0, 100000, 'Max Rs 1,00,000 under Section 80D'),
  hraExemption: numberField(0),
  ltaExemption: numberField(0),
  homeLoanInterest: numberField(0, 200000, 'Max Rs 2,00,000 under Section 24(b)'),
  npsContribution: numberField(0, 50000, 'Max Rs 50,000 under Section 80CCD(1B)'),
});

export type CreateTaxInput = z.output<typeof UpdateTaxSchema>;
