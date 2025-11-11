/**
 * Password Requirements and Strength Validation
 * Enforces strong password policies
 */

import { z } from 'zod';
import { validatePasswordNotCommon } from '@/lib/security/sanitize';

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
  meets: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
}

/**
 * Password requirements configuration
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  preventCommonPasswords: true,
};

/**
 * Zod schema for password validation
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_REQUIREMENTS.minLength, `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  .max(PASSWORD_REQUIREMENTS.maxLength, `Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`)
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    'Password must contain at least one special character'
  )
  .refine(
    (password) => validatePasswordNotCommon(password),
    'Password is too common. Please choose a more secure password'
  );

/**
 * Validate password and return detailed feedback
 */
export function validatePassword(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  const meets = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    notCommon: validatePasswordNotCommon(password),
  };

  // Generate feedback
  if (!meets.minLength) {
    feedback.push(`Must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  if (!meets.hasUppercase) {
    feedback.push('Must contain at least one uppercase letter (A-Z)');
  }
  if (!meets.hasLowercase) {
    feedback.push('Must contain at least one lowercase letter (a-z)');
  }
  if (!meets.hasNumber) {
    feedback.push('Must contain at least one number (0-9)');
  }
  if (!meets.hasSpecialChar) {
    feedback.push('Must contain at least one special character (!@#$%^&*)');
  }
  if (!meets.notCommon) {
    feedback.push('Password is too common. Choose something more unique');
  }

  // Calculate strength score
  const { strength, score } = calculatePasswordStrength(password, meets);

  // Check if all requirements are met
  const isValid = Object.values(meets).every((met) => met === true);

  return {
    isValid,
    strength,
    score,
    feedback,
    meets,
  };
}

/**
 * Calculate password strength score
 */
function calculatePasswordStrength(
  password: string,
  meets: PasswordValidationResult['meets']
): { strength: PasswordStrength; score: number } {
  let score = 0;

  // Length contribution (max 40 points)
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  // Character variety (max 40 points)
  if (meets.hasUppercase) score += 10;
  if (meets.hasLowercase) score += 10;
  if (meets.hasNumber) score += 10;
  if (meets.hasSpecialChar) score += 10;

  // Additional complexity (max 20 points)
  const specialCharCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
  if (specialCharCount >= 2) score += 5;
  if (specialCharCount >= 3) score += 5;

  const numberCount = (password.match(/[0-9]/g) || []).length;
  if (numberCount >= 2) score += 5;
  if (numberCount >= 3) score += 5;

  // Not common password
  if (meets.notCommon) score += 10;

  // Determine strength based on score
  let strength: PasswordStrength;
  if (score >= 85) {
    strength = PasswordStrength.VERY_STRONG;
  } else if (score >= 70) {
    strength = PasswordStrength.STRONG;
  } else if (score >= 50) {
    strength = PasswordStrength.MEDIUM;
  } else {
    strength = PasswordStrength.WEAK;
  }

  return { strength, score };
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_STRONG:
      return 'success'; // Green
    case PasswordStrength.STRONG:
      return 'success'; // Green
    case PasswordStrength.MEDIUM:
      return 'warning'; // Yellow
    case PasswordStrength.WEAK:
      return 'error'; // Red
    default:
      return 'error';
  }
}

/**
 * Get password strength label for UI
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_STRONG:
      return 'Very Strong';
    case PasswordStrength.STRONG:
      return 'Strong';
    case PasswordStrength.MEDIUM:
      return 'Medium';
    case PasswordStrength.WEAK:
      return 'Weak';
    default:
      return 'Weak';
  }
}

/**
 * Check if password meets minimum requirements for account creation
 */
export function meetsMinimumRequirements(password: string): boolean {
  const result = validatePassword(password);
  return result.isValid;
}

/**
 * Generate password strength message
 */
export function getPasswordStrengthMessage(password: string): string {
  const { strength, isValid, feedback } = validatePassword(password);

  if (!isValid) {
    return feedback.join('. ');
  }

  return `Password strength: ${getPasswordStrengthLabel(strength)}`;
}

/**
 * Password and confirmation match validation
 */
export const passwordConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
