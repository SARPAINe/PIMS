import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { JwtAuthGuard, RolesGuard } from "../auth/guards";
import { Roles, CurrentUser } from "../auth/decorators";
import { UserType } from "../common/enums";
import { User } from "../entities";

@ApiTags("products")
@ApiBearerAuth("JWT-auth")
@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserType.ADMIN)
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll() {
    return this.productsService.getAllProductsWithStock();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.getProductWithStock(+id);
  }

  @Patch(":id")
  @Roles(UserType.ADMIN)
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(":id")
  @Roles(UserType.ADMIN)
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }
}
