import { z } from 'zod';
import {
  RegisterPasswordSchema,
  RegisterPensionerSchema,
  RegisterPersonalInfoSchema,
  RegistrationStatusSchema,
} from '@features/auth/validators/registration';
import { formatPassword } from '@lib/encryption';

jest.mock('@lib/encryption', () => ({
  encryptText: jest.fn(),
  decryptText: jest.fn(),
  sha256: jest.fn(),
  formatPassword: jest.fn((value: string) => `formatted:${value}`),
}));

const validDob = '01-01-1990';
const validBankAccount = '1234567890123456';
const validPassword = 'Password1';
const validPpoNo = 'PPO/123';

const validPensioner = {
  ppo_no: validPpoNo,
  dob: validDob,
  password: validPassword,
  bank_account_number: validBankAccount,
};

/** Parses `data` with `schema` and returns the parsed data when it is valid. */
const expectValid = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Expected valid input, got: ${JSON.stringify(result.error.issues)}`);
  }
  return result.data;
};

/** Parses `data` with `schema` and asserts it is invalid, optionally matching the first issue message. */
const expectInvalid = <T>(schema: z.ZodType<T>, data: unknown, message?: string) => {
  const result = schema.safeParse(data);
  expect(result.success).toBeFalsy();
  if (message) {
    expect(result.error?.issues[0]?.message).toBe(message);
  }
};

describe('RegistrationStatusSchema - ppo_no', () => {
  describe('length boundaries', () => {
    it('accepts a PPO number of exactly 3 characters (minimum)', () => {
      expectValid(RegistrationStatusSchema, { ppo_no: 'abc' });
    });

    it('accepts a PPO number of exactly 20 characters (maximum)', () => {
      expectValid(RegistrationStatusSchema, { ppo_no: 'a'.repeat(20) });
    });

    it('rejects a PPO number shorter than 3 characters', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: 'ab' }, 'Invalid PPO Number');
    });

    it('rejects a PPO number longer than 20 characters', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: 'a'.repeat(21) }, 'Invalid PPO Number');
    });

    it('rejects an empty PPO number', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: '' }, 'Invalid PPO Number');
    });

    it('rejects a whitespace-only PPO number', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: '   ' }, 'Invalid PPO Number');
    });
  });

  describe('allowed characters', () => {
    it.each(['PPO123', 'user_name', 'PPO/123', '_user1', 'user1/'])(
      'accepts PPO number %s',
      (ppo_no) => {
        expectValid(RegistrationStatusSchema, { ppo_no });
      }
    );

    it.each(['user-name', 'user.name', 'user@name', "user'name", 'user+name', 'usér1', 'user😀'])(
      'rejects PPO number %s',
      (ppo_no) => {
        expectInvalid(RegistrationStatusSchema, { ppo_no }, 'Invalid PPO Number');
      }
    );
  });

  describe('whitespace', () => {
    it('rejects leading whitespace (regex runs before trim)', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: ' abc' }, 'Invalid PPO Number');
    });

    it('rejects trailing whitespace (regex runs before trim)', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: 'abc ' }, 'Invalid PPO Number');
    });

    it('rejects tab characters', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: 'ab\tc' }, 'Invalid PPO Number');
    });

    it('rejects newline characters', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: 'ab\nc' }, 'Invalid PPO Number');
    });
  });

  describe('invalid types', () => {
    it('rejects a missing ppo_no', () => {
      expectInvalid(RegistrationStatusSchema, {}, 'PPO Number is Required');
    });

    it('rejects a null ppo_no', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: null }, 'PPO Number is Required');
    });

    it('rejects an undefined ppo_no', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: undefined }, 'PPO Number is Required');
    });

    it('rejects a numeric ppo_no', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: 12345 }, 'PPO Number is Required');
    });

    it('rejects a boolean ppo_no', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: true }, 'PPO Number is Required');
    });

    it('rejects an object ppo_no', () => {
      expectInvalid(RegistrationStatusSchema, { ppo_no: {} }, 'PPO Number is Required');
    });
  });
});

describe('RegistrationStatusSchema - Whole Object', () => {
  it('rejects an empty object', () => {
    expectInvalid(RegistrationStatusSchema, {}, 'PPO Number is Required');
  });
});

describe('RegisterPersonalInfoSchema - dob', () => {
  it('accepts a 10-character date of birth', () => {
    expectValid(RegisterPersonalInfoSchema, {
      dob: validDob,
      bank_account_number: validBankAccount,
    });
  });

  it('accepts a date of birth longer than 10 characters (no maximum enforced)', () => {
    expectValid(RegisterPersonalInfoSchema, {
      dob: '01-01-1990-extra',
      bank_account_number: validBankAccount,
    });
  });

  it('trims surrounding whitespace from the parsed date of birth', () => {
    const data = expectValid(RegisterPersonalInfoSchema, {
      dob: '  01-01-1990  ',
      bank_account_number: validBankAccount,
    });
    expect(data.dob).toBe(validDob);
  });

  it('rejects a date of birth shorter than 10 characters', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: '01-01-90', bank_account_number: validBankAccount },
      'Date of Birth should be 10 in length'
    );
  });

  it('rejects an empty date of birth', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: '', bank_account_number: validBankAccount },
      'Date of Birth should be 10 in length'
    );
  });

  describe('invalid types', () => {
    it('rejects a missing dob', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { bank_account_number: validBankAccount },
        'Date of Birth is Required'
      );
    });

    it('rejects a null dob', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: null, bank_account_number: validBankAccount },
        'Date of Birth is Required'
      );
    });

    it('rejects an undefined dob', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: undefined, bank_account_number: validBankAccount },
        'Date of Birth is Required'
      );
    });

    it('rejects a numeric dob', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: 19900101, bank_account_number: validBankAccount },
        'Date of Birth is Required'
      );
    });

    it('rejects a boolean dob', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: true, bank_account_number: validBankAccount },
        'Date of Birth is Required'
      );
    });

    it('rejects an object dob', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: {}, bank_account_number: validBankAccount },
        'Date of Birth is Required'
      );
    });
  });
});

describe('RegisterPersonalInfoSchema - bank_account_number', () => {
  it('accepts exactly 16 digits', () => {
    const data = expectValid(RegisterPersonalInfoSchema, {
      dob: validDob,
      bank_account_number: validBankAccount,
    });
    expect(data.bank_account_number).toBe(validBankAccount);
  });

  it('rejects an account number shorter than 16 characters', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: validDob, bank_account_number: '123456789012345' },
      'Account no should be 16 in length'
    );
  });

  it('rejects an account number longer than 16 characters', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: validDob, bank_account_number: '12345678901234567' },
      'Account no should be not less then 16 in length'
    );
  });

  it('rejects an empty account number', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: validDob, bank_account_number: '' },
      'Account no should be 16 in length'
    );
  });

  it('rejects a 16-character account number containing non-digits', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: validDob, bank_account_number: '123456789012345a' },
      'Invalid string: must match pattern /^\\d+$/'
    );
  });

  describe('invalid types', () => {
    it('rejects a missing bank_account_number', () => {
      expectInvalid(RegisterPersonalInfoSchema, { dob: validDob }, 'Account no is Required');
    });

    it('rejects a null bank_account_number', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: validDob, bank_account_number: null },
        'Account no is Required'
      );
    });

    it('rejects an undefined bank_account_number', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: validDob, bank_account_number: undefined },
        'Account no is Required'
      );
    });

    it('rejects a numeric bank_account_number', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: validDob, bank_account_number: 1234567890123456 },
        'Account no is Required'
      );
    });

    it('rejects a boolean bank_account_number', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: validDob, bank_account_number: true },
        'Account no is Required'
      );
    });

    it('rejects an object bank_account_number', () => {
      expectInvalid(
        RegisterPersonalInfoSchema,
        { dob: validDob, bank_account_number: {} },
        'Account no is Required'
      );
    });
  });
});

describe('RegisterPersonalInfoSchema - organization', () => {
  it('accepts an organization of exactly 3 characters (minimum)', () => {
    expectValid(RegisterPersonalInfoSchema, {
      dob: validDob,
      bank_account_number: validBankAccount,
      organization: 'ABC',
    });
  });

  it('accepts a missing organization (optional)', () => {
    const data = expectValid(RegisterPersonalInfoSchema, {
      dob: validDob,
      bank_account_number: validBankAccount,
    });
    expect(data.organization).toBeUndefined();
  });

  it('accepts a null organization (nullable)', () => {
    const data = expectValid(RegisterPersonalInfoSchema, {
      dob: validDob,
      bank_account_number: validBankAccount,
      organization: null,
    });
    expect(data.organization).toBeNull();
  });

  it('rejects an organization shorter than 3 characters', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: validDob, bank_account_number: validBankAccount, organization: 'AB' },
      'Invalid organization'
    );
  });

  it('rejects an empty organization', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: validDob, bank_account_number: validBankAccount, organization: '' },
      'Invalid organization'
    );
  });

  it('rejects a numeric organization', () => {
    expectInvalid(
      RegisterPersonalInfoSchema,
      { dob: validDob, bank_account_number: validBankAccount, organization: 123 },
      'Organization is Required'
    );
  });
});

describe('RegisterPersonalInfoSchema - Whole Object', () => {
  it('rejects an empty object', () => {
    expectInvalid(RegisterPersonalInfoSchema, {}, 'Date of Birth is Required');
  });

  it('strips unknown keys from a valid registration', () => {
    expectValid(RegisterPersonalInfoSchema, {
      dob: validDob,
      bank_account_number: validBankAccount,
      organization: 'ABC Corp',
      rememberMe: true,
    });
  });
});

describe('RegisterPasswordSchema - password', () => {
  describe('length boundaries', () => {
    it('accepts a password of exactly 8 characters (minimum)', () => {
      expectValid(RegisterPasswordSchema, { password: '12345678', confirm_password: '12345678' });
    });

    it('accepts a password of exactly 50 characters (maximum)', () => {
      expectValid(RegisterPasswordSchema, {
        password: 'a'.repeat(50),
        confirm_password: 'a'.repeat(50),
      });
    });

    it('rejects a password shorter than 8 characters', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: '1234567', confirm_password: '1234567' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a password longer than 50 characters', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: 'a'.repeat(51), confirm_password: 'a'.repeat(51) },
        'Password must be at most 50 characters'
      );
    });

    it('rejects an empty password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: '', confirm_password: '' },
        'Password must be at least 8 characters'
      );
    });
  });

  describe('character content (no strength rule is enforced)', () => {
    it.each(['lowercase', 'UPPERCASE', '12345678', '!@#$%^&*', 'aaaaaaaa', 'pässwörd123'])(
      'accepts password %s once it meets the length',
      (password) => {
        expectValid(RegisterPasswordSchema, { password, confirm_password: password });
      }
    );
  });

  describe('invalid types', () => {
    it('rejects a missing password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { confirm_password: validPassword },
        'Password is required'
      );
    });

    it('rejects a null password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: null, confirm_password: validPassword },
        'Password is required'
      );
    });

    it('rejects an undefined password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: undefined, confirm_password: validPassword },
        'Password is required'
      );
    });

    it('rejects a numeric password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: 12345678, confirm_password: validPassword },
        'Password is required'
      );
    });

    it('rejects a boolean password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: true, confirm_password: validPassword },
        'Password is required'
      );
    });

    it('rejects an object password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: {}, confirm_password: validPassword },
        'Password is required'
      );
    });
  });
});

describe('RegisterPasswordSchema - confirm_password', () => {
  describe('length boundaries', () => {
    it('accepts a confirm_password of exactly 8 characters (minimum)', () => {
      expectValid(RegisterPasswordSchema, {
        password: '12345678',
        confirm_password: '12345678',
      });
    });

    it('rejects a confirm_password shorter than 8 characters', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: validPassword, confirm_password: '1234567' },
        'Password must be at least 8 characters'
      );
    });

    it('rejects a confirm_password longer than 50 characters', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: validPassword, confirm_password: 'a'.repeat(51) },
        'Password must be at most 50 characters'
      );
    });
  });

  describe('invalid types', () => {
    it('rejects a missing confirm_password', () => {
      expectInvalid(RegisterPasswordSchema, { password: validPassword }, 'Password is required');
    });

    it('rejects a null confirm_password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: validPassword, confirm_password: null },
        'Password is required'
      );
    });

    it('rejects an undefined confirm_password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: validPassword, confirm_password: undefined },
        'Password is required'
      );
    });

    it('rejects a numeric confirm_password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: validPassword, confirm_password: 12345678 },
        'Password is required'
      );
    });

    it('rejects a boolean confirm_password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: validPassword, confirm_password: true },
        'Password is required'
      );
    });

    it('rejects an object confirm_password', () => {
      expectInvalid(
        RegisterPasswordSchema,
        { password: validPassword, confirm_password: {} },
        'Password is required'
      );
    });
  });
});

describe('RegisterPasswordSchema - Password Match', () => {
  it('accepts matching passwords', () => {
    expectValid(RegisterPasswordSchema, {
      password: validPassword,
      confirm_password: validPassword,
    });
  });

  it('rejects when the passwords differ', () => {
    expectInvalid(
      RegisterPasswordSchema,
      { password: validPassword, confirm_password: 'Password2' },
      'Passwords do not match'
    );
  });

  it('reports the mismatch on the confirm_password field', () => {
    const result = RegisterPasswordSchema.safeParse({
      password: validPassword,
      confirm_password: 'Password2',
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirm_password']);
      expect(result.error.flatten().fieldErrors.confirm_password).toContain(
        'Passwords do not match'
      );
    }
  });

  it('does not add a mismatch issue when both passwords are missing', () => {
    const result = RegisterPasswordSchema.safeParse({});
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).not.toContain(
        'Passwords do not match'
      );
    }
  });
});

describe('RegisterPasswordSchema - Whole Object', () => {
  it('rejects an empty object', () => {
    expectInvalid(RegisterPasswordSchema, {}, 'Password is required');
  });
});

describe('RegisterPensionerSchema - ppo_no', () => {
  it('accepts a valid PPO number', () => {
    expectValid(RegisterPensionerSchema, validPensioner);
  });

  it('rejects an invalid PPO number', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, ppo_no: 'bad user' },
      'Invalid PPO No.'
    );
  });

  it('rejects a missing ppo_no', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, ppo_no: undefined },
      'PPO No. is Required'
    );
  });
});

describe('RegisterPensionerSchema - dob', () => {
  it('accepts a valid date of birth', () => {
    expectValid(RegisterPensionerSchema, validPensioner);
  });

  it('rejects a date of birth shorter than 10 characters', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, dob: '01-01-90' },
      'Date of Birth should be 10 in length'
    );
  });

  it('rejects a missing dob', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, dob: undefined },
      'Date of Birth is Required'
    );
  });
});

describe('RegisterPensionerSchema - password', () => {
  beforeEach(() => {
    jest.mocked(formatPassword).mockClear();
  });

  it('accepts a valid password', () => {
    expectValid(RegisterPensionerSchema, validPensioner);
  });

  it('formats the password with formatPassword', () => {
    const data = expectValid(RegisterPensionerSchema, validPensioner);
    expect(data.password).toBe(`formatted:${validPassword}`);
    expect(jest.mocked(formatPassword)).toHaveBeenCalledWith(validPassword);
  });

  it('rejects a password shorter than 8 characters', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, password: 'short' },
      'Password must be at least 8 characters'
    );
  });

  it('does not call formatPassword when the password is invalid', () => {
    expectInvalid(RegisterPensionerSchema, { ...validPensioner, password: 'short' });
    expect(jest.mocked(formatPassword)).not.toHaveBeenCalled();
  });

  it('rejects a missing password', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, password: undefined },
      'Password is required'
    );
  });
});

describe('RegisterPensionerSchema - bank_account_number', () => {
  it('accepts a valid bank account number', () => {
    expectValid(RegisterPensionerSchema, validPensioner);
  });

  it('rejects a bank account number shorter than 16 characters', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, bank_account_number: '123456789012345' },
      'Account no should be 16 in length'
    );
  });

  it('rejects a bank account number containing non-digits', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, bank_account_number: '123456789012345a' },
      'Invalid string: must match pattern /^\\d+$/'
    );
  });

  it('rejects a missing bank_account_number', () => {
    expectInvalid(
      RegisterPensionerSchema,
      { ...validPensioner, bank_account_number: undefined },
      'Account no is Required'
    );
  });
});

describe('RegisterPensionerSchema - Whole Object', () => {
  it('rejects an empty object', () => {
    expectInvalid(RegisterPensionerSchema, {}, 'PPO No. is Required');
  });
});
