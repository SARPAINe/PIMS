import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransaction, Product, User } from '../entities';
import { TransactionType } from '../common/enums';
import { CreateInTransactionDto, CreateOutTransactionDto } from './dto';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(InventoryTransaction)
        private transactionRepository: Repository<InventoryTransaction>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createInTransaction(
        createInTransactionDto: CreateInTransactionDto,
        user: User,
    ): Promise<InventoryTransaction> {
        // Verify product exists
        const product = await this.productRepository.findOne({
            where: { id: createInTransactionDto.productId },
        });

        if (!product) {
            throw new NotFoundException(
                `Product with ID ${createInTransactionDto.productId} not found`,
            );
        }

        // Create IN transaction
        const transaction = this.transactionRepository.create({
            productId: createInTransactionDto.productId,
            transactionType: TransactionType.IN,
            quantity: createInTransactionDto.quantity,
            unitPrice: createInTransactionDto.unitPrice,
            vendorName: createInTransactionDto.vendorName,
            remarks: createInTransactionDto.remarks,
            recipientUserId: null,
            createdById: user.id,
        });

        return this.transactionRepository.save(transaction);
    }

    async createOutTransaction(
        createOutTransactionDto: CreateOutTransactionDto,
        user: User,
    ): Promise<InventoryTransaction> {
        // Verify product exists
        const product = await this.productRepository.findOne({
            where: { id: createOutTransactionDto.productId },
        });

        if (!product) {
            throw new NotFoundException(
                `Product with ID ${createOutTransactionDto.productId} not found`,
            );
        }

        // Verify recipient user exists
        const recipient = await this.userRepository.findOne({
            where: { id: createOutTransactionDto.recipientUserId },
        });

        if (!recipient) {
            throw new NotFoundException(
                `Recipient user with ID ${createOutTransactionDto.recipientUserId} not found`,
            );
        }

        // Calculate current stock
        const currentStock = await this.getCurrentStock(
            createOutTransactionDto.productId,
        );

        // Check if sufficient stock is available
        if (currentStock < createOutTransactionDto.quantity) {
            throw new BadRequestException(
                `Insufficient stock. Available: ${currentStock}, Requested: ${createOutTransactionDto.quantity}`,
            );
        }

        // Create OUT transaction
        const transaction = this.transactionRepository.create({
            productId: createOutTransactionDto.productId,
            transactionType: TransactionType.OUT,
            quantity: createOutTransactionDto.quantity,
            unitPrice: null,
            vendorName: null,
            recipientUserId: createOutTransactionDto.recipientUserId,
            remarks: createOutTransactionDto.remarks,
            createdById: user.id,
        });

        return this.transactionRepository.save(transaction);
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: InventoryTransaction[]; total: number; page: number; limit: number; totalPages: number }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.transactionRepository.findAndCount({
            relations: ['product', 'createdBy', 'recipientUser'],
            order: { transactionDate: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByProduct(productId: number, page: number = 1, limit: number = 10): Promise<{ data: InventoryTransaction[]; total: number; page: number; limit: number; totalPages: number }> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const skip = (page - 1) * limit;

        const [data, total] = await this.transactionRepository.findAndCount({
            where: { productId },
            relations: ['product', 'createdBy', 'recipientUser'],
            order: { transactionDate: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByRecipient(recipientUserId: number, page: number = 1, limit: number = 10): Promise<{ data: InventoryTransaction[]; total: number; page: number; limit: number; totalPages: number }> {
        const user = await this.userRepository.findOne({
            where: { id: recipientUserId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${recipientUserId} not found`);
        }

        const skip = (page - 1) * limit;

        const [data, total] = await this.transactionRepository.findAndCount({
            where: { recipientUserId },
            relations: ['product', 'createdBy', 'recipientUser'],
            order: { transactionDate: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    private async getCurrentStock(productId: number): Promise<number> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
        });

        if (!product) {
            return 0;
        }

        // Calculate: initial_balance + SUM(IN) - SUM(OUT)
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

        return (
            product.initialBalance +
            parseInt(inQuantity.total) -
            parseInt(outQuantity.total)
        );
    }
}
