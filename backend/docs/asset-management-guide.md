# Asset Management Module - Implementation Summary

## Overview
Complete Asset Management feature with EAV (Entity-Attribute-Value) pattern for dynamic fields and comprehensive assignment tracking.

## Directory Structure

```
src/
├── assets/
│   ├── assets.controller.ts       # REST API endpoints
│   ├── assets.module.ts            # Module configuration
│   ├── assets.service.ts           # Business logic
│   └── dto/
│       ├── assign-asset.dto.ts
│       ├── create-asset.dto.ts
│       ├── create-asset-type.dto.ts
│       ├── create-asset-type-field.dto.ts
│       ├── index.ts
│       ├── return-asset.dto.ts
│       └── transfer-asset.dto.ts
│
├── entities/
│   ├── asset-type.entity.ts        # Asset categories (Laptop, Monitor, etc.)
│   ├── asset-type-field.entity.ts  # Dynamic field definitions per type
│   ├── asset.entity.ts             # Asset records
│   ├── asset-field-value.entity.ts # EAV values for dynamic fields
│   ├── asset-assignment.entity.ts  # Assignment history/tracking
│   └── index.ts                    # Exports all entities
│
└── common/enums/
    ├── asset-status.enum.ts        # AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED, LOST
    ├── asset-field-type.enum.ts    # STRING, NUMBER, DATE, TEXT, BOOLEAN
    └── index.ts                    # Exports all enums
```

## Database Schema

### asset_types
- **id**: bigint PK
- **name**: varchar(80) UNIQUE
- **is_active**: boolean (default: true)
- **created_by**: FK → users.id
- **created_at**: timestamp

### asset_type_fields
- **id**: bigint PK
- **asset_type_id**: FK → asset_types.id
- **field_key**: varchar(64)
- **field_label**: varchar(120)
- **data_type**: ENUM(STRING, NUMBER, DATE, TEXT, BOOLEAN)
- **is_required**: boolean (default: false)
- **is_unique_per_type**: boolean (default: false)
- **sort_order**: int (default: 0)
- **created_at**: timestamp
- **UNIQUE** constraint: (asset_type_id, field_key)
- **INDEX**: (asset_type_id, sort_order)

### assets
- **id**: bigint PK
- **asset_type_id**: FK → asset_types.id
- **asset_number**: varchar(80) UNIQUE
- **serial_number**: varchar(120) nullable
- **status**: ENUM(AssetStatus) default AVAILABLE
- **purchase_date**: date nullable
- **purchase_price_bdt**: decimal(12,2) nullable
- **vendor_name**: varchar(150) nullable
- **created_by**: FK → users.id
- **created_at**: timestamp
- **INDEXES**: 
  - (asset_type_id, status)
  - (serial_number)
  - (vendor_name)

### asset_field_values (EAV pattern)
- **asset_id**: FK → assets.id (PK part 1)
- **field_id**: FK → asset_type_fields.id (PK part 2)
- **value_string**: varchar(255) nullable
- **value_number**: decimal(18,4) nullable
- **value_date**: date nullable
- **value_text**: text nullable
- **value_bool**: boolean nullable
- **created_at**: timestamp
- **Composite PK**: (asset_id, field_id)
- **INDEXES** for querying:
  - (field_id, value_string)
  - (field_id, value_number)
  - (field_id, value_date)

### asset_assignments (history tracking)
- **id**: bigint PK
- **asset_id**: FK → assets.id
- **assigned_to_user_id**: FK → users.id
- **assigned_by_user_id**: FK → users.id
- **issue_date**: date NOT NULL
- **handover_date**: date nullable (NULL = currently assigned)
- **remarks**: varchar(255) nullable
- **created_at**: timestamp
- **INDEXES**:
  - (asset_id, handover_date)
  - (assigned_to_user_id, issue_date)
  - (asset_id, issue_date)

## API Endpoints

### Asset Type Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/assets/asset-types` | ADMIN | Create new asset type |
| POST | `/assets/asset-types/:id/fields` | ADMIN | Add dynamic field to type |
| GET | `/assets/asset-types` | USER | List all types with fields |

### Asset Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/assets` | ADMIN | Create new asset with dynamic fields |
| GET | `/assets?assetTypeId=&status=&q=` | USER | List/search assets |
| GET | `/assets/:id` | USER | Get asset details with values & history |
| GET | `/assets/dashboard-summary` | USER | Get counts by status |

### Assignment Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/assets/:id/assign` | ADMIN | Assign asset to user |
| POST | `/assets/:id/return` | ADMIN | Return asset (close assignment) |
| POST | `/assets/:id/transfer` | ADMIN | Transfer to another user |
| GET | `/assets/:id/assignments` | USER | Get assignment history |
| GET | `/assets/users/:id/assets` | USER | Get user's current assets |

## Business Logic

