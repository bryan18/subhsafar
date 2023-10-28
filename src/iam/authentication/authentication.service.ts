import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';

import { randomUUID } from 'crypto';

import { HashingService } from '../hashing/hashing.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';

import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { RefreshTokenDto } from './dto/refresh-token/refresh-token.dto';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

import jwtConfig from 'src/config/jwt.config';
import { ResetPasswordDto } from './dto/reset-password/reset-password.dto';





@Injectable()
export class AuthenticationService {
    constructor(
        private readonly hashingService: HashingService,
        private usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly refreshTokenIdsStorage:RefreshTokenIdsStorage,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>
    ) {}

    async signUp(signUpDto: SignUpDto) {
        signUpDto.password = await this.hashingService.hash(signUpDto.password);
        const user = await this.usersService.create(signUpDto);

        const token = await this.generateTokens(user);
        return {
            user,
            token
        };
    }

    async signIn(signInDto: SignUpDto) {
        const user = await this.usersService.findOneByEmail(signInDto.email);
        const isEqual = await this.hashingService.compare(
            signInDto.password,
            user.password
        );

        if (!isEqual) {
            throw new UnauthorizedException('Password does not match');
        }
        
        const token = await this.generateTokens(user);
        return {
            user,
            token
        };

    }

    async generateTokens(user: User) {        

        const refreshTokenId = randomUUID();

        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                {
                    email: user.email,
                    role: user.roles
                }
            ),
            this.signToken(
                user.id,
                this.jwtConfiguration.refreshTokenTtl,
                {
                    refreshTokenId
                }
            )
        ]);
                
        await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);


        return {
            accessToken,
            refreshToken
        };
    }

    private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
        
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload
            },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn
            }
        );
    }

    async refreshTokens(refreshTokensDto: RefreshTokenDto) {
        try {
            const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
                    Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
                >(
                    refreshTokensDto.refreshToken,
                    {
                        secret: this.jwtConfiguration.secret,
                        audience: this.jwtConfiguration.audience,
                        issuer: this.jwtConfiguration.issuer
                    }
                );
            const user = await this.usersService.findOne(sub);
            const isValid = await this.refreshTokenIdsStorage.validate(
                user.id,
                refreshTokenId,
              );
            if (isValid) {
                await this.refreshTokenIdsStorage.invalidate(user.id);
            } else {
                throw new Error('Refresh token is invalid');
            }
            return this.generateTokens(user);
        } catch (error) {
            if (error instanceof InvalidatedRefreshTokenError) {
                // Take action: notify user that his refresh token might have been stolen?
                throw new UnauthorizedException('Access denied');
            }
            throw new UnauthorizedException();
        }
    }

    async resetPassword( resetPasswordDto: ResetPasswordDto ) {
        // const newPassword = await this.hashingService.hash('1234');

        try {
            const user = await this.usersService.findOneByEmail(resetPasswordDto.email);
            const { id } = user;
            const newPassword = await this.hashingService.hash('1234');
            await this.usersService.update(id, {
                password: newPassword
            });

            return true;
        } catch (error) {
            throw new InternalServerErrorException(`Can't update User - check server logs`);  
        }
                
    }
    
}
