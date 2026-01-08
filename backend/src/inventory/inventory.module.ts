import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransaction, Product, User } from '../entities';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
    imports: [TypeOrmModule.forFeature([InventoryTransaction, Product, User])],
    controllers: [InventoryController],
    providers: [InventoryService],
    exports: [InventoryService],
})
export class InventoryModule { }
