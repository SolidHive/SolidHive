/**
 * Transport de secours pour Render uniquement.
 *
 * Les web services gratuits de Render bloquent le trafic sortant vers les ports
 * SMTP (25, 465, 587) depuis septembre 2025 : Nodemailer y échoue sur
 * `Connection timeout` quel que soit le serveur. Ce transport envoie le même
 * message par l'API HTTPS de Brevo. Il ne s'active qu'avec
 * `EMAIL_TRANSPORT=brevo-api` ; partout ailleurs (local, docker-compose, VPS)
 * le SMTP de `email.service.ts` reste seul en jeu.
 */

export interface MailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content?: Buffer | string; path?: string }[];
}

const ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/** `Nom <adresse>` ou `adresse` → { name, email } */
export const parseAddress = (value: string): { name?: string; email: string } => {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return match ? { name: match[1] || undefined, email: match[2] } : { email: value.trim() };
};

export const isBrevoApiEnabled = (env: NodeJS.ProcessEnv = process.env): boolean =>
  env.EMAIL_TRANSPORT === 'brevo-api';

export async function sendViaBrevoApi(
  message: MailMessage,
  env: NodeJS.ProcessEnv = process.env
): Promise<void> {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('EMAIL_TRANSPORT=brevo-api demande BREVO_API_KEY');
  }

  const attachment = (message.attachments ?? [])
    .filter((a) => a.content !== undefined)
    .map((a) => ({
      name: a.filename,
      content: Buffer.isBuffer(a.content)
        ? a.content.toString('base64')
        : Buffer.from(String(a.content)).toString('base64'),
    }));

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: parseAddress(message.from),
      to: [{ email: message.to }],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
      attachment: attachment.length ? attachment : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo API ${response.status} : ${await response.text()}`);
  }
}
