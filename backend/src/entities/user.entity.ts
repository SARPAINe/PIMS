import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { UserType } from "../common/enums";
import { Product } from "./product.entity";
import { InventoryTransaction } from "./inventory-transaction.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, name: "password_hash" })
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.USER,
    name: "user_type",
  })
  userType: UserType;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.createdBy)
  createdTransactions: InventoryTransaction[];

  @OneToMany(
    () => InventoryTransaction,
    (transaction) => transaction.recipientUser,
  )
  receivedTransactions: InventoryTransaction[];
}
