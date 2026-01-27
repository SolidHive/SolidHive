import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Association } from '../../entities/association.entity';
import { Transaction } from '../../../transactions/entities/transaction.entity';
import { Fundraising } from '../../modules/fundraisings/entities/fundraising.entity';
import { Event } from '../../modules/events/entities/event.entity';
import { UserAssociation } from '../../modules/users/entities/user-association.entity';
import { Categories } from '../../../../common/enums/categories';
import { Status } from '../../../../common/enums/status';

@Injectable()
export class AssociationStatisticsService {
  constructor(
    @InjectRepository(Association)
    private readonly associationRepository: Repository<Association>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Fundraising)
    private readonly fundraisingRepository: Repository<Fundraising>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(UserAssociation)
    private readonly userAssociationRepository: Repository<UserAssociation>
  ) {}

  async getAssociationStatistics(associationId: string) {
    // Dons directs à l'association
    const directDonations = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.relatedTo = :type', { type: Categories.ASSOCIATION })
      .andWhere('transaction.relatedBy = :associationId', { associationId })
      .select([
        'COUNT(transaction.id) as count',
        'SUM(transaction.amount) as total',
        'AVG(transaction.amount) as average',
      ])
      .getRawOne();

    // Dons via les cagnottes
    const fundraisingDonations = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin(Fundraising, 'fundraising', 'fundraising.id = "transaction"."relatedBy"::uuid')
      .where('transaction.relatedTo = :type', { type: Categories.FUNDRAISING })
      .andWhere('fundraising.associationId = :associationId', { associationId })
      .select([
        'COUNT(transaction.id) as count',
        'SUM(transaction.amount) as total',
        'AVG(transaction.amount) as average',
      ])
      .getRawOne();

    // Paiements d'événements
    const eventPayments = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin(Event, 'event', 'event.id = "transaction"."relatedBy"::uuid')
      .where('transaction.relatedTo = :type', { type: Categories.EVENT })
      .andWhere('event.associationId = :associationId', { associationId })
      .select([
        'COUNT(transaction.id) as count',
        'SUM(transaction.amount) as total',
        'AVG(transaction.amount) as average',
      ])
      .getRawOne();

    // Statistiques globales
    const totalDonations =
      parseInt(directDonations?.count || 0) + parseInt(fundraisingDonations?.count || 0);
    const totalAmount =
      parseFloat(directDonations?.total || 0) + parseFloat(fundraisingDonations?.total || 0);
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    // Revenus des événements
    const totalEventRevenue = parseFloat(eventPayments?.total || 0);
    const totalEventParticipants = parseInt(eventPayments?.count || 0);

    // Total général
    const grandTotal = totalAmount + totalEventRevenue;

    // Nombre de cagnottes
    const totalFundraisings = await this.fundraisingRepository.count({
      where: { association: { id: associationId } },
    });

    const activeFundraisings = await this.fundraisingRepository
      .createQueryBuilder('fundraising')
      .where('fundraising.associationId = :associationId', { associationId })
      .andWhere('(fundraising.endDate IS NULL OR fundraising.endDate > :now)', { now: new Date() })
      .getCount();

    // Top 5 cagnottes par montant collecté
    const topFundraisings = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin(Fundraising, 'fundraising', 'fundraising.id = "transaction"."relatedBy"::uuid')
      .where('transaction.relatedTo = :type', { type: Categories.FUNDRAISING })
      .andWhere('fundraising.associationId = :associationId', { associationId })
      .select([
        'fundraising.id as "id"',
        'fundraising.title as "title"',
        'SUM(transaction.amount) as "totalAmount"',
        'COUNT(transaction.id) as "donationCount"',
      ])
      .groupBy('fundraising.id, fundraising.title')
      .orderBy('SUM(transaction.amount)', 'DESC')
      .limit(5)
      .getRawMany();

    // Nombre d'événements
    const totalEvents = await this.eventRepository.count({
      where: { association: { id: associationId } },
    });

    const upcomingEvents = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.associationId = :associationId', { associationId })
      .andWhere('event.startDate > :now', { now: new Date() })
      .getCount();

    // Membres actifs
    const totalMembers = await this.userAssociationRepository.count({
      where: { association: { id: associationId }, status: Status.ACCEPTED },
    });

    // Évolution des dons sur les 12 derniers mois
    const monthlyDonations: Array<{ month: string; amount: number; count: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      // Dons directs du mois
      const directMonth = await this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.relatedTo = :type', { type: Categories.ASSOCIATION })
        .andWhere('transaction.relatedBy = :associationId', { associationId })
        .andWhere('transaction.timestamps.createdAt >= :startDate', { startDate: monthStart })
        .andWhere('transaction.timestamps.createdAt <= :endDate', { endDate: monthEnd })
        .select(['COUNT(transaction.id) as count', 'SUM(transaction.amount) as total'])
        .getRawOne();

      // Dons via cagnottes du mois
      const fundraisingMonth = await this.transactionRepository
        .createQueryBuilder('transaction')
        .innerJoin(Fundraising, 'fundraising', 'fundraising.id = "transaction"."relatedBy"::uuid')
        .where('transaction.relatedTo = :type', { type: Categories.FUNDRAISING })
        .andWhere('fundraising.associationId = :associationId', { associationId })
        .andWhere('transaction.timestamps.createdAt >= :startDate', { startDate: monthStart })
        .andWhere('transaction.timestamps.createdAt <= :endDate', { endDate: monthEnd })
        .select(['COUNT(transaction.id) as count', 'SUM(transaction.amount) as total'])
        .getRawOne();

      const monthCount = parseInt(directMonth?.count || 0) + parseInt(fundraisingMonth?.count || 0);
      const monthAmount =
        parseFloat(directMonth?.total || 0) + parseFloat(fundraisingMonth?.total || 0);

      monthlyDonations.push({
        month: monthStart.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
        amount: monthAmount,
        count: monthCount,
      });
    }

    // Croissance par rapport au mois précédent (basée sur le nombre de dons)
    const currentMonth = monthlyDonations[monthlyDonations.length - 1];
    const previousMonth = monthlyDonations[monthlyDonations.length - 2];

    let donationsGrowth = 0;
    if (previousMonth && previousMonth.count > 0 && currentMonth.count > 0) {
      donationsGrowth = ((currentMonth.count - previousMonth.count) / previousMonth.count) * 100;
    } else if (currentMonth.count > 0 && (!previousMonth || previousMonth.count === 0)) {
      // Si pas de dons le mois précédent mais il y en a ce mois, c'est une croissance de 100%
      donationsGrowth = 100;
    }

    return {
      donations: {
        total: totalDonations,
        amount: totalAmount,
        average: averageDonation,
        growth: donationsGrowth,
        direct: {
          count: parseInt(directDonations?.count || 0),
          amount: parseFloat(directDonations?.total || 0),
        },
        fundraisings: {
          count: parseInt(fundraisingDonations?.count || 0),
          amount: parseFloat(fundraisingDonations?.total || 0),
        },
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        revenue: totalEventRevenue,
        participants: totalEventParticipants,
      },
      fundraisings: {
        total: totalFundraisings,
        active: activeFundraisings,
        top: topFundraisings.map((f) => ({
          id: f.id,
          title: f.title,
          totalAmount: parseFloat(f.totalAmount),
          donationCount: parseInt(f.donationCount),
        })),
      },
      members: {
        total: totalMembers,
      },
      totalRevenue: grandTotal,
      monthlyDonations,
    };
  }
}
