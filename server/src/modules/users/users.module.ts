import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { EmailModule } from '../../common/utils/email/email.module';
import { SecurityModule } from '../security/security.module';
import { UserAssociation } from '../associations/modules/users/entities/user-association.entity';
import { EventRegister } from '../associations/modules/events/modules/registers/entities/event-register.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Association } from '../associations/entities/association.entity';
import { Fundraising } from '../associations/modules/fundraisings/entities/fundraising.entity';
import { Event } from '../associations/modules/events/entities/event.entity';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      UserAssociation,
      EventRegister,
      Transaction,
      Favorite,
      Association,
      Fundraising,
      Event,
    ]),
    EmailModule,
    SecurityModule,
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
