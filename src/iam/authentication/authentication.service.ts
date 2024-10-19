import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
    private pgUniqueViolationErrorCode = '23505';

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage
    ) { }

    async signUp(signUpDto: SignUpDto) {
        try {
            const user = new User();

            user.email = signUpDto.email;
            user.password = await this.hashingService.hash(signUpDto.password);

            await this.userRepository.save(user);
        } catch (err) {
            if (err.code === this.pgUniqueViolationErrorCode) {
                throw new ConflictException();
            }

            throw err;
        }
    }

    async signIn(signInDto: SignInDto) {
        const user = await this.userRepository.findOneBy({
            email: signInDto.email
        });

        if (!user) {
            throw new UnauthorizedException('User does not exist.');
        }

        const isEqual = await this.hashingService.compare(signInDto.password, user.password);

        if (!isEqual) {
            throw new UnauthorizedException('Password does not match');
        }

        // const accessToken = await this.signToken<Partial<ActiveUserData>>(
        //     user.id,
        //     this.jwtConfiguration.accessTokenTtl,
        //     { email: user.email }
        // );

        return await this.generateTokens(user);
    }

    async generateTokens(user: User) {
        // Random refresh token id
        const refreshTokenId = randomUUID();

        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                {
                    email: user.email, 
                    role: user.role, 
                    // Just for demonstration. Passing large arrays in jwt payload
                    // is not a good idea.
                    // We're using roles, so we don't need claim based authentication field "permission".
                    // permissions: user.permissions
                }
            ),
            // Best practice is to strongly type payload structures using interfaces for refresh
            // token payload as well. But we're not doing that for simplicity.
            this.signToken(
                user.id,
                this.jwtConfiguration.refreshTokenTtl,
                { refreshTokenId }
            ),
        ]);

        await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

        return {
            accessToken, refreshToken
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        try {
            const { sub, refreshTokenId } = await this.jwtService.verifyAsync<Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }>(
                refreshTokenDto.refreshToken,
                {
                    secret: this.jwtConfiguration.secret,
                    audience: this.jwtConfiguration.audience,
                    issuer: this.jwtConfiguration.issuer,
                }
            );

            const user = await this.userRepository.findOneByOrFail(
                {
                    id: sub
                }
            );

            // This process of validating old refresh token and issuing a new refresh token is
            // called "Refresh Token Rotation".
            const isRefreshTokenValid = await this.refreshTokenIdsStorage.validate(user.id, refreshTokenId);

            if(!isRefreshTokenValid) {
                // Invalidate the old refresh token, since we're generating a new one.
                await this.refreshTokenIdsStorage.invalidate(user.id);
            } else {
                throw new Error('Refresh token is invalid');
            }

            // This method generates both the access and refresh token and sends them. Here, we
            // may choose to omit the access token and sned only the refresh token instead.
            return this.generateTokens(user);
        } catch (err) {
            if(err instanceof InvalidatedRefreshTokenError) {
                throw new UnauthorizedException('Access Denied');
            }

            throw new UnauthorizedException();
        }
    }

    private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload
            }, // as ActiveUserData,
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn
            }
        );
    }
}
