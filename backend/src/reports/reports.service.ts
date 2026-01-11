import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransaction, Product } from '../entities';
import { TransactionType } from '../common/enums';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(InventoryTransaction)
        private transactionRepository: Repository<InventoryTransaction>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async getStockReport() {
        const products = await this.productRepository.find({
            relations: ['createdBy'],
        });

        const report = await Promise.all(
            products.map(async (product) => {
                // Get IN transactions sum
                const inResult = await this.transactionRepository
                    .createQueryBuilder('t')
                    .select('COALESCE(SUM(t.quantity), 0)', 'total')
                    .where('t.productId = :productId', { productId: product.id })
                    .andWhere('t.transactionType = :type', { type: TransactionType.IN })
                    .getRawOne();

                // Get OUT transactions sum
                const outResult = await this.transactionRepository
                    .createQueryBuilder('t')
                    .select('COALESCE(SUM(t.quantity), 0)', 'total')
                    .where('t.productId = :productId', { productId: product.id })
                    .andWhere('t.transactionType = :type', { type: TransactionType.OUT })
                    .getRawOne();

                const totalIn = parseInt(inResult.total) + product.initialBalance;
                const totalOut = parseInt(outResult.total);
                const currentStock = product.initialBalance + parseInt(inResult.total) - totalOut;

                return {
                    productId: product.id,
                    productName: product.name,
                    initialBalance: product.initialBalance,
                    totalIn,
                    totalOut,
                    currentStock,
                    createdBy: {
                        id: product.createdBy.id,
                        name: product.createdBy.name,
                    },
                };
            }),
        );

        return report;
    }

    async getProductToPersonReport(productId?: number, recipientUserId?: number) {
        const queryBuilder = this.transactionRepository
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.product', 'product')
            .leftJoinAndSelect('t.recipientUser', 'recipient')
            .leftJoinAndSelect('t.createdBy', 'createdBy')
            .where('t.transactionType = :type', { type: TransactionType.OUT });

        if (productId) {
            queryBuilder.andWhere('t.productId = :productId', { productId });
        }

        if (recipientUserId) {
            queryBuilder.andWhere('t.recipientUserId = :recipientUserId', {
                recipientUserId,
            });
        }

        const transactions = await queryBuilder
            .orderBy('t.transactionDate', 'DESC')
            .getMany();

        // Group by product and recipient
        const groupedReport = transactions.reduce((acc, transaction) => {
            const key = `${transaction.productId}_${transaction.recipientUserId}`;

            if (!acc[key]) {
                acc[key] = {
                    productId: transaction.productId,
                    productName: transaction.product.name,
                    recipientUserId: transaction.recipientUserId,
                    recipientName: transaction.recipientUser.name,
                    recipientEmail: transaction.recipientUser.email,
                    totalQuantity: 0,
                    transactions: [],
                };
            }

            acc[key].totalQuantity += transaction.quantity;
            acc[key].transactions.push({
                id: transaction.id,
                quantity: transaction.quantity,
                remarks: transaction.remarks,
                transactionDate: transaction.transactionDate,
                createdBy: {
                    id: transaction.createdBy.id,
                    name: transaction.createdBy.name,
                },
            });

            return acc;
        }, {});

        return Object.values(groupedReport);
    }

    async getPriceHistory(productId?: number) {
        const queryBuilder = this.transactionRepository
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.product', 'product')
            .leftJoinAndSelect('t.createdBy', 'createdBy')
            .where('t.transactionType IN (:...types)', {
                types: [TransactionType.IN, TransactionType.INITIAL]
            })
            .andWhere('t.unitPrice IS NOT NULL');

        if (productId) {
            queryBuilder.andWhere('t.productId = :productId', { productId });
        }

        const transactions = await queryBuilder
            .orderBy('t.transactionDate', 'DESC')
            .getMany();

        return transactions.map((t) => ({
            id: t.id,
            productId: t.productId,
            productName: t.product.name,
            transactionType: t.transactionType,
            quantity: t.quantity,
            unitPrice: t.unitPrice,
            totalPrice: parseFloat(t.unitPrice.toString()) * t.quantity,
            vendorName: t.vendorName,
            transactionDate: t.transactionDate,
            createdBy: {
                id: t.createdBy.id,
                name: t.createdBy.name,
            },
        }));
    }

    async getProductStockReport(productId: number) {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['createdBy'],
        });

        if (!product) {
            return null;
        }

        const transactions = await this.transactionRepository.find({
            where: { productId },
            relations: ['createdBy', 'recipientUser'],
            order: { transactionDate: 'ASC' },
        });

        let runningStock = product.initialBalance;
        const transactionHistory = transactions.map((t) => {
            if (t.transactionType === TransactionType.IN) {
                runningStock += t.quantity;
            } else if (t.transactionType === TransactionType.OUT) {
                runningStock -= t.quantity;
            }

            return {
                id: t.id,
                transactionType: t.transactionType,
                quantity: t.quantity,
                unitPrice: t.unitPrice,
                vendorName: t.vendorName,
                recipientUser: t.recipientUser
                    ? {
                        id: t.recipientUser.id,
                        name: t.recipientUser.name,
                    }
                    : null,
                remarks: t.remarks,
                transactionDate: t.transactionDate,
                createdBy: {
                    id: t.createdBy.id,
                    name: t.createdBy.name,
                },
                stockAfterTransaction: runningStock,
            };
        });

        return {
            product: {
                id: product.id,
                name: product.name,
                initialBalance: product.initialBalance,
                createdBy: {
                    id: product.createdBy.id,
                    name: product.createdBy.name,
                },
            },
            currentStock: runningStock,
            transactionHistory,
        };
    }
}
