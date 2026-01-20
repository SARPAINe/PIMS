import { IsNotEmpty, IsString, MaxLength, IsEnum, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { AssetFieldType } from '../../common/enums';

export class CreateAssetTypeFieldDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(64)
    fieldKey: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(120)
    fieldLabel: string;

    @IsEnum(AssetFieldType)
    dataType: AssetFieldType;

    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @IsOptional()
    @IsBoolean()
    isUniquePerType?: boolean;

    @IsOptional()
    @IsInt()
    sortOrder?: number;
}
