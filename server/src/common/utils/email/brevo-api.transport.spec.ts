import { isBrevoApiEnabled, parseAddress, sendViaBrevoApi } from './brevo-api.transport';

describe('brevo-api.transport', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it("n'est actif qu'avec EMAIL_TRANSPORT=brevo-api", () => {
    expect(isBrevoApiEnabled({})).toBe(false);
    expect(isBrevoApiEnabled({ EMAIL_TRANSPORT: 'smtp' })).toBe(false);
    expect(isBrevoApiEnabled({ EMAIL_TRANSPORT: 'brevo-api' })).toBe(true);
  });

  it("découpe l'expéditeur", () => {
    expect(parseAddress('SolidHive <noreply@solidhive.fr>')).toEqual({
      name: 'SolidHive',
      email: 'noreply@solidhive.fr',
    });
    expect(parseAddress('noreply@solidhive.fr')).toEqual({ email: 'noreply@solidhive.fr' });
  });

  it('refuse de partir sans clé', async () => {
    await expect(
      sendViaBrevoApi({ from: 'a@b.c', to: 'd@e.f', subject: 's', html: '<p/>' }, {})
    ).rejects.toThrow('BREVO_API_KEY');
  });

  it("envoie le message et les pièces jointes en base64 à l'API", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 201, text: async () => '' });
    global.fetch = fetchMock as unknown as typeof fetch;

    await sendViaBrevoApi(
      {
        from: 'SolidHive <noreply@solidhive.fr>',
        to: 'user@example.com',
        subject: 'Bonjour',
        html: '<p>Salut</p>',
        attachments: [{ filename: 'facture.pdf', content: Buffer.from('pdf') }],
      },
      { BREVO_API_KEY: 'xkeysib-test' }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(init.headers['api-key']).toBe('xkeysib-test');
    expect(JSON.parse(init.body)).toEqual({
      sender: { name: 'SolidHive', email: 'noreply@solidhive.fr' },
      to: [{ email: 'user@example.com' }],
      subject: 'Bonjour',
      htmlContent: '<p>Salut</p>',
      attachment: [{ name: 'facture.pdf', content: Buffer.from('pdf').toString('base64') }],
    });
  });

  it("remonte l'erreur de l'API", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 401, text: async () => 'Key not found' }) as any;
    await expect(
      sendViaBrevoApi(
        { from: 'a@b.c', to: 'd@e.f', subject: 's', html: '<p/>' },
        { BREVO_API_KEY: 'x' }
      )
    ).rejects.toThrow('Brevo API 401');
  });
});
