import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

interface UserEntity {
  id: string;
  roles: Array<{ name: string }>;
  isVerified: boolean;
}

interface SerializedUser {
  id: string;
  roles: string[];
  isVerified: boolean;
}

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: UserEntity,
    done: (err: Error | null, user: SerializedUser | null) => void,
  ): void {
    try {
      if (!user || !user.roles || !Array.isArray(user.roles)) {
        done(new Error('Structure utilisateur invalide'), null);
        return;
      }

      const isVerified =
        user.isVerified !== undefined ? user.isVerified : user.isVerified;

      done(null, {
        id: user.id,
        roles: user.roles.map((role) =>
          typeof role === 'object' && role !== null ? role.name : String(role),
        ),
        isVerified: isVerified,
      });
    } catch (error) {
      done(error as Error, null);
    }
  }

  deserializeUser(
    payload: SerializedUser,
    done: (err: Error | null, user: SerializedUser | null) => void,
  ): void {
    try {
      done(null, payload);
    } catch (error) {
      done(error as Error, null);
    }
  }
}
