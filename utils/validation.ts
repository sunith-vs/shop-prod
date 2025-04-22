/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns boolean - Whether the email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number format (10 digits)
 * @param phone - The phone number to validate
 * @returns boolean - Whether the phone number is valid
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};
