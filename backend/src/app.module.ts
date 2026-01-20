import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    User,
    Product,
    InventoryTransaction,
    AssetType,
    AssetTypeField,
    Asset,
    AssetFieldValue,
    AssetAssignment,
} from './entities';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { AssetsModule } from './assets/assets.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST'),
                port: +configService.get<number>('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [
                    User,
                    Product,
                    InventoryTransaction,
                    AssetType,
                    AssetTypeField,
                    Asset,
                    AssetFieldValue,
                    AssetAssignment,
                ],
                synchronize: configService.get('NODE_ENV') === 'development',
                logging: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        ProductsModule,
        InventoryModule,
        ReportsModule,
        AssetsModule,
    ],
})
export class AppModule { }
