-- AlterTable
ALTER TABLE `orders` ADD COLUMN `courier_partner` VARCHAR(191) NULL,
    ADD COLUMN `tracking_number` VARCHAR(191) NULL,
    ADD COLUMN `tracking_url` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `hero_banners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slide_key` VARCHAR(191) NOT NULL,
    `badge` VARCHAR(191) NOT NULL,
    `badge_color` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `highlight_title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `cta_text` VARCHAR(191) NOT NULL,
    `cta_link` VARCHAR(191) NOT NULL,
    `secondary_cta_text` VARCHAR(191) NULL,
    `secondary_cta_link` VARCHAR(191) NULL,
    `bg_image` VARCHAR(500) NOT NULL,
    `theme` VARCHAR(191) NOT NULL DEFAULT 'light',
    `social_proof` VARCHAR(191) NULL,
    `show_marketplaces` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hero_banners_slide_key_key`(`slide_key`),
    INDEX `hero_banners_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `faq_items_is_active_category_sort_order_idx`(`is_active`, `category`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_pillars` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `section` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `accent_color` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `feature_pillars_is_active_section_sort_order_idx`(`is_active`, `section`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `platform_key` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `badge_text` VARCHAR(191) NULL,
    `border_hover` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `marketplace_links_platform_key_key`(`platform_key`),
    INDEX `marketplace_links_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `admin_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,

    INDEX `contact_inquiries_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletter_subscribers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `source` VARCHAR(191) NOT NULL DEFAULT 'footer',
    `coupon_sent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `newsletter_subscribers_email_key`(`email`),
    INDEX `newsletter_subscribers_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `description` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `site_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `broadcast_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(191) NOT NULL,
    `badge` VARCHAR(191) NULL,
    `headline` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `coupon_code` VARCHAR(191) NULL,
    `cta_text` VARCHAR(191) NULL,
    `cta_url` VARCHAR(191) NULL,
    `banner_image_url` VARCHAR(500) NULL,
    `audience` VARCHAR(191) NOT NULL,
    `target_email` VARCHAR(191) NULL,
    `recipient_count` INTEGER NOT NULL DEFAULT 0,
    `sent_by_admin` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'sent',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `broadcast_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `cover_image` VARCHAR(500) NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'Health & Wellness',
    `tags` VARCHAR(255) NULL,
    `author_name` VARCHAR(191) NOT NULL DEFAULT 'Makhana Gold Nutritionist',
    `author_role` VARCHAR(191) NOT NULL DEFAULT 'Holistic Wellness & Food Science',
    `author_avatar` VARCHAR(191) NULL DEFAULT '/images/logo/logo.png',
    `reading_time_minutes` INTEGER NOT NULL DEFAULT 5,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `views_count` INTEGER NOT NULL DEFAULT 0,
    `scheduled_at` DATETIME(3) NULL,
    `blog_faqs` TEXT NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `meta_keywords` VARCHAR(500) NULL,
    `canonical_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    INDEX `blog_posts_is_published_category_idx`(`is_published`, `category`),
    INDEX `blog_posts_scheduled_at_idx`(`scheduled_at`),
    INDEX `blog_posts_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blog_post_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,
    `author_name` VARCHAR(100) NOT NULL,
    `author_email` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `is_approved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `blog_comments_blog_post_id_is_approved_idx`(`blog_post_id`, `is_approved`),
    INDEX `blog_comments_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `issuing_body` VARCHAR(191) NOT NULL,
    `certificate_number` VARCHAR(191) NULL,
    `valid_until` DATETIME(3) NULL,
    `document_url` VARCHAR(500) NULL,
    `badge_image` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `certifications_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cart_items_cart_id_idx` ON `cart_items`(`cart_id`);

-- CreateIndex
CREATE INDEX `carts_session_token_idx` ON `carts`(`session_token`);

-- CreateIndex
CREATE INDEX `coupons_is_active_idx` ON `coupons`(`is_active`);

-- CreateIndex
CREATE INDEX `customers_phone_idx` ON `customers`(`phone`);

-- CreateIndex
CREATE INDEX `orders_customer_id_status_idx` ON `orders`(`customer_id`, `status`);

-- CreateIndex
CREATE INDEX `orders_created_at_idx` ON `orders`(`created_at`);

-- CreateIndex
CREATE INDEX `orders_payment_status_idx` ON `orders`(`payment_status`);

-- CreateIndex
CREATE INDEX `product_attributes_product_id_key_idx` ON `product_attributes`(`product_id`, `key`);

-- CreateIndex
CREATE INDEX `product_images_product_id_sort_order_idx` ON `product_images`(`product_id`, `sort_order`);

-- CreateIndex
CREATE INDEX `product_variants_product_id_price_idx` ON `product_variants`(`product_id`, `price`);

-- CreateIndex
CREATE INDEX `products_status_category_id_idx` ON `products`(`status`, `category_id`);

-- CreateIndex
CREATE INDEX `products_avg_rating_idx` ON `products`(`avg_rating`);

-- CreateIndex
CREATE INDEX `products_created_at_idx` ON `products`(`created_at`);

-- CreateIndex
CREATE INDEX `reviews_product_id_is_approved_idx` ON `reviews`(`product_id`, `is_approved`);

-- CreateIndex
CREATE INDEX `wishlists_customer_id_idx` ON `wishlists`(`customer_id`);

-- AddForeignKey
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_blog_post_id_fkey` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `addresses` RENAME INDEX `addresses_customer_id_fkey` TO `addresses_customer_id_idx`;

-- RenameIndex
ALTER TABLE `cart_items` RENAME INDEX `cart_items_variant_id_fkey` TO `cart_items_variant_id_idx`;

-- RenameIndex
ALTER TABLE `carts` RENAME INDEX `carts_customer_id_fkey` TO `carts_customer_id_idx`;

-- RenameIndex
ALTER TABLE `inventory_stock` RENAME INDEX `inventory_stock_warehouse_id_fkey` TO `inventory_stock_warehouse_id_idx`;

-- RenameIndex
ALTER TABLE `order_items` RENAME INDEX `order_items_order_id_fkey` TO `order_items_order_id_idx`;

-- RenameIndex
ALTER TABLE `order_items` RENAME INDEX `order_items_variant_id_fkey` TO `order_items_variant_id_idx`;

-- RenameIndex
ALTER TABLE `order_status_history` RENAME INDEX `order_status_history_order_id_fkey` TO `order_status_history_order_id_idx`;

-- RenameIndex
ALTER TABLE `returns` RENAME INDEX `returns_customer_id_fkey` TO `returns_customer_id_idx`;

-- RenameIndex
ALTER TABLE `returns` RENAME INDEX `returns_order_id_fkey` TO `returns_order_id_idx`;

-- RenameIndex
ALTER TABLE `reviews` RENAME INDEX `reviews_customer_id_fkey` TO `reviews_customer_id_idx`;

