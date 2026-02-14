import { describe, expect, it } from 'vitest';

import { SignedLongStringSchema, UnsignedLongStringSchema } from '#/schema/common/long.string.zod';

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
  });
});
