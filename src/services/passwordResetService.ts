import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

import { db } from '../firebase/config';

const PASSWORD_RESET_TOKENS_COLLECTION = 'password_reset_tokens';
const TOKEN_EXPIRY_HOURS = 24; // Token expires after 24 hours

export interface PasswordResetToken {
  token: string;
  cpf: string;
  email: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
}

/**
 * Generates a secure random token for password reset
 * Uses Web Crypto API for browser compatibility
 */
const generateToken = async (): Promise<string> => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Creates a password reset token and stores it in Firebase
 */
export const createPasswordResetToken = async (
  cpf: string,
  email: string,
): Promise<string> => {
  const token = await generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  const tokenData: PasswordResetToken = {
    token,
    cpf,
    email,
    createdAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    used: false,
  };

  const tokenRef = doc(db, PASSWORD_RESET_TOKENS_COLLECTION, token);
  await setDoc(tokenRef, tokenData);

  return token;
};

/**
 * Validates a password reset token
 */
export const validatePasswordResetToken = async (
  token: string,
): Promise<{ valid: boolean; cpf?: string; email?: string; error?: string }> => {
  const tokenRef = doc(db, PASSWORD_RESET_TOKENS_COLLECTION, token);
  const snapshot = await getDoc(tokenRef);

  if (!snapshot.exists()) {
    return { valid: false, error: 'Token inválido ou não encontrado.' };
  }

  const tokenData = snapshot.data() as PasswordResetToken;

  if (tokenData.used) {
    return { valid: false, error: 'Este token já foi utilizado.' };
  }

  const now = new Date();
  const expiresAt = tokenData.expiresAt.toDate();

  if (now > expiresAt) {
    return { valid: false, error: 'Este token expirou. Solicite um novo.' };
  }

  return {
    valid: true,
    cpf: tokenData.cpf,
    email: tokenData.email,
  };
};

/**
 * Marks a password reset token as used
 */
export const markTokenAsUsed = async (token: string): Promise<void> => {
  const tokenRef = doc(db, PASSWORD_RESET_TOKENS_COLLECTION, token);
  await updateDoc(tokenRef, { used: true });
};

