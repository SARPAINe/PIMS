import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { QueryFailedError } from "typeorm";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";
    let error = "Internal Server Error";

    // Handle HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    }
    // Handle TypeORM Query Failed Errors (Database errors)
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      const driverError = exception.driverError as any;

      // Handle MySQL specific errors
      if (driverError.code === "ER_DUP_ENTRY") {
        message = "Duplicate entry. Record already exists.";
        error = "Duplicate Entry";
      } else if (driverError.code === "ER_NO_REFERENCED_ROW_2") {
        message = "Referenced record does not exist.";
        error = "Foreign Key Constraint";
      } else if (driverError.code === "ER_ROW_IS_REFERENCED_2") {
        message =
          "Cannot delete record because it is referenced by other records.";
        error = "Foreign Key Constraint";
      } else {
        message = "Database query failed. Please check your input.";
        error = "Database Error";
      }

      // Log the full error for debugging
      this.logger.error(
        `Database Error: ${driverError.code} - ${driverError.message}`,
        exception.stack,
      );
    }
    // Handle unknown errors
    else if (exception instanceof Error) {
      message = exception.message || message;
      this.logger.error(
        `Unhandled Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error("Unknown exception type", exception);
    }

    // Build error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    // Log the error for non-client errors (5xx)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    } else {
      // Log client errors (4xx) as warnings
      this.logger.warn(
        `${request.method} ${request.url} - ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
