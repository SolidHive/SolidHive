import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { EmailModule } from '../utils/email/email.module';
import { SecurityModule } from 'src/security/security.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    EmailModule,
    SecurityModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
