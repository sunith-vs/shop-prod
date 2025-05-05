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

/**
 * Validates that a name is properly formatted
 * @param name - The name to validate
 * @returns boolean - Whether the name is valid
 */
export const validateName = (name: string): boolean => {
  // Check if name is empty after trimming
  if (!name.trim()) return false;
  
  // Check if the name contains only digits
  const onlyNumbersRegex = /^\d+$/;
  if (onlyNumbersRegex.test(name)) return false;
  
  // Check if name starts with a number
  if (/^\d/.test(name)) return false;
  
  // Check if name contains at least 2 characters and only valid name characters
  // Valid characters include letters, spaces, hyphens, and apostrophes
  const validNameRegex = /^[A-Za-z\s'-]{2,}$/;
  return validNameRegex.test(name);
};
