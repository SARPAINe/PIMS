import { IsOptional, IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserType } from '../../common/enums';

export class UpdateUserDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsEnum(UserType)
    userType?: UserType;
}
