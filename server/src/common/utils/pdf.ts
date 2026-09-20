import { Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { CHROMIUM_ARGS } from './chromium';

const logger = new Logger('Pdf');

/**
 * Convertit un HTML autonome en PDF A4.
 *
 * Les gabarits embarquent leur CSS : aucune ressource réseau n'est attendue,
 * d'où `domcontentloaded` plutôt que `networkidle0`, qui bloquait jusqu'au
 * délai maximal dès qu'un CDN tardait. Chromium est relancé une fois si le
 * premier essai échoue : sur une petite instance, un lancement peut être tué
 * par manque de mémoire alors que le suivant passe.
 */
export async function htmlToPdf(html: string): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: CHROMIUM_ARGS,
        timeout: 30_000,
        protocolTimeout: 60_000,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      });
      return Buffer.from(pdf);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      logger.error(`Génération PDF, essai ${attempt}/2 : ${message}`);
    } finally {
      await browser?.close().catch(() => undefined);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Génération PDF impossible');
}
