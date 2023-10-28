import {
    Injectable
  } from '@nestjs/common';
import { tokenData } from 'src/tokens/interfaces/token-data.interface';
import { TokensService } from 'src/tokens/tokens.service';
  
  // 💡 Ideally this should be in a separate file - putting this here for brevity
  export class InvalidatedRefreshTokenError extends Error {}
  
  @Injectable()
  export class RefreshTokenIdsStorage
  {

    constructor(
        private readonly tokenService: TokensService,
    ) {
    }

  
    async insert(userId: string, tokenId: string): Promise<void> {
      await this.tokenService.create(this.getKey(userId), tokenId);
    }
  
    async validate(userId: string, tokenId: string): Promise<boolean> {
      const storedId: tokenData = await this.tokenService.findOne(this.getKey(userId));
      if (storedId.tokenId !== tokenId) {
        throw new InvalidatedRefreshTokenError();
      }
      return storedId.tokenId === tokenId;
    }
  
    async invalidate(userId: string): Promise<void> {
      await this.tokenService.remove(this.getKey(userId));
    }
  
    private getKey(userId: string): string {
      return `user-${userId}`;
    }
  }