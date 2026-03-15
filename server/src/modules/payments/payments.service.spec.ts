import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { DonationPaymentService } from './services/donation-payment.service';
import { EventPaymentService } from './services/event-payment.service';
import { PremiumSubscriptionService } from './services/premium-subscription.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const stripeRetrieveMock = jest.fn();

  const stripeMock = {
    checkout: {
      sessions: {
        retrieve: stripeRetrieveMock,
      },
    },
  };

  const donationPaymentServiceMock = {
    createDonationSession: jest.fn(),
    finalizeDonation: jest.fn(),
  };

  const eventPaymentServiceMock = {
    createEventRegistrationSession: jest.fn(),
    finalizeEventRegistration: jest.fn(),
  };

  const premiumSubscriptionServiceMock = {
    createPremiumSession: jest.fn(),
    handlePremiumPaymentSuccess: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: 'STRIPE_CLIENT', useValue: stripeMock },
        { provide: DonationPaymentService, useValue: donationPaymentServiceMock },
        { provide: EventPaymentService, useValue: eventPaymentServiceMock },
        { provide: PremiumSubscriptionService, useValue: premiumSubscriptionServiceMock },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('delegue createDonationSession au service specialise', async () => {
    const dto = { amount: 25, relatedBy: 'association-id' } as any;
    const expected = { sessionId: 'cs_123', url: 'https://stripe.test/session' };
    donationPaymentServiceMock.createDonationSession.mockResolvedValue(expected);

    const result = await service.createDonationSession(dto, 'user-1');

    expect(donationPaymentServiceMock.createDonationSession).toHaveBeenCalledWith(dto, 'user-1');
    expect(result).toEqual(expected);
  });

  it('delegue createEventRegistrationSession au service evenement', async () => {
    const dto = { eventPricingId: 'pricing-1', quantity: 2 } as any;
    const expected = { sessionId: 'cs_evt', url: 'https://stripe.test/event' };
    eventPaymentServiceMock.createEventRegistrationSession.mockResolvedValue(expected);

    const result = await service.createEventRegistrationSession(dto, 'user-1');

    expect(eventPaymentServiceMock.createEventRegistrationSession).toHaveBeenCalledWith(
      dto,
      'user-1'
    );
    expect(result).toEqual(expected);
  });

  it('delegue finalizeEventRegistration au service evenement', async () => {
    await service.finalizeEventRegistration('cs_evt_ok');

    expect(eventPaymentServiceMock.finalizeEventRegistration).toHaveBeenCalledWith('cs_evt_ok');
  });

  it('delegue finalizeDonation au service donation', async () => {
    await service.finalizeDonation('cs_don_ok');

    expect(donationPaymentServiceMock.finalizeDonation).toHaveBeenCalledWith('cs_don_ok');
  });

  it('recupere une session Stripe via getSession', async () => {
    const session = { id: 'cs_789' };
    stripeRetrieveMock.mockResolvedValue(session);

    const result = await service.getSession('cs_789');

    expect(stripeRetrieveMock).toHaveBeenCalledWith('cs_789');
    expect(result).toEqual(session);
  });

  it('finalizePremium recupere la session Stripe puis notifie PremiumSubscriptionService', async () => {
    const session = { id: 'cs_premium' };
    stripeRetrieveMock.mockResolvedValue(session);

    await service.finalizePremium('cs_premium');

    expect(stripeRetrieveMock).toHaveBeenCalledWith('cs_premium');
    expect(premiumSubscriptionServiceMock.handlePremiumPaymentSuccess).toHaveBeenCalledWith(
      session
    );
  });

  it('delegue createPremiumSession au service premium', async () => {
    const dto = { premiumCategoryId: 'premium-cat-1' } as any;
    const expected = { sessionId: 'cs_p1', url: 'https://stripe.test/premium' };
    premiumSubscriptionServiceMock.createPremiumSession.mockResolvedValue(expected);

    const result = await service.createPremiumSession(dto, 'user-2');

    expect(premiumSubscriptionServiceMock.createPremiumSession).toHaveBeenCalledWith(dto, 'user-2');
    expect(result).toEqual(expected);
  });
});
