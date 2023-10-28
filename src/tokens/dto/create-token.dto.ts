import { IsMongoId, IsString } from "class-validator";

export class CreateTokenDto {
    @IsMongoId()
    userId: string

    @IsString()
    tokenId
}
