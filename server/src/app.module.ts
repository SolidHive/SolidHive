import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './common/utils/email/email.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { getNestConfig } from './config/database.config';
import { SecurityModule } from './modules/security/security.module';
import { AssociationsModule } from './modules/associations/associations.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(getNestConfig()),
    EmailModule,
    UsersModule,
    AuthModule,
    SecurityModule,
    AssociationsModule,
    FavoritesModule,
    TransactionsModule,
    AnnouncementsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
