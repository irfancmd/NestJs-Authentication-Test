import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { SessionAuthenticationService } from './session-authentication.service';
import { Request } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import { promisify } from 'util';
import { SessionGuard } from './guards/session/session.guard';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Auth(AuthType.None)
@Controller('session-authentication')
export class SessionAuthenticationController {
    constructor(
        private readonly sessionAuthService: SessionAuthenticationService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(@Req() request: Request, @Body() signInDto: SignInDto) {
        const user = await this.sessionAuthService.signIn(signInDto);

        // We're using Passport's request.login method
        await promisify(request.login).call(request, user);
    }

    @UseGuards(SessionGuard)
    @Get()
    async sayHello(@ActiveUser() user: ActiveUserData) {
        return `hello, ${user.email}!`;
    }
}
