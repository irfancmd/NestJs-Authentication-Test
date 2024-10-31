import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';

// Only required for Passport & Express session setup
// Could keep this methods in the authentication.service.ts file.
// But since we're demonstrating a different approach (Passport library),
// we're storing them in this file to avoid confusion.

@Injectable()
export class SessionAuthenticationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService: HashingService
    ) {}

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

        return user;
    }
}
