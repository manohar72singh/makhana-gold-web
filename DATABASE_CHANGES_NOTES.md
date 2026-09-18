# 📜 Makhana Gold — Complete Database Changes & Migration Notes

This document contains a comprehensive record of all database schema updates, new tables, column alterations, indexes, and credential updates made in the **Makhana Gold** application. 

You can run the SQL queries below directly in **phpMyAdmin (Hostinger/cPanel)** or your **MySQL CLI** when deploying to staging or production.

---

## 1. Summary of All Database Changes

| Module / Feature | Affected Table | Type of Change | Key Details |
| :--- | :--- | :--- | :--- |
| **🏷️ Merchandising Badges** | `products` | New Columns & Indexes | `is_hot_deal`, `is_best_seller` (boolean flags for homepage sections) |
| **🔐 Admin Access** | `admin_users` | Record Update | Updated admin email to `mmakhanaltd@gmail.com` with password `admin123` |
| **🏢 B2B Wholesale & GST** | `customers` | New Columns & Index | `is_b2b`, `company_name`, `gstin` for business buyers |
| **📄 GST Tax Invoicing** | `orders` | New Columns & Index | `is_b2b`, `company_name`, `gstin` saved per order for legal tax invoices |
| **📱 Mobile OTP Login** | `otp_verifications` | New Table | Standalone table for 6-digit OTPs, rate limiting, and expiry |

---

## 2. Merchandising Badges (`products` table)

Controls which products appear in the **🔥 Hot Deals** and **⭐ Best Sellers** sections on the homepage, and displays promotional badges across the storefront and product detail pages.

### SQL Migration Query:
```sql
ALTER TABLE `products`
  ADD COLUMN `is_hot_deal` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`,
  ADD COLUMN `is_best_seller` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_hot_deal`,
  ADD INDEX `products_is_hot_deal_idx` (`is_hot_deal`),
  ADD INDEX `products_is_best_seller_idx` (`is_best_seller`);
```

### Prisma Schema Definition (`prisma/schema.prisma`):
```prisma
model Product {
  id           Int                @id @default(autoincrement())
  name         String
  slug         String             @unique
  description  String?            @db.Text
  categoryId   Int?               @map("category_id")
  category     Category?          @relation(fields: [categoryId], references: [id])
  status       ProductStatus      @default(draft)
  isHotDeal    Boolean            @default(false) @map("is_hot_deal")
  isBestSeller Boolean            @default(false) @map("is_best_seller")
  avgRating    Decimal            @default(0) @map("avg_rating") @db.Decimal(3, 2)
  reviewCount  Int                @default(0) @map("review_count")
  // ... relations ...

  @@index([status, categoryId])
  @@index([avgRating])
  @@index([createdAt])
  @@index([isHotDeal])
  @@index([isBestSeller])
  @@map("products")
}
```

---

## 3. Admin Credentials (`admin_users` table)

Updated credentials for the primary administrator account:

### Login Details:
- **Email:** `mmakhanaltd@gmail.com`
- **Password:** `admin123`
- **Role:** Super Admin (`role_id = 1`)

### SQL Update Query:
```sql
UPDATE `admin_users`
SET 
  `email` = 'mmakhanaltd@gmail.com',
  `password_hash` = '$2b$12$xAn1LR8RPFFKfJWAKXgvMOcsvCghjiLsdgafcx6bIWl0hFHlZV4s2',
  `name` = 'Makhana Gold Admin',
  `is_active` = 1
WHERE `id` = 2 OR `email` = 'admin@makhanagold.com';
```

---

## 4. B2B Wholesale & GST Tax Invoice Fields (`customers` & `orders` tables)

Enables wholesale business buyers to save their registered company name and GSTIN, automatically generate compliant GST Tax Invoices, and view volume-tiered pricing.

