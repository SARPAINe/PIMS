import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

export class ReturnAssetDto {
  @IsDateString()
  handoverDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remarks?: string;
}
