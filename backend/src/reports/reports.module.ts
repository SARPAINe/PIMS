import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransaction, Product } from '../entities';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
    imports: [TypeOrmModule.forFeature([InventoryTransaction, Product])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
