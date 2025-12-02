/**
 * Validates an email address using a comprehensive regex pattern.
 * This pattern follows RFC 5322 standards for email validation.
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false
  }

  // Trim whitespace
  const trimmedEmail = email.trim()

  // Basic length check
  if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
    return false
  }

  // Comprehensive email regex pattern
  // This pattern validates:
  // - Local part (before @): allows letters, numbers, dots, hyphens, underscores, plus signs
  // - @ symbol
  // - Domain part: allows letters, numbers, dots, hyphens
  // - Top-level domain: requires at least 2 characters
  const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailPattern.test(trimmedEmail)) {
    return false
  }

  // Additional checks
  // - Cannot start or end with a dot
  // - Cannot have consecutive dots
  // - Must have exactly one @ symbol
  const parts = trimmedEmail.split('@')
  if (parts.length !== 2) {
    return false
  }

  const [localPart, domainPart] = parts

  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return false
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false
  }

  if (localPart.includes('..')) {
    return false
  }

  // Domain part validation
  if (domainPart.length === 0 || domainPart.length > 253) {
    return false
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false
  }

  if (domainPart.includes('..')) {
    return false
  }

  // Must have at least one dot in the domain part
  if (!domainPart.includes('.')) {
    return false
  }

  // Top-level domain must be at least 2 characters
  const domainParts = domainPart.split('.')
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2) {
    return false
  }

  return true
}

