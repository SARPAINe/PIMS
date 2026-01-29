import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { AssetTypeField } from "./asset-type-field.entity";
import { Asset } from "./asset.entity";

@Entity("asset_types")
export class AssetType {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: number;

  @Column({ type: "varchar", length: 80, unique: true })
  name: string;

  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @Column({ type: "bigint", unsigned: true, name: "created_by" })
  createdById: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => AssetTypeField, (field) => field.assetType)
  fields: AssetTypeField[];

  @OneToMany(() => Asset, (asset) => asset.assetType)
  assets: Asset[];
}
