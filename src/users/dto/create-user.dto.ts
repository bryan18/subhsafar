import { IsEmail, IsOptional } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string;

    password: string;

    @IsOptional()
    createdAt?: number;
    
    @IsOptional()
    updatedAt?: number;
}
