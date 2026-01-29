import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateInTransactionDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNotEmpty()
  vendorName: string;

  @IsOptional()
  remarks?: string;
}
