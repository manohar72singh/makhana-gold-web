import { prisma } from "../src/lib/db";

async function main() {
  console.log("Safely creating blog_posts table in MySQL...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`blog_posts\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NOT NULL,
      \`slug\` VARCHAR(255) NOT NULL,
      \`excerpt\` TEXT NULL,
      \`content\` LONGTEXT NOT NULL,
      \`cover_image\` VARCHAR(500) NULL,
      \`category\` VARCHAR(191) NOT NULL DEFAULT 'Health & Wellness',
      \`tags\` VARCHAR(255) NULL,
      \`author_name\` VARCHAR(191) NOT NULL DEFAULT 'Makhana Gold Nutritionist',
      \`author_role\` VARCHAR(191) NOT NULL DEFAULT 'Holistic Wellness & Food Science',
      \`author_avatar\` VARCHAR(191) NULL DEFAULT '/images/logo/logo.png',
      \`reading_time_minutes\` INT NOT NULL DEFAULT 5,
      \`is_published\` BOOLEAN NOT NULL DEFAULT true,
      \`featured\` BOOLEAN NOT NULL DEFAULT false,
      \`views_count\` INT NOT NULL DEFAULT 0,
      \`meta_title\` VARCHAR(255) NULL,
      \`meta_description\` TEXT NULL,
      \`meta_keywords\` VARCHAR(500) NULL,
      \`canonical_url\` VARCHAR(500) NULL,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`blog_posts_slug_key\`(\`slug\`),
      INDEX \`blog_posts_is_published_category_idx\`(\`is_published\`, \`category\`),
      INDEX \`blog_posts_created_at_idx\`(\`created_at\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  console.log("Successfully created blog_posts table without modifying any existing data!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
