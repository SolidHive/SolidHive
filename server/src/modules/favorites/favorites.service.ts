import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import { Categories } from '../../common/enums/categories';

@Injectable()
export class FavoritesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto, userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Vérifie que la cible existe
    const targetRepo = this.dataSource.getRepository(createFavoriteDto.relatedTo);

    const target = await targetRepo.findOne({
      where: { id: createFavoriteDto.relatedBy },
    });

    if (!target) {
      throw new HttpException(`${createFavoriteDto.relatedTo} not found`, HttpStatus.NOT_FOUND);
    }

    const favorite = this.favoritesRepository.create({
      ...createFavoriteDto,
      user: user,
    });

    return this.favoritesRepository.save(favorite);
  }

  findAll(userId: string, options?: FindOptionsDto) {
    return this.favoritesRepository.find({
      ...options,
      where: { userId: userId },
    });
  }

  findOne(relatedTo: Categories, relatedBy: string, userId: string) {
    return this.favoritesRepository.findOne({
      where: {
        relatedTo: relatedTo,
        relatedBy: relatedBy,
        userId: userId,
      },
    });
  }

  async remove(relatedTo: Categories, relatedBy: string, userId: string) {
    return this.favoritesRepository.delete({
      relatedTo: relatedTo,
      relatedBy: relatedBy,
      userId: userId,
    });
  }
}
