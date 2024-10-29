import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from '../../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';
import { ApiKeyGuard } from '../api-key/api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]> =
  {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.ApiKey]: this.apiKeyGuard,
    [AuthType.None]: { canActivate: () => true }
  }

  constructor(
    private readonly reflector: Reflector,
    // Yes, it's possible to inject another guard in a guard
    private readonly accessTokenGuard: AccessTokenGuard,
    // For impelenting API key based authentication. (optional)
    private readonly apiKeyGuard: ApiKeyGuard
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // Get thye authType metadata
    const authTypes =  this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      // We're targeting both method level (handler) and class level metadata
      // to get the AUTH_TYPE_KEY. Here, higher specificity will automatically
      // get preference.
      [context.getHandler(), context.getClass()]
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    let error = new UnauthorizedException();

    for(const guardInstance of guards) {
      const canActivate =  await Promise.resolve(
        guardInstance.canActivate(context)
      ).catch((err) => {
        error = err;
      })

      if(canActivate) {
        return true;
      }
    } 

    throw error;
  }
}
