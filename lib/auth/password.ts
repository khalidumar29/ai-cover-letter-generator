import bcrypt from "bcryptjs";

const COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Spends roughly the same time bcrypt would spend on a real comparison.
 * Login calls this when no account matches the email, so response timing does
 * not reveal which addresses are registered.
 */
export async function burnTiming(password: string): Promise<void> {
  await bcrypt.hash(password, COST);
}
