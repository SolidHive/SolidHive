import { Controller, Post, UseGuards, Request, Get, Body, Res } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Request as ExpressRequest, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Throttle } from '@nestjs/throttler';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    roles: any[];
    estVerifie: boolean;
  };
  session: Session & Partial<SessionData>;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 tentatives en 15 minutes (900000 ms)
  @Post('login')
  @ApiOperation({ summary: 'Connecte un utilisateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur connecté avec succès',
    schema: {
      properties: {
        message: { type: 'string', example: 'Connexion réussie' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives de connexion' })
  login(@Body() loginDto: LoginDto) {
    console.log(`Tentative de connexion avec l'email: ${loginDto.email}`);
    return this.authService.login();
  }

  @UseGuards(AuthenticatedGuard)
  @Throttle({ default: { limit: 30, ttl: 300000 } }) // 30 requêtes en 5 minutes (300000 ms)
  @Get('profile')
  @ApiOperation({ summary: "Récupère le profil de l'utilisateur connecté" })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: "Profil de l'utilisateur",
    schema: {
      properties: {
        name: { type: 'string' },
        firstname: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string', nullable: true },
        siret: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 429, description: 'Trop de requêtes' })
  getProfile(@Request() req: RequestWithUser) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('logout')
  @ApiOperation({ summary: "Déconnecte l'utilisateur" })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
    schema: {
      properties: {
        message: { type: 'string', example: 'Déconnexion réussie' },
      },
    },
  })
  logout(@Request() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req.session, res);
  }
}
