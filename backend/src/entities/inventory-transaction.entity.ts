import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { TransactionType } from "../common/enums";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity("inventory_transactions")
export class InventoryTransaction {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: number;

  @Column({ type: "bigint", unsigned: true, name: "product_id" })
  productId: number;

  @ManyToOne(() => Product, (product) => product.transactions, { eager: false })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({
    type: "enum",
    enum: TransactionType,
    name: "transaction_type",
  })
  transactionType: TransactionType;

  @Column({ type: "int" })
  quantity: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    name: "unit_price",
  })
  unitPrice: number;

  @Column({ type: "varchar", length: 150, nullable: true, name: "vendor_name" })
  vendorName: string;

  @Column({
    type: "bigint",
    unsigned: true,
    nullable: true,
    name: "recipient_user_id",
  })
  recipientUserId: number;

  @ManyToOne(() => User, (user) => user.receivedTransactions, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: "recipient_user_id" })
  recipientUser: User;

  @Column({ type: "varchar", length: 255, nullable: true })
  remarks: string;

  @Column({ type: "bigint", unsigned: true, name: "created_by" })
  createdById: number;

  @ManyToOne(() => User, (user) => user.createdTransactions, { eager: false })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @CreateDateColumn({ name: "transaction_date" })
  transactionDate: Date;
}
