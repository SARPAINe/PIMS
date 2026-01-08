import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, InventoryTransaction, User } from '../entities';
import { TransactionType } from '../common/enums';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(InventoryTransaction)
        private transactionRepository: Repository<InventoryTransaction>,
    ) { }

    async create(createProductDto: CreateProductDto, user: User): Promise<Product> {
        // Create product
        const product = this.productRepository.create({
            name: createProductDto.name,
            initialBalance: createProductDto.initialBalance,
            vendorName: createProductDto.vendorName,
            createdById: user.id,
        });

        const savedProduct = await this.productRepository.save(product);

        // Create INITIAL transaction
        const initialTransaction = this.transactionRepository.create({
            productId: savedProduct.id,
            transactionType: TransactionType.INITIAL,
            quantity: createProductDto.initialBalance,
            unitPrice: createProductDto.unitPrice || null,
            vendorName: createProductDto.vendorName || null,
            recipientUserId: null,
            remarks: 'Initial stock',
            createdById: user.id,
        });

        await this.transactionRepository.save(initialTransaction);

        return savedProduct;
    }

    async findAll(): Promise<Product[]> {
        return this.productRepository.find({
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        if (updateProductDto.name) {
            product.name = updateProductDto.name;
        }

        return this.productRepository.save(product);
    }

    async remove(id: number): Promise<void> {
        // Check if product has any transactions other than INITIAL
        const transactionCount = await this.transactionRepository.count({
            where: { productId: id },
        });

        if (transactionCount > 1) {
            throw new BadRequestException(
                'Cannot delete product with existing transactions',
            );
        }

        // Delete transactions first (cascade should handle this, but being explicit)
        await this.transactionRepository.delete({ productId: id });

        const result = await this.productRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
    }

    async getCurrentStock(productId: number): Promise<number> {
        const product = await this.findOne(productId);

        // Calculate current stock: initial_balance + SUM(IN) - SUM(OUT)
        const inQuantity = await this.transactionRepository
            .createQueryBuilder('t')
            .select('COALESCE(SUM(t.quantity), 0)', 'total')
            .where('t.productId = :productId', { productId })
            .andWhere('t.transactionType = :type', { type: TransactionType.IN })
            .getRawOne();

        const outQuantity = await this.transactionRepository
            .createQueryBuilder('t')
            .select('COALESCE(SUM(t.quantity), 0)', 'total')
            .where('t.productId = :productId', { productId })
            .andWhere('t.transactionType = :type', { type: TransactionType.OUT })
            .getRawOne();

        const currentStock =
            product.initialBalance +
            parseInt(inQuantity.total) -
            parseInt(outQuantity.total);

        return currentStock;
    }

    async getProductWithStock(productId: number) {
        const product = await this.findOne(productId);
        const currentStock = await this.getCurrentStock(productId);

        return {
            ...product,
            currentStock,
        };
    }

    async getAllProductsWithStock() {
        const products = await this.findAll();

        const productsWithStock = await Promise.all(
            products.map(async (product) => {
                const currentStock = await this.getCurrentStock(product.id);
                return {
                    ...product,
                    currentStock,
                };
            }),
        );

        return productsWithStock;
    }
}
