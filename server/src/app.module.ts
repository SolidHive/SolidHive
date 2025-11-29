import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EmailModule } from './common/utils/email/email.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { getNestConfig } from './config/database.config';
import { SecurityModule } from './modules/security/security.module';
import { AssociationsModule } from './modules/associations/associations.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { FilesModule } from './modules/files/files.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TicketsModule } from './modules/associations/modules/events/modules/tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(getNestConfig()),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 secondes (durée par défaut)
        limit: 1000, // 1000 requêtes par défaut
      },
    ]),
    EmailModule,
    UsersModule,
    AuthModule,
    SecurityModule,
    AssociationsModule,
    FavoritesModule,
    TransactionsModule,
    AnnouncementsModule,
    FilesModule,
    PaymentsModule,
    InvoicesModule,
    TicketsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
