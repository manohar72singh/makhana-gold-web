import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE orders 
       ADD COLUMN tracking_number VARCHAR(191), 
       ADD COLUMN courier_partner VARCHAR(191), 
       ADD COLUMN tracking_url TEXT`
    );
    console.log("Tracking columns added successfully to orders table");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Duplicate column")) {
      console.log("Tracking columns already exist");
    } else {
      console.log("Info:", msg);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
