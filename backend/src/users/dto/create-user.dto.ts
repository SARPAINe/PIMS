import {
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
} from "class-validator";
import { UserType } from "../../common/enums";

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;
}
