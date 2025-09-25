import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { Categories } from '../../common/enums/categories';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  create(@Body() createFavoriteDto: CreateFavoriteDto, @User('id') userId: string) {
    return this.favoritesService.create(createFavoriteDto, userId);
  }

  @Get()
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findAll(@User('id') userId: string, @Query() options?: FindOptionsDto) {
    return this.favoritesService.findAll(userId, options);
  }

  @Get(':relatedTo/:relatedBy')
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findOne(
    @Param('relatedTo') relatedTo: Categories,
    @Param('relatedBy') id: string,
    @User('id') userId: string
  ) {
    return this.favoritesService.findOne(relatedTo, id, userId);
  }

  @Delete(':relatedTo/:relatedBy')
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  remove(
    @Param('relatedTo') relatedTo: Categories,
    @Param('relatedBy') relatedBy: string,
    @User('id') userId: string
  ) {
    return this.favoritesService.remove(relatedTo, relatedBy, userId);
  }
}
