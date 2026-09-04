-- AlterTable
ALTER TABLE `customers` ADD COLUMN `pending_email` VARCHAR(191) NULL,
    ADD COLUMN `pending_email_otp_expires_at` DATETIME(3) NULL,
    ADD COLUMN `pending_email_otp_hash` VARCHAR(191) NULL;
