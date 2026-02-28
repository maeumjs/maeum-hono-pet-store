import { describe, expect, it } from 'vitest';

import {
  BigIntToStringSchema,
  SignedLongBigIntSchema,
  SignedLongStringSchema,
  UnsignedLongBigIntSchema,
  UnsignedLongStringSchema,
} from '#/schema/common/long.string.zod';

describe('Signed, Unsigned Long schema', () => {
  describe('LongStringSchema', () => {
    it('should pass when the input is a valid positive numeric string', () => {
      const result = SignedLongStringSchema.safeParse('12345');
      expect(result.success).toBe(true);
    });

    it('should pass when the input is a valid negative numeric string', () => {
      const result = SignedLongStringSchema.safeParse('-12345');
      expect(result.success).toBe(true);
    });

    it('should pass when the input is the minimum signed long value', () => {
      const maxUlong = '-9223372036854775808';
      const result = SignedLongStringSchema.safeParse(maxUlong);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(maxUlong);
    });

    it('should pass when the input is the maximum signed long value', () => {
      const maxUlong = '9223372036854775807';
      const result = SignedLongStringSchema.safeParse(maxUlong);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(maxUlong);
    });

    it('should fail when the value exceeds the 64-bit unsigned maximum', () => {
      const overMax = '-9223372036854775809'; // ULONG_MAX - 1
      const result = SignedLongStringSchema.safeParse(overMax);
      expect(result.success).toBe(false);
    });

    it('should fail when the value exceeds the 64-bit unsigned minimum', () => {
      const overMax = '9223372036854775808'; // ULONG_MAX + 1
      const result = SignedLongStringSchema.safeParse(overMax);
      expect(result.success).toBe(false);
    });

    it('should fail when the input contains non-numeric characters', () => {
      const result = SignedLongStringSchema.safeParse('123abc');
      expect(result.success).toBe(false);
    });

    it('should fail when the input has invalid format', () => {
      const result = SignedLongStringSchema.safeParse('--123');
      expect(result.success).toBe(false);
    });

    it('should fail when the input is empty string', () => {
      const result = SignedLongStringSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('UnsignedLongStringSchema', () => {
    it('should pass when the input is a valid positive numeric string', () => {
      const result = UnsignedLongStringSchema.safeParse('12345');
      expect(result.success).toBe(true);
    });

    it('should pass when the input is the minimum unsigned long value ("0")', () => {
      const result = UnsignedLongStringSchema.safeParse('0');
      expect(result.success).toBe(true);
    });

    it('should pass when the input is the maximum unsigned long value', () => {
      const maxUlong = '18446744073709551615';
      const result = UnsignedLongStringSchema.safeParse(maxUlong);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(maxUlong);
    });

    it('should fail when the input contains a negative sign', () => {
      const result = UnsignedLongStringSchema.safeParse('-1');
      expect(result.success).toBe(false);
    });

    it('should fail when the value exceeds the 64-bit unsigned maximum', () => {
      const overMax = '18446744073709551616'; // ULONG_MAX + 1
      const result = UnsignedLongStringSchema.safeParse(overMax);
      expect(result.success).toBe(false);
    });

    it('should fail when the input contains non-numeric characters', () => {
      const result = UnsignedLongStringSchema.safeParse('123abc');
      expect(result.success).toBe(false);
    });

    it('should fail when the input is empty string', () => {
      const result = UnsignedLongStringSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('SignedLongBigIntSchema', () => {
    it('should pass and transform valid positive numeric string to BigInt', () => {
      const result = SignedLongBigIntSchema.safeParse('12345');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(BigInt(12345));
        expect(typeof result.data).toBe('bigint');
      }
    });

    it('should pass and transform valid negative numeric string to BigInt', () => {
      const result = SignedLongBigIntSchema.safeParse('-12345');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(BigInt(-12345));
      }
    });

    it('should pass when the input is the minimum signed long value', () => {
      const minLong = '-9223372036854775808';
      const result = SignedLongBigIntSchema.safeParse(minLong);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(BigInt(minLong));
      }
    });

    it('should pass when the input is the maximum signed long value', () => {
      const maxLong = '9223372036854775807';
      const result = SignedLongBigIntSchema.safeParse(maxLong);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(BigInt(maxLong));
      }
    });

    it('should fail when the value exceeds the signed long minimum', () => {
      const underMin = '-9223372036854775809';
      const result = SignedLongBigIntSchema.safeParse(underMin);
      expect(result.success).toBe(false);
    });

    it('should fail when the value exceeds the signed long maximum', () => {
      const overMax = '9223372036854775808';
      const result = SignedLongBigIntSchema.safeParse(overMax);
      expect(result.success).toBe(false);
    });

    it('should fail when the input contains non-numeric characters', () => {
      const result = SignedLongBigIntSchema.safeParse('123abc');
      expect(result.success).toBe(false);
    });

    it('should fail when the input has invalid format', () => {
      const result = SignedLongBigIntSchema.safeParse('--123');
      expect(result.success).toBe(false);
    });

    it('should fail when the input is empty string', () => {
      const result = SignedLongBigIntSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('UnsignedLongBigIntSchema', () => {
    it('should pass and transform valid positive numeric string to BigInt', () => {
      const result = UnsignedLongBigIntSchema.safeParse('12345');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(BigInt(12345));
        expect(typeof result.data).toBe('bigint');
      }
    });

    it('should pass when the input is the minimum unsigned long value ("0")', () => {
      const result = UnsignedLongBigIntSchema.safeParse('0');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(BigInt(0));
      }
    });

    it('should pass when the input is the maximum unsigned long value', () => {
      const maxUlong = '18446744073709551615';
      const result = UnsignedLongBigIntSchema.safeParse(maxUlong);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(BigInt(maxUlong));
      }
    });

    it('should fail when the input contains a negative sign', () => {
      const result = UnsignedLongBigIntSchema.safeParse('-1');
      expect(result.success).toBe(false);
    });

    it('should fail when the value exceeds the 64-bit unsigned maximum', () => {
      const overMax = '18446744073709551616';
      const result = UnsignedLongBigIntSchema.safeParse(overMax);
      expect(result.success).toBe(false);
    });

    it('should fail when the input contains non-numeric characters', () => {
      const result = UnsignedLongBigIntSchema.safeParse('123abc');
      expect(result.success).toBe(false);
    });

    it('should fail when the input is empty string', () => {
      const result = UnsignedLongBigIntSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('BigIntToStringSchema', () => {
    it('should transform BigInt to string', () => {
      const result = BigIntToStringSchema.safeParse(BigInt(12345));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('12345');
        expect(typeof result.data).toBe('string');
      }
    });

    it('should transform negative BigInt to string', () => {
      const result = BigIntToStringSchema.safeParse(BigInt(-12345));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('-12345');
      }
    });

    it('should transform zero BigInt to string', () => {
      const result = BigIntToStringSchema.safeParse(BigInt(0));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('0');
      }
    });

    it('should transform large BigInt to string', () => {
      const largeBigInt = BigInt('9223372036854775807');
      const result = BigIntToStringSchema.safeParse(largeBigInt);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('9223372036854775807');
      }
    });

    it('should fail when input is not a BigInt', () => {
      const result = BigIntToStringSchema.safeParse('123');
      expect(result.success).toBe(false);
    });

    it('should fail when input is null', () => {
      const result = BigIntToStringSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should fail when input is undefined', () => {
      const result = BigIntToStringSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });
});