### Asset Creation
1. Validate asset type exists
2. Check asset number is unique
3. Load all fields for the asset type
4. Validate required fields are present in dynamicValues
5. Transaction:
   - Create Asset record
   - Create AssetFieldValue records for each provided field
   - Map values to correct column based on field.dataType

### Assignment Rules
- **Only ONE active assignment** per asset (handover_date IS NULL)
- **Assign**: Ensure no active assignment → Create assignment → Set status = ASSIGNED
- **Return**: Find active assignment → Set handover_date → Set status = AVAILABLE
- **Transfer**: Close active assignment → Create new assignment → Keep status = ASSIGNED
- All operations use **database transactions** for consistency

### Dynamic Field Storage (EAV)
```typescript
// Based on AssetFieldType, value stored in:
STRING  → value_string
NUMBER  → value_number
DATE    → value_date
TEXT    → value_text
BOOLEAN → value_bool
```

## DTO Validations

### CreateAssetDto
```typescript
{
  assetTypeId: number;           // @IsInt
  assetNumber: string;           // @IsNotEmpty, @MaxLength(80)
  serialNumber?: string;         // Optional
  vendorName?: string;           // Optional
  purchaseDate?: string;         // @IsDateString (ISO format)
  purchasePriceBdt?: number;     // @IsNumber, @Min(0)
  dynamicValues?: Record<string, any>; // @IsObject
}
```

### AssignAssetDto / TransferAssetDto
```typescript
{
  assignedToUserId: number;      // @IsInt
  issueDate: string;             // @IsDateString
  remarks?: string;              // Optional, @MaxLength(255)
}
```

### ReturnAssetDto
```typescript
{
  handoverDate: string;          // @IsDateString
  remarks?: string;              // Optional
}
```

## Usage Examples

### 1. Create Asset Type
```bash
POST /assets/asset-types
{
  "name": "Laptop"
}
```

### 2. Add Fields to Type
```bash
POST /assets/asset-types/1/fields
{
  "fieldKey": "processor",
  "fieldLabel": "Processor",
  "dataType": "STRING",
  "isRequired": true,
  "sortOrder": 1
}

POST /assets/asset-types/1/fields
{
  "fieldKey": "ram_gb",
  "fieldLabel": "RAM (GB)",
  "dataType": "NUMBER",
  "isRequired": true,
  "sortOrder": 2
}
```

### 3. Create Asset with Dynamic Fields
```bash
POST /assets
{
  "assetTypeId": 1,
  "assetNumber": "LAP-2024-001",
  "serialNumber": "ABC123XYZ",
  "vendorName": "Dell",
  "purchaseDate": "2024-01-15",
  "purchasePriceBdt": 85000,
  "dynamicValues": {
    "processor": "Intel i7-11th Gen",
    "ram_gb": 16,
    "storage": "512GB SSD",
    "warranty_date": "2025-01-15"
  }
}
```

### 4. Assign Asset to User
```bash
POST /assets/1/assign
{
  "assignedToUserId": 5,
  "issueDate": "2024-01-20",
  "remarks": "Assigned for development work"
}
```

### 5. Transfer Asset
```bash
POST /assets/1/transfer
{
  "assignedToUserId": 8,
  "issueDate": "2024-03-15",
  "remarks": "Transfer to new team member"
}
```

### 6. Return Asset
```bash
POST /assets/1/return
{
  "handoverDate": "2024-06-30",
  "remarks": "Employee resigned"
}
```

### 7. Search Assets
```bash
GET /assets?assetTypeId=1&status=ASSIGNED
GET /assets?q=LAP-2024
GET /assets/dashboard-summary
```

### 8. Get Asset Details
```bash
GET /assets/1

Response includes:
- Base asset info
- Asset type
- Dynamic field values (formatted)
- Current assignment (if any)
- Full assignment history
```

## Security
- All endpoints protected by **JwtAuthGuard**
- Write operations (POST) restricted to **ADMIN role only**
- Read operations available to all authenticated users
- Uses existing auth infrastructure (RolesGuard, @Roles decorator)

## Key Features
✅ **EAV Pattern** for unlimited dynamic fields per asset type  
✅ **Complete assignment history** with transfer tracking  
✅ **Transaction safety** for assignment operations  
✅ **Flexible querying** with filters and search  
✅ **Status management** (Available, Assigned, Maintenance, etc.)  
✅ **Validation** at DTO level with class-validator  
✅ **Proper indexing** for performance  
✅ **Follows existing code patterns** from the codebase  

## Integration
Module is fully wired:
- ✅ Entities exported in `src/entities/index.ts`
- ✅ Enums exported in `src/common/enums/index.ts`
- ✅ AssetsModule imported in `src/app.module.ts`
- ✅ All entities registered in TypeORM configuration
- ✅ Database sync will auto-create tables in development mode

## Next Steps
1. Run the application - entities will auto-sync in dev mode
2. Test API endpoints with Postman/Insomnia
3. Create some asset types and fields
4. Create assets with dynamic values
5. Test assignment workflows
6. Consider adding frontend UI for asset management
