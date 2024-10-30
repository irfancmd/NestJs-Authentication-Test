import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { RolesGuard } from './authorization/guards/roles/roles.guard';
import { PermissionsGuard } from './authorization/guards/permissions/permissions.guard';
import { PolicyHandlerStorage } from './authorization/policies/policy-handler.storage';
import { ValidUserPolicyHandler } from './authorization/policies/valid-user.policy';
import { PoliciesGuard } from './authorization/guards/policies/policies.guard';
import { ApiKeysService } from './authentication/api-keys.service';
import { ApiKey } from 'src/users/api-keys/entities/api-key.entity/api-key.entity';
import { ApiKeyGuard } from './authentication/guards/api-key/api-key.guard';
import { GoogleAuthenticationService } from './authentication/social/google-authentication.service';
import { GoogleAuthenticationController } from './authentication/social/google-authentication.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ApiKey]),
    // We're configuring the NestJS JwtModule using our configuration namespace
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig)
  ],
  // Will show error since HasingService is an abstract class, which can't be used
  // as a provider. To solve this, we have to use the explicit provider syntax.
  // providers: [HashingService, BcryptService]
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    // The NestJS APP_GUARD constant can point to multiple guards.
    // NestJS will use all of them.
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard
    // },
    // We're using role based authorization for now. No don't need this.
    // Typically we only go with either role wise or claim wise authorization.
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard
    // },

    // Guard for policy baesd authorization.
    // {
    //   provide: APP_GUARD,
    //   useClass: PoliciesGuard
    // },

    // Need this so that the AccessTokenGuard is injectable to the AuthenticationGuard
    AccessTokenGuard,

    // This is need if we want API key based authentication.
    ApiKeyGuard,

    AuthenticationService,
    RefreshTokenIdsStorage,

    PolicyHandlerStorage,
    ValidUserPolicyHandler,
    ApiKeysService,
    GoogleAuthenticationService
  ],
  controllers: [AuthenticationController, GoogleAuthenticationController]
})
export class IamModule {}
