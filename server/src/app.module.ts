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
import { FundraisingsModule } from './modules/fundraisings/fundraisings.module';
import { EventsModule } from './modules/events/events.module';
import { AssociationsAnnouncementsModule } from './modules/associations-announcements/associations-announcements.module';
import { AssociationsRolesModule } from './modules/associations-roles/associations-roles.module';
import { EventsPricingsModule } from './modules/events-pricings/events-pricings.module';
import { EventsRegistersModule } from './modules/events-registers/events-registers.module';
import { UsersAssociationsModule } from './modules/users-associations/users-associations.module';

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
    FundraisingsModule,
    EventsModule,
    AssociationsAnnouncementsModule,
    AssociationsRolesModule,
    EventsPricingsModule,
    EventsRegistersModule,
    UsersAssociationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
