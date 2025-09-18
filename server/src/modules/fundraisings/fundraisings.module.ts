import { Module } from '@nestjs/common';
import { FundraisingsService } from './fundraisings.service';
import { FundraisingsController } from './fundraisings.controller';

@Module({
  controllers: [FundraisingsController],
  providers: [FundraisingsService],
})
export class FundraisingsModule {}
