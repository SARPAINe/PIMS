# Global Error Handling

This document describes the global error handling implementation in the backend.

## Overview

The application uses a centralized error handling approach through NestJS exception filters. All errors are caught and transformed into consistent HTTP responses with proper logging.

## Components

### 1. HttpExceptionFilter (`src/common/filters/http-exception.filter.ts`)

The global exception filter that catches all exceptions thrown in the application.

**Features:**
- Catches all types of exceptions (HTTP exceptions, database errors, unknown errors)
- Transforms exceptions into consistent JSON responses
- Provides detailed logging for debugging
- Handles TypeORM database errors with user-friendly messages
- Differentiates between client errors (4xx) and server errors (5xx)

**Response Format:**
```json
{
  "statusCode": 400,
  "timestamp": "2026-01-29T10:30:00.000Z",
  "path": "/api/products",
  "method": "POST",
  "error": "Bad Request",
  "message": "Validation failed"
}
```

**Database Error Handling:**
- `ER_DUP_ENTRY`: Duplicate entry errors
- `ER_NO_REFERENCED_ROW_2`: Foreign key constraint (referenced record doesn't exist)
- `ER_ROW_IS_REFERENCED_2`: Foreign key constraint (cannot delete referenced record)

### 2. BusinessException (`src/common/exceptions/business.exception.ts`)

A custom exception class for business logic errors.

**Usage:**
```typescript
import { BusinessException } from '@common/exceptions';

// Throw a business logic error
throw new BusinessException('Insufficient inventory for this transaction');

// With custom status code
throw new BusinessException('Resource not found', HttpStatus.NOT_FOUND);
```

## Usage in Controllers and Services

### Using Built-in HTTP Exceptions

```typescript
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';

// Not found
throw new NotFoundException('Product not found');

// Bad request
throw new BadRequestException('Invalid quantity');

// Unauthorized
throw new UnauthorizedException('Invalid credentials');
```

### Using BusinessException

```typescript
import { BusinessException } from '@common/exceptions';

// Business logic validation
if (product.quantity < requestedQuantity) {
  throw new BusinessException('Insufficient product quantity available');
}

// Access control
if (user.role !== 'ADMIN') {
  throw new BusinessException('Only administrators can perform this action', HttpStatus.FORBIDDEN);
}
```

### Automatic Database Error Handling

Database errors are automatically caught and transformed:

```typescript
// This will be caught if email already exists
await this.userRepository.save({ email: 'duplicate@email.com' });
// Returns: "Duplicate entry. Record already exists."

// This will be caught if trying to delete a referenced record
await this.productRepository.delete(productId);
// Returns: "Cannot delete record because it is referenced by other records."
```

## Logging

The exception filter automatically logs errors:

- **Server Errors (5xx)**: Logged as errors with full stack trace
- **Client Errors (4xx)**: Logged as warnings with message details
- **Database Errors**: Logged with database error codes and details

Logs include:
- HTTP method and path
- Error type and message
- Stack trace (for server errors)
- Timestamp

## Configuration

The global exception filter is registered in `main.ts`:

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

## Best Practices

1. **Use appropriate exception types**: Use `NotFoundException`, `BadRequestException`, etc. for standard HTTP errors
2. **Use BusinessException for business logic**: Custom business rules should throw `BusinessException`
3. **Don't catch exceptions unless necessary**: Let the global filter handle them
4. **Provide meaningful messages**: Error messages should be clear and actionable
5. **Avoid exposing sensitive information**: Never include passwords, tokens, or internal details in error messages

## Examples

### Service Layer
```typescript
@Injectable()
export class ProductsService {
  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async delete(id: number) {
    const product = await this.findOne(id);
    
    // Check if product has transactions
    if (product.transactions?.length > 0) {
      throw new BusinessException(
        'Cannot delete product with existing transactions'
      );
    }
    
    return this.productRepository.remove(product);
  }
}
```

### Controller Layer
```typescript
@Controller('products')
export class ProductsController {
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    // Validation errors are automatically handled by ValidationPipe
    // Database errors are automatically handled by HttpExceptionFilter
    return this.productsService.create(createProductDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // NotFoundException is automatically caught and formatted
    return this.productsService.findOne(+id);
  }
}
```

## Testing Error Handling

You can test the error handling by:

1. Triggering validation errors (send invalid data)
2. Accessing non-existent resources
3. Creating duplicate records
4. Deleting records with foreign key constraints

All errors will be caught and formatted consistently.
