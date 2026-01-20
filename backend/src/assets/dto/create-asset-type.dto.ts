import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAssetTypeDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    name: string;
}
