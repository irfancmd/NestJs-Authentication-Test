import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';
import { PermissionType } from '../../permission.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<PermissionType[]>(
      PERMISSIONS_KEY,
      // Look for metadata in method and class
      [context.getHandler(), context.getClass()]
    );

    if(!contextPermissions) {
      return true;
    }

    const user: ActiveUserData = context.switchToHttp().getRequest()[REQUEST_USER_KEY];

    // Check if user satisfies ALL of the permissions.
    return contextPermissions.every((permission) => user.permissions?.includes(permission));
  }
}
