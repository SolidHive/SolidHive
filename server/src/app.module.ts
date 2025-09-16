import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './utils/email/email.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { getNestConfig } from './config/database.config';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(getNestConfig()),
    EmailModule,
    UsersModule,
    AuthModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
