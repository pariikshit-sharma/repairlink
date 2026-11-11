export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    errors.push("At least 8 characters long");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    errors.push("At least one uppercase letter (A-Z)");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push("At least one numeric digit (0-9)");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push("At least one special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  // Accepts standard Indian / international phone formats
  return /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(phone.replace(/[\s-]/g, ""));
}
