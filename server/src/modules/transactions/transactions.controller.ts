import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from 'src/common/decorators/user.decorator';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { FindAllQueryDto } from 'src/common/dto/find-all-query.dto';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @User('id') userId?: string,
  ) {
    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get()
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findAll(@User('id') userId: string, @Query() options?: FindAllQueryDto) {
    return this.transactionsService.findAll(userId, options);
  }

  @Get(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findOne(
    @Param('id') id: string,
    @User('id') userId: string,
    @Query() options?: FindAllQueryDto,
  ) {
    return this.transactionsService.findOne(id, userId, options);
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
