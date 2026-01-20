import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    Index,
} from 'typeorm';
import { Asset } from './asset.entity';
import { AssetTypeField } from './asset-type-field.entity';

@Entity('asset_field_values')
@Index(['fieldId', 'valueString'])
@Index(['fieldId', 'valueNumber'])
@Index(['fieldId', 'valueDate'])
export class AssetFieldValue {
    @PrimaryColumn({ type: 'bigint', unsigned: true, name: 'asset_id' })
    assetId: number;

    @PrimaryColumn({ type: 'bigint', unsigned: true, name: 'field_id' })
    fieldId: number;

    @ManyToOne(() => Asset, (asset) => asset.fieldValues, { eager: false })
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @ManyToOne(() => AssetTypeField, { eager: false })
    @JoinColumn({ name: 'field_id' })
    field: AssetTypeField;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'value_string' })
    valueString: string;

    @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, name: 'value_number' })
    valueNumber: number;

    @Column({ type: 'date', nullable: true, name: 'value_date' })
    valueDate: Date;

    @Column({ type: 'text', nullable: true, name: 'value_text' })
    valueText: string;

    @Column({ type: 'boolean', nullable: true, name: 'value_bool' })
    valueBool: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
