import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OtpAuthenticationService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async generateSecret(email: string) {
        const secret = authenticator.generateSecret();
        const appName = this.configService.getOrThrow('TFA_AP_NAME');
        const uri = authenticator.keyuri(email, appName, secret);

        return {
            uri,
            secret
        };
    }

    verifyCode(code: string, secret: string) {
        return authenticator.verify({
            token: code,
            secret
        });
    }

    async enableTfaForUser(email: string, secret: string) {
        const { id } = await this.userRepository.findOneOrFail({
            where: { email },
            select: { id: true }
        });

        await this.userRepository.update(
            { id },
            // Ideally, we may not want to store the secret in plain text.
            // However, we have to know the secret, so we can't use hashing
            // here since hashing algorithms are one way. A two way encryption
            // algorithm might be appropriate here.
            { tfaSecret: secret, isTfaEnabled: true } 
        );
    }
}
