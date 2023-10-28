import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from "src/config/jwt.config";
import { RefreshTokenIdsStorage } from "../authentication/refresh-token-ids.storage/refresh-token-ids.storage";

@Injectable()
export class SessionService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) {}

    async signOut(headerToken: string) {

        const token: string = this.extractToken(headerToken);

        try {
            const payload = await this.jwtService.verifyAsync(
              token,
              this.jwtConfiguration
            );
            const { sub } = payload;
            await this.refreshTokenIdsStorage.invalidate(sub);
            
          } catch {
            throw new UnauthorizedException();
          }
        return true;
        
    }


    private extractToken( tokenWithBearer: string ): string | undefined {
        const [_, token] = tokenWithBearer.split(' ') ?? [];
        return token;
    }
}