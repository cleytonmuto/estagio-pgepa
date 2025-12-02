/**
 * Validates password strength according to requirements:
 * - At least 8 characters
 * - At least 1 lowercase letter
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special symbol
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres.');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 letra minúscula.');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 letra maiúscula.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 número.');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 símbolo especial.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

