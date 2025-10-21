/**
 * Generates a random 6-digit numeric code.
 */
export const generateRedemptionCode = (): string => {
  // Generate a random number between 100000 (inclusive) and 999999 (inclusive)
  const min = 100000;
  const max = 999999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString();
};