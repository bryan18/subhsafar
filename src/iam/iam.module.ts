import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';


import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { SessionService } from './session/session.service';
import { SessionController } from './session/session.controller';
import { RolesGuard } from './authorization/guards/roles/roles.guard';


import { UsersModule } from 'src/users/users.module';
import { TokensModule } from 'src/tokens/tokens.module';

import jwtConfig from 'src/config/jwt.config';


@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService
    },
    {
      provide: APP_GUARD, // Global protection
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AccessTokenGuard,
    AuthenticationService,
    SessionService,
    RefreshTokenIdsStorage
  ],
  controllers: [
    AuthenticationController,
    SessionController
  ],
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
    TokensModule
  ],
  exports: [
  ]
})
export class IamModule {}
