import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator((key, ctx) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user;

  if (!user) {
    return null;
  }

  return key && typeof key === 'string' ? (user[key] as string | number) : user;
});
