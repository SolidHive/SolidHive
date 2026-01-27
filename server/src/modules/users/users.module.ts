import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { EmailModule } from '../../common/utils/email/email.module';
import { SecurityModule } from '../security/security.module';
import { UserAssociation } from '../associations/modules/users/entities/user-association.entity';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserAssociation]),
    EmailModule,
    SecurityModule,
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
