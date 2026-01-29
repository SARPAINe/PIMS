import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { AssetFieldType } from "../common/enums";
import { AssetType } from "./asset-type.entity";
import { AssetFieldValue } from "./asset-field-value.entity";

@Entity("asset_type_fields")
@Unique(["assetTypeId", "fieldKey"])
@Index(["assetTypeId", "sortOrder"])
export class AssetTypeField {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: number;

  @Column({ type: "bigint", unsigned: true, name: "asset_type_id" })
  assetTypeId: number;

  @ManyToOne(() => AssetType, (assetType) => assetType.fields, { eager: false })
  @JoinColumn({ name: "asset_type_id" })
  assetType: AssetType;

  @Column({ type: "varchar", length: 64, name: "field_key" })
  fieldKey: string;

  @Column({ type: "varchar", length: 120, name: "field_label" })
  fieldLabel: string;

  @Column({
    type: "enum",
    enum: AssetFieldType,
    name: "data_type",
  })
  dataType: AssetFieldType;

  @Column({ type: "boolean", default: false, name: "is_required" })
  isRequired: boolean;

  @Column({ type: "boolean", default: false, name: "is_unique_per_type" })
  isUniquePerType: boolean;

  @Column({ type: "int", default: 0, name: "sort_order" })
  sortOrder: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
