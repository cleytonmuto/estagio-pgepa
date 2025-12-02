/**
 * Email Configuration Template
 * 
 * Copy this file to email.config.ts and fill in your email service credentials.
 * 
 * IMPORTANT: 
 * - Never commit email.config.ts to version control
 * - Add email.config.ts to .gitignore
 * - This file is for SMTP email sending (e.g., Gmail, Outlook, custom SMTP server)
 * 
 * For production, consider using:
 * - Firebase Cloud Functions with Nodemailer
 * - SendGrid API
 * - AWS SES
 * - Mailgun
 * - Or any other email service provider
 */

export interface EmailConfig {
  // SMTP Server Configuration
  host: string; // e.g., 'smtp.gmail.com' or 'smtp.office365.com'
  port: number; // e.g., 587 for TLS, 465 for SSL
  secure: boolean; // true for SSL (port 465), false for TLS (port 587)
  
  // Authentication
  auth: {
    user: string; // Your email address
    pass: string; // Your email password or app-specific password
  };
  
  // Sender Information
  from: {
    name: string; // Display name
    email: string; // Sender email address (usually same as auth.user)
  };
  
  // Optional: Reply-to address
  replyTo?: string;
}

/**
 * Example configuration for Gmail:
 * 
 * export const emailConfig: EmailConfig = {
 *   host: 'smtp.gmail.com',
 *   port: 587,
 *   secure: false,
 *   auth: {
 *     user: 'your-email@gmail.com',
 *     pass: 'your-app-specific-password', // Use App Password, not regular password
 *   },
 *   from: {
 *     name: 'Programa de Estágio PGE-PA',
 *     email: 'your-email@gmail.com',
 *   },
 * };
 * 
 * Note: For Gmail, you need to:
 * 1. Enable 2-Step Verification
 * 2. Generate an App Password: https://myaccount.google.com/apppasswords
 */

/**
 * Example configuration for Outlook/Office365:
 * 
 * export const emailConfig: EmailConfig = {
 *   host: 'smtp.office365.com',
 *   port: 587,
 *   secure: false,
 *   auth: {
 *     user: 'your-email@outlook.com',
 *     pass: 'your-password',
 *   },
 *   from: {
 *     name: 'Programa de Estágio PGE-PA',
 *     email: 'your-email@outlook.com',
 *   },
 * };
 */

// This is a template - create email.config.ts with your actual credentials
export const emailConfig: EmailConfig = {
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@example.com',
    pass: 'your-password',
  },
  from: {
    name: 'Programa de Estágio PGE-PA',
    email: 'your-email@example.com',
  },
};

