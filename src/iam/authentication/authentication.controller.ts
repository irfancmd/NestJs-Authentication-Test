import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// Our own custom Auth decorator
@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {

    constructor(private readonly authService: AuthenticationService) {}

    @Post('sign-up')
    signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    // The 'Response' interface of express
    signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.signIn(signInDto);

        // Rather than sending the JWT access token in plain text in the response, we can
        // also send it as a cookie which is sometimes the recommended approach.
        // const accessToken =  this.authService.signIn(signInDto);

        // response.cookie('accessToken', accessToken, {
        //     secure: true,
        //     httpOnly: true,
        //     sameSite: true
        // });
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
}