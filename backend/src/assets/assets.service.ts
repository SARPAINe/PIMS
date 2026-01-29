import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, IsNull } from "typeorm";
import {
  Asset,
  AssetType,
  AssetTypeField,
  AssetFieldValue,
  AssetAssignment,
  User,
} from "../entities";
import { AssetStatus, AssetFieldType } from "../common/enums";
import {
  CreateAssetTypeDto,
  CreateAssetTypeFieldDto,
  CreateAssetDto,
  AssignAssetDto,
  ReturnAssetDto,
  TransferAssetDto,
} from "./dto";

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(AssetType)
    private assetTypeRepository: Repository<AssetType>,
    @InjectRepository(AssetTypeField)
    private assetTypeFieldRepository: Repository<AssetTypeField>,
    @InjectRepository(AssetFieldValue)
    private assetFieldValueRepository: Repository<AssetFieldValue>,
    @InjectRepository(AssetAssignment)
    private assetAssignmentRepository: Repository<AssetAssignment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // ====== Asset Type Management ======
  async createAssetType(
    createAssetTypeDto: CreateAssetTypeDto,
    user: User,
  ): Promise<AssetType> {
    const existing = await this.assetTypeRepository.findOne({
      where: { name: createAssetTypeDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Asset type with name "${createAssetTypeDto.name}" already exists`,
      );
    }

    const assetType = this.assetTypeRepository.create({
      name: createAssetTypeDto.name,
      createdById: user.id,
    });

    return this.assetTypeRepository.save(assetType);
  }

  async addFieldToAssetType(
    assetTypeId: number,
    createFieldDto: CreateAssetTypeFieldDto,
  ): Promise<AssetTypeField> {
    const assetType = await this.assetTypeRepository.findOne({
      where: { id: assetTypeId },
    });

    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${assetTypeId} not found`,
      );
    }

    const existing = await this.assetTypeFieldRepository.findOne({
      where: {
        assetTypeId: assetTypeId,
        fieldKey: createFieldDto.fieldKey,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Field with key "${createFieldDto.fieldKey}" already exists for this asset type`,
      );
    }

    const field = this.assetTypeFieldRepository.create({
      assetTypeId: assetTypeId,
      fieldKey: createFieldDto.fieldKey,
      fieldLabel: createFieldDto.fieldLabel,
      dataType: createFieldDto.dataType,
      isRequired: createFieldDto.isRequired || false,
      isUniquePerType: createFieldDto.isUniquePerType || false,
      sortOrder: createFieldDto.sortOrder || 0,
    });

    return this.assetTypeFieldRepository.save(field);
  }

  async getAllAssetTypes(): Promise<AssetType[]> {
    return this.assetTypeRepository.find({
      relations: ["fields", "createdBy"],
      order: {
        name: "ASC",
        fields: {
          sortOrder: "ASC",
        },
      },
    });
  }

  // ====== Asset Management ======
  async createAsset(
    createAssetDto: CreateAssetDto,
    user: User,
  ): Promise<Asset> {
    const assetType = await this.assetTypeRepository.findOne({
      where: { id: createAssetDto.assetTypeId },
    });

    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${createAssetDto.assetTypeId} not found`,
      );
    }

    // Check if asset number already exists
    const existingAsset = await this.assetRepository.findOne({
      where: { assetNumber: createAssetDto.assetNumber },
    });

    if (existingAsset) {
      throw new ConflictException(
        `Asset with number "${createAssetDto.assetNumber}" already exists`,
      );
    }

    // Load fields for validation
    const fields = await this.assetTypeFieldRepository.find({
      where: { assetTypeId: createAssetDto.assetTypeId },
    });

    // Validate required fields
    const dynamicValues = createAssetDto.dynamicValues || {};
    for (const field of fields) {
      if (field.isRequired && !dynamicValues[field.fieldKey]) {
        throw new BadRequestException(
          `Required field "${field.fieldLabel}" (${field.fieldKey}) is missing`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      // Create asset
      const asset = manager.create(Asset, {
        assetTypeId: createAssetDto.assetTypeId,
        assetNumber: createAssetDto.assetNumber,
        serialNumber: createAssetDto.serialNumber || null,
        vendorName: createAssetDto.vendorName || null,
        purchaseDate: createAssetDto.purchaseDate
          ? new Date(createAssetDto.purchaseDate)
          : null,
        purchasePriceBdt: createAssetDto.purchasePriceBdt || null,
        status: AssetStatus.AVAILABLE,
        createdById: user.id,
      });

      const savedAsset = await manager.save(Asset, asset);

      // Save dynamic field values
      for (const field of fields) {
        const value = dynamicValues[field.fieldKey];
        if (value !== undefined && value !== null) {
          const fieldValue = manager.create(AssetFieldValue, {
            assetId: savedAsset.id,
            fieldId: field.id,
            ...this.mapValueToColumns(value, field.dataType),
          });
          await manager.save(AssetFieldValue, fieldValue);
        }
      }

      return savedAsset;
    });
  }

  async findAllAssets(filters?: {
    assetTypeId?: number;
    status?: AssetStatus;
    q?: string;
  }): Promise<Asset[]> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder("asset")
      .leftJoinAndSelect("asset.assetType", "assetType")
      .leftJoinAndSelect("asset.createdBy", "createdBy");

    if (filters?.assetTypeId) {
      queryBuilder.andWhere("asset.assetTypeId = :assetTypeId", {
        assetTypeId: filters.assetTypeId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere("asset.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.q) {
      queryBuilder.andWhere(
        "(asset.assetNumber LIKE :q OR asset.serialNumber LIKE :q)",
        { q: `%${filters.q}%` },
      );
    }

    return queryBuilder.orderBy("asset.createdAt", "DESC").getMany();
  }

  async findAssetById(id: number): Promise<any> {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ["assetType", "createdBy", "fieldValues", "fieldValues.field"],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Get current assignment
    const currentAssignment = await this.assetAssignmentRepository.findOne({
      where: {
        assetId: id,
        handoverDate: IsNull(),
      },
      relations: ["assignedToUser", "assignedByUser"],
    });

    // Get assignment history
    const assignmentHistory = await this.assetAssignmentRepository.find({
      where: { assetId: id },
      relations: ["assignedToUser", "assignedByUser"],
      order: { issueDate: "DESC" },
    });

    // Format dynamic values
    const dynamicValues: Record<string, any> = {};
    for (const fieldValue of asset.fieldValues) {
      dynamicValues[fieldValue.field.fieldKey] = this.extractValue(fieldValue);
    }

    return {
      ...asset,
      dynamicValues,
      currentAssignment,
      assignmentHistory,
    };
  }

  async getDashboardSummary(filters?: {
    assetTypeId?: number;
    status?: AssetStatus;
    q?: string;
  }): Promise<any> {
    // Build base query with filters - using parameterized queries to prevent SQL injection
    const buildQuery = () => {
      const queryBuilder = this.assetRepository.createQueryBuilder("asset");

      if (filters?.assetTypeId) {
        queryBuilder.andWhere("asset.assetTypeId = :assetTypeId", {
          assetTypeId: filters.assetTypeId,
        });
      }

      if (filters?.status) {
        queryBuilder.andWhere("asset.status = :status", {
          status: filters.status,
        });
      }

      if (filters?.q) {
        queryBuilder.andWhere(
          "(asset.assetNumber LIKE :q OR asset.serialNumber LIKE :q)",
          { q: `%${filters.q}%` },
        );
      }

      return queryBuilder;
    };

    // Get total count with filters
    const total = await buildQuery().getCount();

    // Get counts by status with filters applied
    const available = await buildQuery()
      .andWhere("asset.status = :availableStatus", {
        availableStatus: AssetStatus.AVAILABLE,
      })
      .getCount();

    const assigned = await buildQuery()
      .andWhere("asset.status = :assignedStatus", {
        assignedStatus: AssetStatus.ASSIGNED,
      })
      .getCount();

    const maintenance = await buildQuery()
      .andWhere("asset.status = :maintenanceStatus", {
        maintenanceStatus: AssetStatus.MAINTENANCE,
      })
      .getCount();

    const retired = await buildQuery()
      .andWhere("asset.status = :retiredStatus", {
        retiredStatus: AssetStatus.RETIRED,
      })
      .getCount();

    const lost = await buildQuery()
      .andWhere("asset.status = :lostStatus", {
        lostStatus: AssetStatus.LOST,
      })
      .getCount();

    return {
      total,
      available,
      assigned,
      maintenance,
      retired,
      lost,
    };
  }

  // ====== Assignment Management ======
  async assignAsset(
    assetId: number,
    assignDto: AssignAssetDto,
    user: User,
  ): Promise<AssetAssignment> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    const assignedToUser = await this.userRepository.findOne({
      where: { id: assignDto.assignedToUserId },
    });

    if (!assignedToUser) {
      throw new NotFoundException(
        `User with ID ${assignDto.assignedToUserId} not found`,
      );
    }

    // Check if there's an active assignment
    const activeAssignment = await this.assetAssignmentRepository.findOne({
      where: {
        assetId: assetId,
        handoverDate: IsNull(),
      },
    });

    if (activeAssignment) {
      throw new BadRequestException(
        "Asset already has an active assignment. Please return it first.",
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // Create new assignment
      const assignment = manager.create(AssetAssignment, {
        assetId: assetId,
        assignedToUserId: assignDto.assignedToUserId,
        assignedByUserId: user.id,
        issueDate: new Date(assignDto.issueDate),
        remarks: assignDto.remarks || null,
      });

      const savedAssignment = await manager.save(AssetAssignment, assignment);

      // Update asset status
      await manager.update(Asset, assetId, {
        status: AssetStatus.ASSIGNED,
      });

      return savedAssignment;
    });
  }

  async returnAsset(
    assetId: number,
    returnDto: ReturnAssetDto,
  ): Promise<AssetAssignment> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    const activeAssignment = await this.assetAssignmentRepository.findOne({
      where: {
        assetId: assetId,
        handoverDate: IsNull(),
      },
    });

    if (!activeAssignment) {
      throw new BadRequestException(
        "No active assignment found for this asset",
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // Close assignment
      activeAssignment.handoverDate = new Date(returnDto.handoverDate);
      if (returnDto.remarks) {
        activeAssignment.remarks = returnDto.remarks;
      }
      const updatedAssignment = await manager.save(
        AssetAssignment,
        activeAssignment,
      );

      // Update asset status to AVAILABLE
      await manager.update(Asset, assetId, {
        status: AssetStatus.AVAILABLE,
      });

      return updatedAssignment;
    });
  }

  async transferAsset(
    assetId: number,
    transferDto: TransferAssetDto,
    user: User,
  ): Promise<AssetAssignment> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    const newAssignedToUser = await this.userRepository.findOne({
      where: { id: transferDto.assignedToUserId },
    });

    if (!newAssignedToUser) {
      throw new NotFoundException(
        `User with ID ${transferDto.assignedToUserId} not found`,
      );
    }

    const activeAssignment = await this.assetAssignmentRepository.findOne({
      where: {
        assetId: assetId,
        handoverDate: IsNull(),
      },
    });

    if (!activeAssignment) {
      throw new BadRequestException(
        "No active assignment found for this asset",
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // Close current assignment
      activeAssignment.handoverDate = new Date(transferDto.issueDate);
      await manager.save(AssetAssignment, activeAssignment);

      // Create new assignment
      const newAssignment = manager.create(AssetAssignment, {
        assetId: assetId,
        assignedToUserId: transferDto.assignedToUserId,
        assignedByUserId: user.id,
        issueDate: new Date(transferDto.issueDate),
        remarks: transferDto.remarks || null,
      });

      const savedAssignment = await manager.save(
        AssetAssignment,
        newAssignment,
      );

      // Asset remains ASSIGNED
      return savedAssignment;
    });
  }

  async getAssetAssignments(assetId: number): Promise<AssetAssignment[]> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    return this.assetAssignmentRepository.find({
      where: { assetId },
      relations: ["assignedToUser", "assignedByUser"],
      order: { issueDate: "DESC" },
    });
  }

  async getUserAssets(userId: number): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Find all active assignments for this user
    const activeAssignments = await this.assetAssignmentRepository.find({
      where: {
        assignedToUserId: userId,
        handoverDate: IsNull(),
      },
      relations: [
        "asset",
        "asset.assetType",
        "assignedToUser",
        "assignedByUser",
      ],
    });

    // Map assignments to assets and attach currentAssignment to each asset
    return activeAssignments.map((assignment) => ({
      ...assignment.asset,
      currentAssignment: assignment,
    }));
  }

  // ====== Helper Methods ======
  private mapValueToColumns(
    value: any,
    dataType: AssetFieldType,
  ): Partial<AssetFieldValue> {
    switch (dataType) {
      case AssetFieldType.STRING:
        return { valueString: String(value) };
      case AssetFieldType.NUMBER:
        return { valueNumber: Number(value) };
      case AssetFieldType.DATE:
        return { valueDate: new Date(value) };
      case AssetFieldType.TEXT:
        return { valueText: String(value) };
      case AssetFieldType.BOOLEAN:
        return { valueBool: Boolean(value) };
      default:
        return { valueString: String(value) };
    }
  }

  private extractValue(fieldValue: AssetFieldValue): any {
    if (fieldValue.valueString !== null) return fieldValue.valueString;
    if (fieldValue.valueNumber !== null) return fieldValue.valueNumber;
    if (fieldValue.valueDate !== null) return fieldValue.valueDate;
    if (fieldValue.valueText !== null) return fieldValue.valueText;
    if (fieldValue.valueBool !== null) return fieldValue.valueBool;
    return null;
  }
}
