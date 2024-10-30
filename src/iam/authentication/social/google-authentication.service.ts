import { ConflictException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthenticationService } from '../authentication.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
    private oAuthClient: OAuth2Client;

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthenticationService,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) { }

    // Will be called during module initialization
    onModuleInit() {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

        this.oAuthClient = new OAuth2Client(clientId, clientSecret);
    }

    async authenticate(token: string) {
        try {
            const loginTicket = await this.oAuthClient.verifyIdToken({
                idToken: token
            });

            const { email, sub: googleId } = loginTicket.getPayload();

            const user = await this.userRepository.findOneBy({ googleId });

            if (user) {
                return this.authService.generateTokens(user);
            } else {
                const newUser = await this.userRepository.save({ email, googleId });

                return this.authService.generateTokens(newUser);
            }

        } catch (err) {
            const pgUniqueViolationErrorCode = '23505';

            if (err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException();
            }

            throw new UnauthorizedException();
        }
    }
}
