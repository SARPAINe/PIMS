import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'int', default: 0, name: 'initial_balance' })
    initialBalance: number;

    @Column({ type: 'varchar', length: 150, nullable: true, name: 'vendor_name' })
    vendorName: string;

    @Column({ type: 'bigint', unsigned: true, name: 'created_by' })
    createdById: number;

    @ManyToOne(() => User, (user) => user.products, { eager: false })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(
        () => InventoryTransaction,
        (transaction) => transaction.product,
    )
    transactions: InventoryTransaction[];
}
