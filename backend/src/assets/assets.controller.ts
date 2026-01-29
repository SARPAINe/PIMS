import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AssetsService } from "./assets.service";
import {
  CreateAssetTypeDto,
  CreateAssetTypeFieldDto,
  CreateAssetDto,
  AssignAssetDto,
  ReturnAssetDto,
  TransferAssetDto,
} from "./dto";
import { JwtAuthGuard, RolesGuard } from "../auth/guards";
import { Roles, CurrentUser } from "../auth/decorators";
import { UserType, AssetStatus } from "../common/enums";
import { User } from "../entities";

@ApiTags("assets")
@ApiBearerAuth("JWT-auth")
@Controller("assets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // ====== Asset Types ======
  @Post("asset-types")
  @Roles(UserType.ADMIN)
  createAssetType(
    @Body() createAssetTypeDto: CreateAssetTypeDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.createAssetType(createAssetTypeDto, user);
  }

  @Post("asset-types/:id/fields")
  @Roles(UserType.ADMIN)
  addFieldToAssetType(
    @Param("id", ParseIntPipe) id: number,
    @Body() createFieldDto: CreateAssetTypeFieldDto,
  ) {
    return this.assetsService.addFieldToAssetType(id, createFieldDto);
  }

  @Get("asset-types")
  getAllAssetTypes() {
    return this.assetsService.getAllAssetTypes();
  }

  // ====== Assets ======
  @Post()
  @Roles(UserType.ADMIN)
  createAsset(
    @Body() createAssetDto: CreateAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.createAsset(createAssetDto, user);
  }

  @Get()
  findAllAssets(
    @Query("assetTypeId") assetTypeId?: string,
    @Query("status") status?: AssetStatus,
    @Query("q") q?: string,
  ) {
    return this.assetsService.findAllAssets({
      assetTypeId: assetTypeId ? parseInt(assetTypeId, 10) : undefined,
      status,
      q,
    });
  }

  @Get("dashboard-summary")
  getDashboardSummary(
    @Query("assetTypeId") assetTypeId?: string,
    @Query("status") status?: AssetStatus,
    @Query("q") q?: string,
  ) {
    return this.assetsService.getDashboardSummary({
      assetTypeId: assetTypeId ? parseInt(assetTypeId, 10) : undefined,
      status,
      q,
    });
  }

  @Get(":id")
  findAssetById(@Param("id", ParseIntPipe) id: number) {
    return this.assetsService.findAssetById(id);
  }

  // ====== Assignments ======
  @Post(":id/assign")
  @Roles(UserType.ADMIN)
  assignAsset(
    @Param("id", ParseIntPipe) id: number,
    @Body() assignDto: AssignAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.assignAsset(id, assignDto, user);
  }

  @Post(":id/return")
  @Roles(UserType.ADMIN)
  returnAsset(
    @Param("id", ParseIntPipe) id: number,
    @Body() returnDto: ReturnAssetDto,
  ) {
    return this.assetsService.returnAsset(id, returnDto);
  }

  @Post(":id/transfer")
  @Roles(UserType.ADMIN)
  transferAsset(
    @Param("id", ParseIntPipe) id: number,
    @Body() transferDto: TransferAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.transferAsset(id, transferDto, user);
  }

  @Get(":id/assignments")
  getAssetAssignments(@Param("id", ParseIntPipe) id: number) {
    return this.assetsService.getAssetAssignments(id);
  }

  // ====== User Assets ======
  @Get("users/:id/assets")
  getUserAssets(@Param("id", ParseIntPipe) id: number) {
    return this.assetsService.getUserAssets(id);
  }
}
