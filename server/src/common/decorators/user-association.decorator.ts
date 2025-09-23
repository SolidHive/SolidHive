import {
  createParamDecorator,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { UserAssociation } from '../../modules/associations/modules/users/entities/user-association.entity';

interface requestWithUserAssociation extends Request {
  userAssociation: UserAssociation;
}

export const UserAssociationDecorator = createParamDecorator((key, ctx) => {
  const request = ctx.switchToHttp().getRequest<requestWithUserAssociation>();
  const userAssociation: UserAssociation = request.userAssociation;

  if (!userAssociation) {
    throw new HttpException('User association not found', HttpStatus.NOT_FOUND);
  }

  return key && typeof key === 'string'
    ? (userAssociation[key] as string | number)
    : userAssociation;
});
