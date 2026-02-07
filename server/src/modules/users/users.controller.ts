import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully registered.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get('me/associations')
  @UseGuards(AuthenticatedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's associations" })
  @ApiResponse({
    status: 200,
    description:
      'Returns the list of associations for the current user with their role and status.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyAssociations(@Req() req: Request) {
    const userId = req.user?.['id'];
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.getUserAssociations(userId);
  }

  @Get('me/association/:associationId')
  @UseGuards(AuthenticatedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Has access to association' })
  @ApiResponse({
    status: 200,
    description: 'Returns true if the user has access to the association, false otherwise.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async hasAccessToAssociation(@Req() req: Request, @Param('associationId') associationId: string) {
    const userId = req.user?.['id'];
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.hasAccessToAssociation(userId, associationId);
  }

  @Put('me')
  @UseGuards(AuthenticatedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User profile has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.['id'];
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Delete('me')
  @UseGuards(AuthenticatedGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiBody({ type: DeleteUserDto })
  @ApiResponse({
    status: 200,
    description: 'User account has been successfully deleted.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid password or account cannot be deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteAccount(@Req() req: Request, @Body() deleteUserDto: DeleteUserDto) {
    const userId = req.user?.['id'];
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.deleteUser(userId, deleteUserDto);
  }
}
