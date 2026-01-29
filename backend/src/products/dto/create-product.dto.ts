import { IsNotEmpty, IsInt, Min, IsOptional, IsNumber } from "class-validator";

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  initialBalance: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNotEmpty()
  vendorName?: string;
}
