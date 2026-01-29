import { HttpException, HttpStatus, BadGatewayException } from "@nestjs/common";

/**
 * Custom exception for business logic errors
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        error: "Business Logic Error",
        message,
        statusCode,
      },
      statusCode,
    );
  }
}
