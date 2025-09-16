import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UserSecurityService } from './user-security.service';
import { UserSecurityController } from './user-security.controller';
import { EmailModule } from '../utils/email/email.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User]), EmailModule],
  controllers: [UserSecurityController],
  providers: [UserSecurityService],
  exports: [UserSecurityService],
})
export class SecurityModule {}
