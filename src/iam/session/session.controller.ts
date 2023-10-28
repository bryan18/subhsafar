import { Controller, Get, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionService } from './session.service';


@Controller('session')
export class SessionController {
    constructor(
        private readonly sessionService: SessionService
    ) {}



    @HttpCode(HttpStatus.OK)
    @Get('sign-out')
    signOut(@Headers() headers ) {
        const { authorization } = headers;
        return this.sessionService.signOut(authorization);
    }
}
