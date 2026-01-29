import { Controller, Get, UseGuards, Query, Param } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../auth/guards";

@ApiTags("reports")
@ApiBearerAuth("JWT-auth")
@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("stock")
  getStockReport() {
    return this.reportsService.getStockReport();
  }

  @Get("product-to-person")
  getProductToPersonReport(
    @Query("productId") productId?: string,
    @Query("recipientUserId") recipientUserId?: string,
  ) {
    return this.reportsService.getProductToPersonReport(
      productId ? +productId : undefined,
      recipientUserId ? +recipientUserId : undefined,
    );
  }

  @Get("price-history")
  getPriceHistory(@Query("productId") productId?: string) {
    return this.reportsService.getPriceHistory(
      productId ? +productId : undefined,
    );
  }

  @Get("product/:id/detailed")
  getProductStockReport(@Param("id") id: string) {
    return this.reportsService.getProductStockReport(+id);
  }
}
