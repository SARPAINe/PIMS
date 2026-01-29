import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { AssetStatus } from "../common/enums";
import { AssetType } from "./asset-type.entity";
import { User } from "./user.entity";
import { AssetFieldValue } from "./asset-field-value.entity";
import { AssetAssignment } from "./asset-assignment.entity";

@Entity("assets")
@Index(["assetTypeId", "status"])
@Index(["serialNumber"])
@Index(["vendorName"])
export class Asset {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: number;

  @Column({ type: "bigint", unsigned: true, name: "asset_type_id" })
  assetTypeId: number;

  @ManyToOne(() => AssetType, (assetType) => assetType.assets, { eager: false })
  @JoinColumn({ name: "asset_type_id" })
  assetType: AssetType;

  @Column({ type: "varchar", length: 80, unique: true, name: "asset_number" })
  assetNumber: string;

  @Column({
    type: "varchar",
    length: 120,
    nullable: true,
    name: "serial_number",
  })
  serialNumber: string;

  @Column({
    type: "enum",
    enum: AssetStatus,
    default: AssetStatus.AVAILABLE,
  })
  status: AssetStatus;

  @Column({ type: "date", nullable: true, name: "purchase_date" })
  purchaseDate: Date;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
    name: "purchase_price_bdt",
  })
  purchasePriceBdt: number;

  @Column({ type: "varchar", length: 150, nullable: true, name: "vendor_name" })
  vendorName: string;

  @Column({ type: "bigint", unsigned: true, name: "created_by" })
  createdById: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => AssetFieldValue, (fieldValue) => fieldValue.asset)
  fieldValues: AssetFieldValue[];

  @OneToMany(() => AssetAssignment, (assignment) => assignment.asset)
  assignments: AssetAssignment[];
}
