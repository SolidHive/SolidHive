import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RedisModule } from './common/redis/redis.module';
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
import { AdminModule } from './modules/admin/admin.module';
import { PermissionAccessModule } from './modules/admin/permissions-access/permission-access.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
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
    AdminModule,
    PermissionAccessModule,
    RedisModule,
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
