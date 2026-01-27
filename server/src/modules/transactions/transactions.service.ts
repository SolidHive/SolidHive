import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Not } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId?: string) {
    const user: User | null = !userId
      ? null
      : await this.usersRepository.findOne({ where: { id: userId } });

    // Vérifie que la cible existe
    const targetRepo = this.dataSource.getRepository(createTransactionDto.relatedTo);

    const target = await targetRepo.findOne({
      where: { id: createTransactionDto.relatedBy },
    });

    if (!target) {
      throw new HttpException(`${createTransactionDto.relatedTo} not found`, HttpStatus.NOT_FOUND);
    }

    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      user: user,
    });

    return this.transactionsRepository.save(transaction);
  }

  async findAll(userId: string, options?: FindOptionsDto) {
    // Traiter les opérateurs spéciaux dans where
    let whereCondition: any = {
      user: { id: userId },
    };

    if (options?.where) {
      // Convertir les opérateurs MongoDB-style en opérateurs TypeORM
      const processedWhere = this.processWhereCondition(options.where);
      whereCondition = {
        ...whereCondition,
        ...processedWhere,
      };
    }

    // Extraire les options valides pour TypeORM (sans relations)
    const findOptions: any = {
      where: whereCondition,
    };

    if (options?.order) findOptions.order = options.order;
    if (options?.skip) findOptions.skip = options.skip;
    if (options?.take) findOptions.take = options.take;

    if (options?.take) {
      const [rawTransactions, total] = await this.transactionsRepository.findAndCount({
        where: whereCondition,
        order: options?.order,
        skip: options?.skip,
        take: options?.take,
      });

      // Charger les entités liées si demandé
      let transactions = rawTransactions;
      if (options?.relations && options.relations.length > 0) {
        transactions = await this.loadRelatedEntities(rawTransactions, options.relations);
      }

      return {
        data: transactions,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    }

    const transactions = await this.transactionsRepository.find(findOptions);

    // Charger les entités liées si demandé
    if (options?.relations && options.relations.length > 0) {
      return this.loadRelatedEntities(transactions, options.relations);
    }

    return transactions;
  }

  private async loadRelatedEntities(transactions: Transaction[], relations: string[]) {
    const result = await Promise.all(
      transactions.map(async (transaction) => {
        const transactionWithRelations: any = { ...transaction };

        // Charger l'entité liée selon relatedTo
        if (relations.includes('association') && transaction.relatedTo === 'Association') {
          const repo = this.dataSource.getRepository('Association');
          transactionWithRelations.association = await repo.findOne({
            where: { id: transaction.relatedBy },
            select: ['id', 'name'],
          });
        }

        if (relations.includes('fundraising') && transaction.relatedTo === 'Fundraising') {
          const repo = this.dataSource.getRepository('Fundraising');
          transactionWithRelations.fundraising = await repo.findOne({
            where: { id: transaction.relatedBy },
            select: ['id', 'title'],
          });
        }

        if (relations.includes('event') && transaction.relatedTo === 'Event') {
          const repo = this.dataSource.getRepository('Event');
          transactionWithRelations.event = await repo.findOne({
            where: { id: transaction.relatedBy },
            select: ['id', 'title'],
          });
        }

        return transactionWithRelations;
      })
    );

    return result;
  }

  private processWhereCondition(where: Record<string, any>): Record<string, any> {
    const processed: Record<string, any> = {};

    for (const [key, value] of Object.entries(where)) {
      if (typeof value === 'object' && value !== null) {
        // Gérer les opérateurs spéciaux
        if ('$ne' in value) {
          processed[key] = Not(value.$ne);
        } else {
          processed[key] = value;
        }
      } else {
        processed[key] = value;
      }
    }

    return processed;
  }

  findOne(id: string, userId: string, options?: FindOptionsDto) {
    return this.transactionsRepository.findOne({
      ...options,
      where: { id, user: { id: userId } },
    });
  }

  async findFiltered(userId: string, type: 'associations' | 'cagnottes', options?: FindOptionsDto) {
    // Construire la condition where de base
    let whereCondition: any = {
      user: { id: userId },
    };

    // Ajouter le filtre par type
    if (type === 'associations') {
      whereCondition.relatedTo = Not('Fundraising');
    } else if (type === 'cagnottes') {
      whereCondition.relatedTo = 'Fundraising';
    }

    // Fusionner avec les options supplémentaires si elles existent
    if (options?.where) {
      const processedWhere = this.processWhereCondition(options.where);
      whereCondition = {
        ...whereCondition,
        ...processedWhere,
      };
    }

    // Extraire les options valides pour TypeORM (sans relations)
    const findOptions: any = {
      where: whereCondition,
    };

    if (options?.order) findOptions.order = options.order;
    if (options?.skip) findOptions.skip = options.skip;
    if (options?.take) findOptions.take = options.take;

    if (options?.take) {
      const [rawTransactions, total] = await this.transactionsRepository.findAndCount({
        where: whereCondition,
        order: options?.order,
        skip: options?.skip,
        take: options?.take,
      });

      // Charger les entités liées si demandé
      let transactions = rawTransactions;
      if (options?.relations && options.relations.length > 0) {
        transactions = await this.loadRelatedEntities(rawTransactions, options.relations);
      }

      return {
        data: transactions,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    }

    const transactions = await this.transactionsRepository.find(findOptions);

    // Charger les entités liées si demandé
    if (options?.relations && options.relations.length > 0) {
      return this.loadRelatedEntities(transactions, options.relations);
    }

    return transactions;
  }

  async remove(id: string) {
    return this.transactionsRepository.delete(id);
  }
}
