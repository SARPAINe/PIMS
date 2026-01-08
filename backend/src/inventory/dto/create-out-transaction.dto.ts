import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateOutTransactionDto {
    @IsInt()
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsInt()
    recipientUserId: number;

    @IsOptional()
    remarks?: string;
}
