import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Association } from '../../associations/entities/association.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Fundraising } from '../../associations/modules/fundraisings/entities/fundraising.entity';
import { Categories } from '../../../common/enums/categories';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Association)
    private readonly associationRepository: Repository<Association>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Fundraising)
    private readonly fundraisingRepository: Repository<Fundraising>
  ) {}

  async getStatistics() {
    // Nombre d'associations
    const associationsCount = await this.associationRepository.count();

    // Nombre d'utilisateurs
    const usersCount = await this.userRepository.count();

    // Nombre de dons (transactions de type Fundraising et Association)
    const donationsCount = await this.transactionRepository.count({
      where: [{ relatedTo: Categories.FUNDRAISING }, { relatedTo: Categories.ASSOCIATION }],
    });

    // Montant total collecté
    const totalAmountResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.relatedTo IN (:...categories)', {
        categories: [Categories.FUNDRAISING, Categories.ASSOCIATION],
      })
      .getRawOne();
    const totalAmountCollected = parseFloat(totalAmountResult?.total || 0);

    // Revenus SolidHive (somme des solidHiveAmount)
    const solidHiveRevenueResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.solidHiveAmount)', 'total')
      .where('transaction.relatedTo IN (:...categories)', {
        categories: [Categories.FUNDRAISING, Categories.ASSOCIATION],
      })
      .andWhere('transaction.solidHiveAmount IS NOT NULL')
      .getRawOne();
    const solidHiveRevenue = parseFloat(solidHiveRevenueResult?.total || 0);

    // Don moyen
    const averageDonation = donationsCount > 0 ? totalAmountCollected / donationsCount : 0;

    // Top 5 associations avec le plus de dons (cagnottes + dons directs)
    const top5AssociationsFromFundraisings = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('fundraising.associationId', 'associationId')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .innerJoin(Fundraising, 'fundraising', 'fundraising.id = "transaction"."relatedBy"::uuid')
      .where('transaction.relatedTo = :fundraisingCategory', {
        fundraisingCategory: Categories.FUNDRAISING,
      })
      .groupBy('fundraising.associationId')
      .getRawMany();

    const top5AssociationsFromDirect = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.relatedBy', 'associationId')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .where('transaction.relatedTo = :associationCategory', {
        associationCategory: Categories.ASSOCIATION,
      })
      .groupBy('transaction.relatedBy')
      .getRawMany();

    // Combiner et agréger les résultats
    const associationTotals = new Map<string, number>();

    // Ajouter les montants des cagnottes
    top5AssociationsFromFundraisings.forEach((item) => {
      const current = associationTotals.get(item.associationId) || 0;
      associationTotals.set(item.associationId, current + parseFloat(item.totalAmount));
    });

    // Ajouter les montants des dons directs
    top5AssociationsFromDirect.forEach((item) => {
      const current = associationTotals.get(item.associationId) || 0;
      associationTotals.set(item.associationId, current + parseFloat(item.totalAmount));
    });

    // Trier et prendre le top 5
    const sortedAssociations = Array.from(associationTotals.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const top5AssociationsData = await Promise.all(
      sortedAssociations.map(async ([associationId, totalAmount]) => {
        const association = await this.associationRepository.findOne({
          where: { id: associationId },
        });
        return {
          association,
          totalAmount,
        };
      })
    );

    // Évolution des dons (comparaison avec le mois précédent)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const currentMonthDonations = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(transaction.id)', 'count')
      .where('transaction.relatedTo IN (:...categories)', {
        categories: [Categories.FUNDRAISING, Categories.ASSOCIATION],
      })
      .andWhere('transaction.timestamps.createdAt >= :date', { date: oneMonthAgo })
      .getRawOne();

    const previousMonthDonations = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(transaction.id)', 'count')
      .where('transaction.relatedTo IN (:...categories)', {
        categories: [Categories.FUNDRAISING, Categories.ASSOCIATION],
      })
      .andWhere('transaction.timestamps.createdAt >= :startDate', { startDate: twoMonthsAgo })
      .andWhere('transaction.timestamps.createdAt < :endDate', { endDate: oneMonthAgo })
      .getRawOne();

    const currentCount = parseInt(currentMonthDonations?.count || 0);
    const previousCount = parseInt(previousMonthDonations?.count || 0);
    const donationsGrowth =
      previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;

    // Cagnottes actives (avec date de fin dans le futur ou null)
    const activeFundraisings = await this.fundraisingRepository
      .createQueryBuilder('fundraising')
      .where('fundraising.endDate IS NULL OR fundraising.endDate > :now', { now: new Date() })
      .getCount();

    // Nouvelles associations du mois
    const newAssociations = await this.associationRepository
      .createQueryBuilder('association')
      .where('association.timestamps.createdAt >= :date', { date: oneMonthAgo })
      .getCount();

    // Taux d'acceptation des associations
    const acceptedAssociations = await this.associationRepository
      .createQueryBuilder('association')
      .where('association.status = :status', { status: 'accepted' })
      .getCount();

    const rejectedAssociations = await this.associationRepository
      .createQueryBuilder('association')
      .where('association.status = :status', { status: 'rejected' })
      .getCount();

    const totalProcessed = acceptedAssociations + rejectedAssociations;
    const acceptanceRate = totalProcessed > 0 ? (acceptedAssociations / totalProcessed) * 100 : 0;

    // Association avec le plus de dons (pour compatibilité)
    const topDonationAssociation = top5AssociationsData.length > 0 ? top5AssociationsData[0] : null;

    // Association la plus active dans le mois (combine cagnottes et dons directs)
    const mostActiveFromFundraisings = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('fundraising.associationId', 'associationId')
      .addSelect('COUNT(transaction.id)', 'donationCount')
      .innerJoin(Fundraising, 'fundraising', 'fundraising.id = "transaction"."relatedBy"::uuid')
      .where('transaction.relatedTo = :fundraisingCategory', {
        fundraisingCategory: Categories.FUNDRAISING,
      })
      .andWhere('transaction.timestamps.createdAt >= :date', { date: oneMonthAgo })
      .groupBy('fundraising.associationId')
      .getRawMany();

    const mostActiveFromDirect = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.relatedBy', 'associationId')
      .addSelect('COUNT(transaction.id)', 'donationCount')
      .where('transaction.relatedTo = :associationCategory', {
        associationCategory: Categories.ASSOCIATION,
      })
      .andWhere('transaction.timestamps.createdAt >= :date', { date: oneMonthAgo })
      .groupBy('transaction.relatedBy')
      .getRawMany();

    // Combiner les résultats
    const associationActivity = new Map<string, number>();

    mostActiveFromFundraisings.forEach((item) => {
      const current = associationActivity.get(item.associationId) || 0;
      associationActivity.set(item.associationId, current + parseInt(item.donationCount));
    });

    mostActiveFromDirect.forEach((item) => {
      const current = associationActivity.get(item.associationId) || 0;
      associationActivity.set(item.associationId, current + parseInt(item.donationCount));
    });

    const mostActiveAssociationId = Array.from(associationActivity.entries()).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    let mostActiveAssociationData: {
      association: Association | null;
      donationCount: number;
    } | null = null;
    if (mostActiveAssociationId) {
      const association = await this.associationRepository.findOne({
        where: { id: mostActiveAssociationId },
      });
      mostActiveAssociationData = {
        association,
        donationCount: associationActivity.get(mostActiveAssociationId) || 0,
      };
    }

    // Évolution des dons sur les 12 derniers mois
    const monthlyDonations: Array<{ month: string; count: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthCount = await this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.relatedTo IN (:...categories)', {
          categories: [Categories.FUNDRAISING, Categories.ASSOCIATION],
        })
        .andWhere('transaction.timestamps.createdAt >= :startDate', { startDate: monthStart })
        .andWhere('transaction.timestamps.createdAt <= :endDate', { endDate: monthEnd })
        .getCount();

      monthlyDonations.push({
        month: monthStart.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
        count: monthCount,
      });
    }

    return {
      associationsCount,
      usersCount,
      donationsCount,
      totalAmountCollected,
      solidHiveRevenue,
      averageDonation,
      top5Associations: top5AssociationsData,
      topDonationAssociation,
      donationsGrowth,
      activeFundraisings,
      newAssociations,
      acceptanceRate,
      mostActiveAssociation: mostActiveAssociationData,
      monthlyDonations,
    };
  }
}
