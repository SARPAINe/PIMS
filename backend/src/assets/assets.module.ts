import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import {
  Asset,
  AssetType,
  AssetTypeField,
  AssetFieldValue,
  AssetAssignment,
  User,
} from "../entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      AssetType,
      AssetTypeField,
      AssetFieldValue,
      AssetAssignment,
      User,
    ]),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
