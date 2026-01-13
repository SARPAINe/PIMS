import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Param,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInTransactionDto, CreateOutTransactionDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { UserType } from '../common/enums';
import { User } from '../entities';

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post('in')
    @Roles(UserType.ADMIN)
    createInTransaction(
        @Body() createInTransactionDto: CreateInTransactionDto,
        @CurrentUser() user: User,
    ) {
        return this.inventoryService.createInTransaction(
            createInTransactionDto,
            user,
        );
    }

    @Post('out')
    @Roles(UserType.ADMIN)
    createOutTransaction(
        @Body() createOutTransactionDto: CreateOutTransactionDto,
        @CurrentUser() user: User,
    ) {
        return this.inventoryService.createOutTransaction(
            createOutTransactionDto,
            user,
        );
    }

    @Get('transactions')
    findAll(
        @Query('productId') productId?: string,
        @Query('recipientId') recipientId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? +page : 1;
        const limitNumber = limit ? +limit : 10;

        if (productId) {
            return this.inventoryService.findByProduct(+productId, pageNumber, limitNumber);
        }
        if (recipientId) {
            return this.inventoryService.findByRecipient(+recipientId, pageNumber, limitNumber);
        }
        return this.inventoryService.findAll(pageNumber, limitNumber);
    }

    @Get('transactions/product/:id')
    findByProduct(@Param('id') id: string) {
        return this.inventoryService.findByProduct(+id);
    }

    @Get('transactions/recipient/:id')
    findByRecipient(@Param('id') id: string) {
        return this.inventoryService.findByRecipient(+id);
    }
}
