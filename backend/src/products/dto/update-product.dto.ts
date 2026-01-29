import { IsOptional, IsNotEmpty } from "class-validator";

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
