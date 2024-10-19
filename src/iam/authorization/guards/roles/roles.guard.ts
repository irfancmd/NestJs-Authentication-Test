import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/users/enums/role.enum';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      // Look for metadata in method and class
      [context.getHandler(), context.getClass()]
    );

    if(!contextRoles) {
      return true;
    }

    const user: ActiveUserData = context.switchToHttp().getRequest()[REQUEST_USER_KEY];

    // Check if user satisfies any of the roles.
    return contextRoles.some((role) => user.role = role);
  }
}
