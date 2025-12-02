/**
 * Email Service
 * 
 * NOTE: This is a frontend service template. In production, email sending
 * should be done through a backend API or Firebase Cloud Functions for security.
 * 
 * This service provides the interface and structure. The actual implementation
 * should call your backend API endpoint that handles email sending.
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a password reset email
 * 
 * In production, this should call a backend API endpoint like:
 * POST /api/send-reset-email
 * 
 * Or use Firebase Cloud Functions:
 * https://your-project.cloudfunctions.net/sendPasswordResetEmail
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  candidateName: string,
): Promise<void> => {
  const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

  const emailContent = {
    to: email,
    subject: 'Recuperação de Senha - Programa de Estágio PGE-PA',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Programa de Estágio PGE-PA</h1>
            </div>
            <div class="content">
              <p>Olá, ${candidateName}!</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta no Programa de Estágio PGE-PA.</p>
              <p>Clique no botão abaixo para criar uma nova senha:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </p>
              <p>Ou copie e cole o seguinte link no seu navegador:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este link é válido por 24 horas</li>
                  <li>Se você não solicitou esta recuperação, ignore este e-mail</li>
                  <li>Não compartilhe este link com ninguém</li>
                </ul>
              </div>
              <p>Atenciosamente,<br>Equipe do Programa de Estágio PGE-PA</p>
            </div>
            <div class="footer">
              <p>Este é um e-mail automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Programa de Estágio PGE-PA - Recuperação de Senha
      
      Olá, ${candidateName}!
      
      Recebemos uma solicitação para redefinir a senha da sua conta.
      
      Acesse o link abaixo para criar uma nova senha:
      ${resetUrl}
      
      Este link é válido por 24 horas.
      
      Se você não solicitou esta recuperação, ignore este e-mail.
      
      Atenciosamente,
      Equipe do Programa de Estágio PGE-PA
    `,
  };

  // TODO: Replace this with actual email sending implementation
  // Option 1: Call your backend API
  // const response = await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(emailContent),
  // });
  // if (!response.ok) {
  //   throw new Error('Falha ao enviar e-mail');
  // }

  // Option 2: Use Firebase Cloud Functions
  // const sendEmail = httpsCallable(functions, 'sendPasswordResetEmail');
  // await sendEmail(emailContent);

  // Option 3: Use a third-party service (SendGrid, Mailgun, etc.)
  // Example with SendGrid:
  // await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${import.meta.env.VITE_SENDGRID_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     personalizations: [{ to: [{ email }] }],
  //     from: { email: 'noreply@pgepa.gov.br', name: 'Programa de Estágio PGE-PA' },
  //     subject: emailContent.subject,
  //     content: [
  //       { type: 'text/plain', value: emailContent.text },
  //       { type: 'text/html', value: emailContent.html },
  //     ],
  //   }),
  // });

  // For now, throw an error to indicate this needs to be implemented
  throw new Error(
    'Serviço de e-mail não configurado. Configure o envio de e-mails no backend ou usando Firebase Cloud Functions.',
  );
};

