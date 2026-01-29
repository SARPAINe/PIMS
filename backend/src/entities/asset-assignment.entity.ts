import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Asset } from "./asset.entity";
import { User } from "./user.entity";

@Entity("asset_assignments")
@Index(["assetId", "handoverDate"])
@Index(["assignedToUserId", "issueDate"])
@Index(["assetId", "issueDate"])
export class AssetAssignment {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: number;

  @Column({ type: "bigint", unsigned: true, name: "asset_id" })
  assetId: number;

  @ManyToOne(() => Asset, (asset) => asset.assignments, { eager: false })
  @JoinColumn({ name: "asset_id" })
  asset: Asset;

  @Column({ type: "bigint", unsigned: true, name: "assigned_to_user_id" })
  assignedToUserId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "assigned_to_user_id" })
  assignedToUser: User;

  @Column({ type: "bigint", unsigned: true, name: "assigned_by_user_id" })
  assignedByUserId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "assigned_by_user_id" })
  assignedByUser: User;

  @Column({ type: "date", name: "issue_date" })
  issueDate: Date;

  @Column({ type: "date", nullable: true, name: "handover_date" })
  handoverDate: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  remarks: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