### SQL Migration Query:
```sql
-- 1. Add B2B fields to customers table
ALTER TABLE `customers`
  ADD COLUMN `is_b2b` TINYINT(1) NOT NULL DEFAULT 0 AFTER `pending_email_otp_expires_at`,
  ADD COLUMN `company_name` VARCHAR(255) NULL AFTER `is_b2b`,
  ADD COLUMN `gstin` VARCHAR(15) NULL AFTER `company_name`,
  ADD INDEX `customers_is_b2b_idx` (`is_b2b`);

-- 2. Add B2B fields to orders table
ALTER TABLE `orders`
  ADD COLUMN `is_b2b` TINYINT(1) NOT NULL DEFAULT 0 AFTER `tracking_url`,
  ADD COLUMN `company_name` VARCHAR(255) NULL AFTER `is_b2b`,
  ADD COLUMN `gstin` VARCHAR(15) NULL AFTER `company_name`,
  ADD INDEX `orders_is_b2b_idx` (`is_b2b`);
```

### Prisma Schema Definitions:
```prisma
model Customer {
  // ... existing fields ...
  isB2b                    Boolean    @default(false) @map("is_b2b")
  companyName              String?    @map("company_name") @db.VarChar(255)
  gstin                    String?    @map("gstin") @db.VarChar(15)
  
  @@index([phone])
  @@index([isB2b])
  @@map("customers")
}

model Order {
  // ... existing fields ...
  isB2b             Boolean              @default(false) @map("is_b2b")
  companyName       String?              @map("company_name") @db.VarChar(255)
  gstin             String?              @map("gstin") @db.VarChar(15)
  
  @@index([customerId, status])
  @@index([isB2b])
  @@map("orders")
}
```

---

## 5. Mobile Phone OTP Login Table (`otp_verifications`)

Provides passwordless authentication using 6-digit SMS OTPs with rate limiting and replay prevention.

### SQL Create Table Query:
```sql
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(20) NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `max_attempts` INT NOT NULL DEFAULT 5,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `otp_verifications_phone_idx` (`phone`),
  INDEX `otp_verifications_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Prisma Schema Definition:
```prisma
model OtpVerification {
  id          Int      @id @default(autoincrement())
  phone       String   @db.VarChar(20)
  otpHash     String   @map("otp_hash") @db.VarChar(255)
  expiresAt   DateTime @map("expires_at")
  attempts    Int      @default(0)
  maxAttempts Int      @default(5) @map("max_attempts")
  isVerified  Boolean  @default(false) @map("is_verified")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([phone])
  @@index([expiresAt])
  @@map("otp_verifications")
}
```

---

## 6. 🚀 Complete Production / Hostinger 1-Click SQL Script

Run this single consolidated script in **phpMyAdmin** on your live production database to apply all updates at once:

```sql
-- =============================================================================
-- MAKHANA GOLD PRODUCTION DATABASE MIGRATION SCRIPT
-- =============================================================================

-- 1. Create OTP Verifications Table
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(20) NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `max_attempts` INT NOT NULL DEFAULT 5,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `otp_verifications_phone_idx` (`phone`),
  INDEX `otp_verifications_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add B2B columns to customers table (run if columns do not exist)
ALTER TABLE `customers`
  ADD COLUMN IF NOT EXISTS `is_b2b` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `company_name` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `gstin` VARCHAR(15) NULL;

-- 3. Add B2B columns to orders table (run if columns do not exist)
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `is_b2b` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `company_name` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `gstin` VARCHAR(15) NULL;

-- 4. Add Merchandising Badges to products table
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `is_hot_deal` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `is_best_seller` TINYINT(1) NOT NULL DEFAULT 0;

-- 5. Update Admin User Credentials
UPDATE `admin_users`
SET 
  `email` = 'mmakhanaltd@gmail.com',
  `password_hash` = '$2b$12$xAn1LR8RPFFKfJWAKXgvMOcsvCghjiLsdgafcx6bIWl0hFHlZV4s2',
  `name` = 'Makhana Gold Admin',
  `is_active` = 1
WHERE `id` = 2 OR `email` = 'admin@makhanagold.com';
```

---

## 7. How to Synchronize with Prisma CLI

If deploying via terminal / SSH:
```bash
# Push schema changes directly to MySQL
npx prisma db push

# Regenerate Prisma Client
npx prisma generate
```
