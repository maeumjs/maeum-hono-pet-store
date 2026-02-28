import z from 'zod';

// Signed 64-bit Integer (int64) Range
const LONG_MIN = BigInt('-9223372036854775808');
const LONG_MAX = BigInt('9223372036854775807');

// Unsigned 64-bit Integer (uint64) Range
const ULONG_MIN = BigInt('0');
const ULONG_MAX = BigInt('18446744073709551615'); // 2^64 - 1

export const SignedLongBigIntSchema = z
  .string()
  .regex(/^-?\d+$/)
  .transform((v) => BigInt(v))
  .refine((n) => n >= LONG_MIN && n <= LONG_MAX, {
    message: 'Value is out of 64-bit unsigned integer range',
  });

export const UnsignedLongBigIntSchema = z
  .string()
  .regex(/^\d+$/) // 부호(-)가 없는 숫자만 허용
  .transform((v) => BigInt(v))
  .refine((n) => n >= ULONG_MIN && n <= ULONG_MAX, {
    message: 'Value is out of 64-bit unsigned integer range',
  });

export const SignedLongStringSchema = z
  .string()
  .pipe(SignedLongBigIntSchema.transform((n) => n.toString()));

export const UnsignedLongStringSchema = z
  .string()
  .pipe(UnsignedLongBigIntSchema.transform((n) => n.toString()));

// Converts bigint (from DB) to string for JSON serialization
export const BigIntToStringSchema = z.bigint().transform((v) => v.toString());
