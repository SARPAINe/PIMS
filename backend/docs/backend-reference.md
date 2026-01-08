# Inventory Management System – Backend Reference Document

**Stack**: NestJS • TypeORM • MySQL
**Auth**: Stateless JWT (stored in browser localStorage)
**Audience**: Developer Copilot / Backend Engineers

---

## 1. Purpose of This Document

This document is the **single source of truth** for the backend design of the inventory management system.
It explains:

* Core domain concepts
* Authentication model
* Database schema
* Inventory transaction rules
* Reporting logic

It is intentionally concise, explicit, and implementation-ready so it can be used directly by Copilot or developers when building the NestJS backend.

---

## 2. Core Concepts & Design Philosophy

### 2.1 Ledger-Based Inventory (Critical)

* **Stock is never updated directly**
* All stock movement is recorded as transactions
* Current stock is always **derived**, never stored

This ensures:

* Full audit trail
* Easy reporting
* Safe recovery from bugs

---

### 2.2 Transaction Types

Inventory movement is represented by exactly three transaction types:

| Type      | Meaning                                           |
| --------- | ------------------------------------------------- |
| `INITIAL` | Initial stock when product is created (only once) |
| `IN`      | Incoming shipment / purchase                      |
| `OUT`     | Product sent to a user                            |

---

### 2.3 Price Tracking

* Price is stored **per IN / INITIAL transaction**
* No global product price exists
* Price history is derived from transactions

---

### 2.4 Vendor Handling

* Vendor is stored as a **string snapshot** (`vendor_name`)
* No vendor master table
* This avoids over‑normalization while preserving history

---

### 2.5 Users & Roles

* Single `users` table
* Users can be `ADMIN` or `USER`
* Admins perform inventory operations
* Users can receive inventory (OUT operation)
* Roles are extendable later

---

## 3. Authentication Model

### 3.1 Type

* Stateless authentication using **JWT**
* No token storage in database

### 3.2 Flow

1. User logs in using email + password
2. Backend issues a signed JWT with `exp`
3. Client stores token in `localStorage`
4. Token is sent via `Authorization: Bearer <token>`
5. Backend verifies token + expiry
6. On expiry or invalid token → `401`
7. Frontend redirects to login page

### 3.3 Database Impact

* Only password hashes are stored
* No session / token tables exist

---

## 4. Database Schema (Final)

### 4.1 Users Table

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    user_type ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_type ON users(user_type);
```

---

### 4.2 Products Table

```sql
CREATE TABLE products (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,

    initial_balance INT NOT NULL DEFAULT 0,

    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_products_name ON products(name);
```

**Rules**:

* `initial_balance` never changes
* Exactly one `INITIAL` transaction must exist per product

---

### 4.3 Inventory Transactions (Core Ledger)

```sql
CREATE TABLE inventory_transactions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    product_id BIGINT UNSIGNED NOT NULL,

    transaction_type ENUM('INITIAL', 'IN', 'OUT') NOT NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(10,2) NULL,
    vendor_name VARCHAR(150) NULL,

    recipient_user_id BIGINT UNSIGNED NULL,

    remarks VARCHAR(255),

    created_by BIGINT UNSIGNED NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (recipient_user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Indexes

```sql
CREATE INDEX idx_it_product ON inventory_transactions(product_id);

CREATE INDEX idx_it_product_type
    ON inventory_transactions(product_id, transaction_type);

CREATE INDEX idx_it_product_date
    ON inventory_transactions(product_id, transaction_date);

CREATE INDEX idx_it_recipient
    ON inventory_transactions(recipient_user_id);

CREATE INDEX idx_it_product_recipient
    ON inventory_transactions(product_id, recipient_user_id);
```

---

## 5. Inventory Operations

### 5.1 Create Product

* Insert into `products`
* Insert `INITIAL` transaction

### 5.2 IN Operation (Shipment)

* Insert transaction with:

  * `transaction_type = 'IN'`
  * `unit_price`
  * `vendor_name`

### 5.3 OUT Operation (Dispatch)

* Insert transaction with:

  * `transaction_type = 'OUT'`
  * `recipient_user_id`
  * `remarks`

---

## 6. Stock Calculation Rule

**Current Stock Formula**:

```
current_stock = initial_balance
              + SUM(IN quantities)
              - SUM(OUT quantities)
```

Stock is **never stored** in any column.

---

## 7. Reporting Rules

### 7.1 Product Stock Report

* Group by `product_id`
* Sum transactions using transaction type

### 7.2 Product → Person Report

* Filter `transaction_type = 'OUT'`
* Filter by `product_id` and `recipient_user_id`

### 7.3 Price History

* Filter `transaction_type = 'IN'`
* Order by `transaction_date`

---

## 8. TypeORM Mapping Notes

### Entities

* `User`
* `Product`
* `InventoryTransaction`

### Relations

* `Product.createdBy → User`
* `InventoryTransaction.product → Product`
* `InventoryTransaction.createdBy → User`
* `InventoryTransaction.recipientUser → User (nullable)`

### Enums

* `UserType { ADMIN, USER }`
* `TransactionType { INITIAL, IN, OUT }`

---

## 9. Non‑Goals (Explicit)

The system intentionally does **not** include:

* Vendor master table
* Recipient table
* Session/token persistence
* Cost valuation (FIFO / WAC)
* Soft deletes

These can be added later without breaking the model.

---

## 10. Future‑Safe Extensions

* Add more user roles
* Add refresh tokens
* Add monthly summary tables
* Add negative stock prevention trigger
* Add multi‑warehouse support

---

## 11. Final Notes

This design:

* Is minimal but correct
* Scales well
* Matches real ERP ledger models
* Is ideal for NestJS + TypeORM

This document should be used as the **reference contract** between backend code, Copilot suggestions, and future contributors.
