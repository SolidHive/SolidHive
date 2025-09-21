import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindAllQueryDto } from 'src/common/dto/find-all-query.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId?: string) {
    const user: User | null = !userId
      ? null
      : await this.usersRepository.findOne({ where: { id: userId } });

    // Vérifie que la cible existe
    const targetRepo = this.dataSource.getRepository(
      createTransactionDto.relatedTo,
    );

    const target = await targetRepo.findOne({
      where: { id: createTransactionDto.relatedBy },
    });

    if (!target) {
      throw new HttpException(
        `${createTransactionDto.relatedTo} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      user: user,
    });

    return this.transactionsRepository.save(transaction);
  }

  findAll(userId: string, options?: FindAllQueryDto) {
    return this.transactionsRepository.find({
      ...options,
      where: { user: { id: userId } },
    });
  }

  findOne(id: string, userId: string, options?: FindAllQueryDto) {
    return this.transactionsRepository.findOne({
      ...options,
      where: { id, user: { id: userId } },
    });
  }

  async remove(id: string) {
    return this.transactionsRepository.delete(id);
  }
}
