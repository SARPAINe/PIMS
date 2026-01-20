# Asset Management API - Quick Reference

## Base URL
All endpoints are prefixed with `/assets`

## Authentication
- All endpoints require JWT token: `Authorization: Bearer <token>`
- Endpoints marked **[ADMIN]** require user with `UserType.ADMIN`

---

## 📦 Asset Type Management

### Create Asset Type **[ADMIN]**
```http
POST /assets/asset-types
Content-Type: application/json

{
  "name": "Laptop"
}
```

### Add Field to Asset Type **[ADMIN]**
```http
POST /assets/asset-types/:id/fields
Content-Type: application/json

{
  "fieldKey": "processor",
  "fieldLabel": "Processor",
  "dataType": "STRING",        // STRING | NUMBER | DATE | TEXT | BOOLEAN
  "isRequired": true,
  "isUniquePerType": false,
  "sortOrder": 1
}
```

### Get All Asset Types
```http
GET /assets/asset-types
```

---

## 🖥️ Asset Management

### Create Asset **[ADMIN]**
```http
POST /assets
Content-Type: application/json

{
  "assetTypeId": 1,
  "assetNumber": "LAP-2024-001",
  "serialNumber": "ABC123XYZ",
  "vendorName": "Dell",
  "purchaseDate": "2024-01-15",
  "purchasePriceBdt": 85000,
  "dynamicValues": {
    "processor": "Intel i7",
    "ram_gb": 16,
    "storage": "512GB SSD"
  }
}
```

### List Assets (with filters)
```http
GET /assets?assetTypeId=1&status=ASSIGNED&q=LAP

Query Parameters:
- assetTypeId: number (optional)
- status: AVAILABLE | ASSIGNED | MAINTENANCE | RETIRED | LOST (optional)
- q: string (searches assetNumber and serialNumber)
```

### Get Asset Details
```http
GET /assets/:id

Returns:
- Base asset info
- Asset type
- Dynamic field values
- Current assignment
- Assignment history
```

### Dashboard Summary
```http
GET /assets/dashboard-summary

Returns:
{
  "total": 150,
  "available": 45,
  "assigned": 80,
  "maintenance": 15,
  "retired": 8,
  "lost": 2
}
```

---

## 👤 Assignment Management

### Assign Asset **[ADMIN]**
```http
POST /assets/:id/assign
Content-Type: application/json

{
  "assignedToUserId": 5,
  "issueDate": "2024-01-20",
  "remarks": "Assigned for development work"
}
```

**Effect:** 
- Creates new assignment record
- Sets asset status to `ASSIGNED`
- Fails if asset already has active assignment

### Return Asset **[ADMIN]**
```http
POST /assets/:id/return
Content-Type: application/json

{
  "handoverDate": "2024-06-30",
  "remarks": "Employee resigned"
}
```

**Effect:**
- Closes active assignment (sets handoverDate)
- Sets asset status to `AVAILABLE`
- Fails if no active assignment

### Transfer Asset **[ADMIN]**
```http
POST /assets/:id/transfer
Content-Type: application/json

{
  "assignedToUserId": 8,
  "issueDate": "2024-03-15",
  "remarks": "Transfer to new team member"
}
```

**Effect:**
- Closes current assignment
- Creates new assignment
- Keeps asset status as `ASSIGNED`
- All in one transaction

### Get Assignment History
```http
GET /assets/:id/assignments

Returns array of assignments (newest first):
[
  {
    "id": 5,
    "assetId": 1,
    "assignedToUser": {...},
    "assignedByUser": {...},
    "issueDate": "2024-03-15",
    "handoverDate": null,        // null = currently active
    "remarks": "Transfer to new team"
  },
  ...
]
```

### Get User's Current Assets
```http
GET /assets/users/:id/assets

Returns all assets currently assigned to user:
[
  {
    "id": 1,
    "assetNumber": "LAP-2024-001",
    "assetType": {...},
    ...
  },
  ...
]
```

---

## 🎯 Status Values
- `AVAILABLE` - Ready for assignment
- `ASSIGNED` - Currently assigned to user
- `MAINTENANCE` - Under repair/maintenance
- `RETIRED` - No longer in use
- `LOST` - Cannot be located

## 🔧 Field Data Types
- `STRING` - Short text (255 chars)
- `NUMBER` - Decimal numbers
- `DATE` - Date values (ISO 8601)
- `TEXT` - Long text
- `BOOLEAN` - True/false

---

## 📝 Example Workflow

### 1. Setup Asset Type
```bash
# Create asset type
POST /assets/asset-types
{ "name": "Monitor" }

# Add fields
POST /assets/asset-types/2/fields
{ "fieldKey": "screen_size", "fieldLabel": "Screen Size", "dataType": "STRING", "isRequired": true }

POST /assets/asset-types/2/fields
{ "fieldKey": "resolution", "fieldLabel": "Resolution", "dataType": "STRING", "isRequired": true }
```

### 2. Create Asset
```bash
POST /assets
{
  "assetTypeId": 2,
  "assetNumber": "MON-2024-001",
  "serialNumber": "MON123456",
  "vendorName": "Samsung",
  "purchaseDate": "2024-01-10",
  "purchasePriceBdt": 25000,
  "dynamicValues": {
    "screen_size": "27 inch",
    "resolution": "2560x1440"
  }
}
```

### 3. Assign to User
```bash
POST /assets/1/assign
{
  "assignedToUserId": 5,
  "issueDate": "2024-01-15",
  "remarks": "New setup"
}
```

### 4. Later: Transfer
```bash
POST /assets/1/transfer
{
  "assignedToUserId": 10,
  "issueDate": "2024-06-01",
  "remarks": "Reassignment"
}
```

### 5. Eventually: Return
```bash
POST /assets/1/return
{
  "handoverDate": "2024-12-31",
  "remarks": "Department restructure"
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Asset already has an active assignment. Please return it first."
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Asset with ID 999 not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Asset with number \"LAP-2024-001\" already exists"
}
```

---

## 🔍 Search Examples

```bash
# Find all laptops
GET /assets?assetTypeId=1

# Find all assigned assets
GET /assets?status=ASSIGNED

# Search by asset number or serial
GET /assets?q=LAP-2024

# Combine filters
GET /assets?assetTypeId=1&status=AVAILABLE&q=001
```
