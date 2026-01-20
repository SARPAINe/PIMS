import { IsNotEmpty, IsString, MaxLength, IsOptional, IsInt, IsNumber, IsDateString, IsObject, Min } from 'class-validator';

export class CreateAssetDto {
    @IsInt()
    assetTypeId: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    assetNumber: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    serialNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    vendorName?: string;

    @IsOptional()
    @IsDateString()
    purchaseDate?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    purchasePriceBdt?: number;

    @IsOptional()
    @IsObject()
    dynamicValues?: Record<string, any>;
}
