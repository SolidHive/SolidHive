import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FundraisingsService } from './fundraisings.service';
import { CreateFundraisingDto } from './dto/create-fundraising.dto';
import { UpdateFundraisingDto } from './dto/update-fundraising.dto';

@Controller('fundraisings')
export class FundraisingsController {
  constructor(private readonly fundraisingsService: FundraisingsService) {}

  @Post()
  create(@Body() createFundraisingDto: CreateFundraisingDto) {
    return this.fundraisingsService.create(createFundraisingDto);
  }

  @Get()
  findAll() {
    return this.fundraisingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fundraisingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFundraisingDto: UpdateFundraisingDto,
  ) {
    return this.fundraisingsService.update(+id, updateFundraisingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fundraisingsService.remove(+id);
  }
}
