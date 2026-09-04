/*
  Warnings:

  - You are about to drop the `returns` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `returns` DROP FOREIGN KEY `returns_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `returns` DROP FOREIGN KEY `returns_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `returns` DROP FOREIGN KEY `returns_order_item_id_fkey`;

-- DropTable
DROP TABLE `returns`;
