import { IsInt, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignAssetDto {
    @IsInt()
    assignedToUserId: number;

    @IsDateString()
    issueDate: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    remarks?: string;
}
