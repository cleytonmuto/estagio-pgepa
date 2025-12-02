# Email Configuration

## Setup Instructions

1. Copy `email.config.example.ts` to `email.config.ts`:
   ```bash
   cp src/config/email.config.example.ts src/config/email.config.ts
   ```

2. Edit `email.config.ts` and fill in your email service credentials.

3. **IMPORTANT**: The file `email.config.ts` is already in `.gitignore` and will not be committed to version control.

## Email Service Options

### Option 1: SMTP (Gmail, Outlook, etc.)

For Gmail:
- Enable 2-Step Verification
- Generate an App Password: https://myaccount.google.com/apppasswords
- Use the App Password in the config file

### Option 2: Firebase Cloud Functions (Recommended)

For production, it's recommended to use Firebase Cloud Functions to send emails. This keeps your credentials secure on the backend.

### Option 3: Third-party Email Services

- **SendGrid**: https://sendgrid.com
- **Mailgun**: https://www.mailgun.com
- **AWS SES**: https://aws.amazon.com/ses/
- **Resend**: https://resend.com

## Implementation Note

The email service (`src/services/emailService.ts`) currently throws an error indicating that email sending needs to be implemented. You'll need to:

1. Set up a backend API endpoint, OR
2. Use Firebase Cloud Functions, OR
3. Integrate a third-party email service

See `src/services/emailService.ts` for implementation examples and TODO comments.

